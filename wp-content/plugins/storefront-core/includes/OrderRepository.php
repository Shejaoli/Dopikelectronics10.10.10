<?php
namespace StorefrontCore;

if (!defined('ABSPATH')) exit;

class OrderRepository {
    public static function create_order($customer_data, $cart_items) {
        global $wpdb;
        
        $total = 0;
        foreach ($cart_items as $item) {
            $total += $item['price'] * $item['quantity'];
        }

        $wpdb->insert(
            $wpdb->prefix . 'storefront_orders',
            [
                'customer_name'  => sanitize_text_field($customer_data['name']),
                'customer_email' => sanitize_email($customer_data['email']),
                'customer_phone' => sanitize_text_field($customer_data['phone']),
                'total_amount'   => $total,
                'status'         => 'pending'
            ],
            ['%s', '%s', '%s', '%f', '%s']
        );

        $order_id = $wpdb->insert_id;

        foreach ($cart_items as $item) {
            $wpdb->insert(
                $wpdb->prefix . 'storefront_order_items',
                [
                    'order_id'     => $order_id,
                    'product_id'   => $item['product_id'],
                    'variation_id' => $item['variation_id'],
                    'quantity'     => $item['quantity'],
                    'price'        => $item['price']
                ],
                ['%d', '%d', '%d', '%d', '%f']
            );
        }

        return $order_id;
    }
}
