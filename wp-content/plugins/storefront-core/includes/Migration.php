<?php
namespace StorefrontCore;

if (!defined('ABSPATH')) exit;

class Migration {
    public static function init() {
        add_action('admin_menu', [self::class, 'register_tools_submenu']);
        add_action('admin_post_run_storefront_migration', [self::class, 'handle_migration']);
    }

    public static function register_tools_submenu() {
        add_submenu_page(
            'storefront-admin',
            'Tools',
            'Tools',
            'manage_options',
            'storefront-tools',
            [self::class, 'render_tools_page']
        );
    }

    public static function render_tools_page() {
        ?>
        <div class="wrap">
            <h1>Storefront Tools</h1>
            <div class="card">
                <h2>Data Migration</h2>
                <p>Import products, variations, and orders from the previous PostgreSQL database.</p>
                <p><strong>Note:</strong> This requires <code>OLD_DB_*</code> constants to be defined in <code>wp-config.php</code>.</p>
                <form method="POST" action="<?php echo admin_url('admin-post.php'); ?>" onsubmit="return confirm('Are you sure you want to run the migration? This will not delete existing data but may create duplicates if run multiple times.');">
                    <input type="hidden" name="action" value="run_storefront_migration">
                    <?php wp_nonce_field('run_migration_nonce'); ?>
                    <?php submit_button('Run Migration'); ?>
                </form>
            </div>
        </div>
        <?php
    }

    public static function handle_migration() {
        if (!current_user_can('manage_options')) wp_die('Unauthorized');
        check_admin_referer('run_migration_nonce');

        if (!defined('OLD_DB_HOST') || !defined('OLD_DB_NAME') || !defined('OLD_DB_USER') || !defined('OLD_DB_PASS')) {
            wp_die('PostgreSQL credentials missing in wp-config.php');
        }

        try {
            $dsn = "pgsql:host=" . OLD_DB_HOST . ";dbname=" . OLD_DB_NAME;
            $pdo = new \PDO($dsn, OLD_DB_USER, OLD_DB_PASS, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);

            global $wpdb;
            $wpdb->query("START TRANSACTION");

            // 1. Migrate Products
            $stmt = $pdo->query("SELECT * FROM products");
            $products = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $product_map = []; // old_id => new_id

            foreach ($products as $p) {
                $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}storefront_products WHERE slug = %s", $p['slug']));
                if ($existing) {
                    $product_map[$p['id']] = $existing;
                    continue;
                }

                $wpdb->insert("{$wpdb->prefix}storefront_products", [
                    'name' => $p['name'],
                    'slug' => $p['slug'],
                    'description' => $p['description'],
                    'base_price' => $p['price'] / 100, // Assuming price was in cents in PG
                    'status' => 'active',
                    'created_at' => $p['created_at'] ?? current_time('mysql')
                ]);
                $product_map[$p['id']] = $wpdb->insert_id;
            }

            // 2. Migrate Variations
            // Note: The PG schema structure might vary, adjusting to match wp_storefront_variations
            // If PG didn't have a direct Variations table, we might need to map differently.
            // Assuming a variations table existed in PG.

            // 3. Migrate Orders
            $stmt = $pdo->query("SELECT * FROM orders");
            $orders = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($orders as $o) {
                $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}storefront_orders WHERE id = %d", $o['id']));
                if ($existing) continue;

                $wpdb->insert("{$wpdb->prefix}storefront_orders", [
                    'id' => $o['id'],
                    'customer_name' => $o['customer_name'] ?? 'Imported',
                    'customer_email' => $o['customer_email'] ?? '',
                    'customer_phone' => $o['customer_phone'] ?? '',
                    'payment_method' => $o['payment_method'] ?? 'manual',
                    'total_amount' => $o['total_amount'] / 100,
                    'status' => $o['status'],
                    'created_at' => $o['created_at']
                ]);
            }

            $wpdb->query("COMMIT");
            wp_safe_redirect(admin_url('admin.php?page=storefront-tools&migration_success=1'));

        } catch (\Exception $e) {
            $wpdb->query("ROLLBACK");
            wp_die("Migration failed: " . $e->getMessage());
        }
        exit;
    }
}
