<?php
namespace StorefrontCore;

if (!defined('ABSPATH')) exit;

class AdminProductsPage {
    public static function init() {
        add_action('admin_menu', [self::class, 'register_admin_menu']);
    }

    public static function register_admin_menu() {
        add_submenu_page(
            'storefront-admin',
            'Products',
            'Products',
            'manage_options',
            'storefront-products',
            [self::class, 'render_products_page']
        );
    }

    public static function render_products_page() {
        $action = isset($_GET['action']) ? $_GET['action'] : 'list';
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($action === 'delete' && $id) {
            check_admin_referer('delete_product_' . $id);
            ProductRepository::delete_product($id);
            wp_safe_redirect(admin_url('admin.php?page=storefront-products&deleted=1'));
            exit;
        }

        if ($action === 'edit' || $action === 'add') {
            self::render_edit_page($id);
        } else {
            self::render_list_page();
        }
    }

    private static function render_list_page() {
        $products = ProductRepository::get_all_products();
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">Products</h1>
            <a href="<?php echo admin_url('admin.php?page=storefront-products&action=add'); ?>" class="page-title-action">Add New</a>
            <hr class="wp-header-end">
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($products as $p) : ?>
                        <tr>
                            <td><strong><?php echo esc_html($p['name']); ?></strong></td>
                            <td><?php echo esc_html($p['slug']); ?></td>
                            <td><?php echo number_format($p['base_price'], 0); ?> RWF</td>
                            <td><?php echo esc_html($p['status']); ?></td>
                            <td>
                                <a href="<?php echo admin_url('admin.php?page=storefront-products&action=edit&id=' . $p['id']); ?>">Edit</a> |
                                <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=storefront-products&action=delete&id=' . $p['id']), 'delete_product_' . $p['id']); ?>" class="submitdelete" onclick="return confirm('Are you sure?')">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    private static function render_edit_page($id) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_product'])) {
            check_admin_referer('save_product');
            $data = [
                'name' => $_POST['name'],
                'slug' => $_POST['slug'],
                'description' => $_POST['description'],
                'base_price' => $_POST['base_price'],
                'status' => $_POST['status'],
            ];
            if ($id) {
                ProductRepository::update_product($id, $data);
            } else {
                $id = ProductRepository::create_product($data);
            }
            
            // Handle variations
            if (isset($_POST['variations'])) {
                foreach ($_POST['variations'] as $v) {
                    if (empty($v['storage_option'])) continue;
                    $v['product_id'] = $id;
                    ProductRepository::save_variation($v);
                }
            }
            if (isset($_POST['delete_variation'])) {
                foreach ($_POST['delete_variation'] as $v_id) {
                    ProductRepository::delete_variation($v_id);
                }
            }
            
            wp_safe_redirect(admin_url('admin.php?page=storefront-products&action=edit&id=' . $id . '&saved=1'));
            exit;
        }

        $product = $id ? ProductRepository::get_product_by_slug($wpdb->get_var($wpdb->prepare("SELECT slug FROM {$wpdb->prefix}storefront_products WHERE id = %d", $id))) : null;
        if ($id && !$product) {
            // Fallback to fetch just product if no slug found or repo fails
            global $wpdb;
            $product = (array)$wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}storefront_products WHERE id = %d", $id), ARRAY_A);
            $product['variations'] = ProductRepository::get_product_variations($id);
        }
        ?>
        <div class="wrap">
            <h1><?php echo $id ? 'Edit Product' : 'Add Product'; ?></h1>
            <form method="POST">
                <?php wp_nonce_field('save_product'); ?>
                <table class="form-table">
                    <tr><th>Name</th><td><input type="text" name="name" value="<?php echo esc_attr($product['name'] ?? ''); ?>" class="regular-text" required></td></tr>
                    <tr><th>Slug</th><td><input type="text" name="slug" value="<?php echo esc_attr($product['slug'] ?? ''); ?>" class="regular-text" required></td></tr>
                    <tr><th>Description</th><td><?php wp_editor($product['description'] ?? '', 'description'); ?></td></tr>
                    <tr><th>Base Price</th><td><input type="number" name="base_price" value="<?php echo esc_attr($product['base_price'] ?? ''); ?>" class="regular-text" required></td></tr>
                    <tr><th>Status</th><td>
                        <select name="status">
                            <option value="active" <?php selected($product['status'] ?? '', 'active'); ?>>Active</option>
                            <option value="inactive" <?php selected($product['status'] ?? '', 'inactive'); ?>>Inactive</option>
                        </select>
                    </td></tr>
                </table>

                <h2>Variations</h2>
                <table class="widefat striped" id="variations-table">
                    <thead><tr><th>Storage</th><th>Color</th><th>Condition</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
                    <tbody>
                        <?php if (!empty($product['variations'])) : foreach ($product['variations'] as $v) : ?>
                            <tr>
                                <input type="hidden" name="variations[<?php echo $v['id']; ?>][id]" value="<?php echo $v['id']; ?>">
                                <td><input type="text" name="variations[<?php echo $v['id']; ?>][storage_option]" value="<?php echo esc_attr($v['storage_option']); ?>"></td>
                                <td><input type="text" name="variations[<?php echo $v['id']; ?>][color]" value="<?php echo esc_attr($v['color']); ?>"></td>
                                <td><input type="text" name="variations[<?php echo $v['id']; ?>][condition_name]" value="<?php echo esc_attr($v['condition_name']); ?>"></td>
                                <td><input type="number" name="variations[<?php echo $v['id']; ?>][price]" value="<?php echo esc_attr($v['price']); ?>"></td>
                                <td><input type="number" name="variations[<?php echo $v['id']; ?>][stock]" value="<?php echo esc_attr($v['stock']); ?>"></td>
                                <td><label><input type="checkbox" name="delete_variation[]" value="<?php echo $v['id']; ?>"> Delete</label></td>
                            </tr>
                        <?php endforeach; endif; ?>
                        <tr class="new-variation">
                            <td><input type="text" name="variations[new][storage_option]" placeholder="e.g. 256GB"></td>
                            <td><input type="text" name="variations[new][color]" placeholder="e.g. Black"></td>
                            <td><input type="text" name="variations[new][condition_name]" placeholder="e.g. New"></td>
                            <td><input type="number" name="variations[new][price]" placeholder="0"></td>
                            <td><input type="number" name="variations[new][stock]" placeholder="0"></td>
                            <td>New</td>
                        </tr>
                    </tbody>
                </table>

                <p class="submit"><input type="submit" name="save_product" class="button button-primary" value="Save Product"></p>
            </form>
        </div>
        <?php
    }
}
