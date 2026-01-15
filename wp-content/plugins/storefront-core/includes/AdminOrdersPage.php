<?php
namespace StorefrontCore;

if (!defined('ABSPATH')) exit;

class AdminOrdersPage {
    public static function init() {
        add_action('admin_menu', [self::class, 'register_admin_menu']);
    }

    public static function register_admin_menu() {
        add_menu_page(
            'Storefront',
            'Storefront',
            'manage_options',
            'storefront-admin',
            [self::class, 'render_orders_page'],
            'dashicons-cart',
            30
        );

        add_submenu_page(
            'storefront-admin',
            'Orders',
            'Orders',
            'manage_options',
            'storefront-orders',
            [self::class, 'render_orders_page']
        );
    }

    public static function render_orders_page() {
        $orders = OrderRepository::get_all_orders();
        ?>
        <div class="wrap">
            <h1>Storefront Orders</h1>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($orders)) : ?>
                        <?php foreach ($orders as $order) : ?>
                            <tr>
                                <td>#<?php echo esc_html($order['id']); ?></td>
                                <td><?php echo esc_html($order['customer_name']); ?></td>
                                <td><?php echo esc_html($order['customer_email']); ?></td>
                                <td><?php echo esc_html($order['customer_phone']); ?></td>
                                <td><?php echo esc_html(number_format($order['total_amount'], 0, '.', ',')); ?> RWF</td>
                                <td><span class="status-badge status-<?php echo esc_attr($order['status']); ?>"><?php echo esc_html(ucfirst($order['status'])); ?></span></td>
                                <td><?php echo esc_html($order['created_at']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else : ?>
                        <tr>
                            <td colspan="7">No orders found.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <style>
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .status-pending { background: #fff8e5; color: #856404; border: 1px solid #ffeeba; }
        </style>
        <?php
    }
}
