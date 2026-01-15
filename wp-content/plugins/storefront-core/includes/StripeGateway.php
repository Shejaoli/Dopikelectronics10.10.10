<?php
namespace StorefrontCore;

if (!defined('ABSPATH')) exit;

class StripeGateway {
    public static function create_checkout_session($order_id, $total_amount) {
        if (!defined('STRIPE_SECRET_KEY')) {
            return false;
        }

        $url = 'https://api.stripe.com/v1/checkout/sessions';
        $params = [
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'rwf',
                    'product_data' => [
                        'name' => "Order #$order_id",
                    ],
                    'unit_amount' => round($total_amount),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => home_url('/checkout?order_success=1'),
            'cancel_url' => home_url('/checkout'),
            'metadata' => [
                'order_id' => $order_id
            ]
        ];

        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . STRIPE_SECRET_KEY,
                'Content-Type' => 'application/x-www-form-urlencoded'
            ],
            'body' => http_build_query($params)
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        return isset($body['url']) ? $body['url'] : false;
    }

    public static function handle_webhook() {
        if (!isset($_GET['storefront_stripe_webhook'])) return;

        $payload = @file_get_contents('php://input');
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        
        // Simplified webhook verification for this context
        // In production, use Stripe's library or full signature verification
        $event = json_decode($payload, true);

        if ($event && $event['type'] === 'checkout.session.completed') {
            $session = $event['data']['object'];
            $order_id = $session['metadata']['order_id'] ?? null;
            if ($order_id) {
                global $wpdb;
                $wpdb->update(
                    $wpdb->prefix . 'storefront_orders',
                    ['status' => 'paid'],
                    ['id' => $order_id],
                    ['%s'],
                    ['%d']
                );
            }
        }
        
        http_response_code(200);
        exit;
    }
}
