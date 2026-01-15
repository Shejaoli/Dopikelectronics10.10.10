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

        $payment_method = sanitize_text_field($customer_data['payment_method']);
        $status = 'pending';
        
        if ($payment_method === 'bank_transfer') {
            $status = 'awaiting_payment';
        } elseif ($payment_method === 'whatsapp') {
            $status = 'pending_whatsapp';
        } elseif ($payment_method === 'stripe') {
            $status = 'pending_payment';
        }

        $wpdb->insert(
            $wpdb->prefix . 'storefront_orders',
            [
                'customer_name'  => sanitize_text_field($customer_data['name']),
                'customer_email' => sanitize_email($customer_data['email']),
                'customer_phone' => sanitize_text_field($customer_data['phone']),
                'payment_method' => $payment_method,
                'total_amount'   => $total,
                'status'         => $status
            ],
            ['%s', '%s', '%s', '%s', '%f', '%s']
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

    /**
     * Get all orders.
     *
     * @return array
     */
    public static function get_all_orders() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'storefront_orders';

        $results = $wpdb->get_results(
            "SELECT * FROM $table_name ORDER BY created_at DESC",
            ARRAY_A
        );

        return $results ? $results : [];
    }
}
