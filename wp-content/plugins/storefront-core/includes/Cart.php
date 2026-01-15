<?php
/**
 * Cart management class.
 */

namespace StorefrontCore;

if (!defined('ABSPATH')) {
    exit;
}

class Cart {

    /**
     * Initialize the cart session.
     */
    public static function init() {
        if (!session_id()) {
            session_start();
        }

        if (!isset($_SESSION['storefront_cart'])) {
            $_SESSION['storefront_cart'] = [];
        }

        self::handle_cart_actions();
    }

    /**
     * Handle cart POST actions (add, update, remove).
     */
    private static function handle_cart_actions() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return;
        }

        // Add to cart
        if (isset($_POST['storefront_add_to_cart'])) {
            $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
            $variation_id = isset($_POST['variation_id']) ? intval($_POST['variation_id']) : 0;
            $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;

            if ($product_id > 0 && $variation_id > 0 && $quantity > 0) {
                self::add_item($product_id, $variation_id, $quantity);
                wp_safe_redirect(add_query_arg('added-to-cart', $variation_id, wp_get_referer()));
                exit;
            }
        }

        // Update quantity
        if (isset($_POST['update_cart']) && check_admin_referer('storefront_cart_action')) {
            $quantities = isset($_POST['cart_qty']) ? $_POST['cart_qty'] : [];
            foreach ($quantities as $variation_id => $qty) {
                self::update_quantity(intval($variation_id), intval($qty));
            }
            wp_safe_redirect(home_url('/cart/?updated=1'));
            exit;
        }

        // Remove item
        if (isset($_POST['remove_item']) && check_admin_referer('storefront_cart_action')) {
            $variation_id = intval($_POST['remove_item']);
            self::remove_item($variation_id);
            wp_safe_redirect(home_url('/cart/?removed=1'));
            exit;
        }
    }

    /**
     * Update item quantity in cart.
     */
    public static function update_quantity($variation_id, $quantity) {
        if (isset($_SESSION['storefront_cart'][$variation_id])) {
            if ($quantity <= 0) {
                self::remove_item($variation_id);
            } else {
                $_SESSION['storefront_cart'][$variation_id]['quantity'] = $quantity;
            }
            return true;
        }
        return false;
    }

    /**
     * Add an item to the cart.
     */
    public static function add_item($product_id, $variation_id, $quantity) {
        global $wpdb;

        // Validate product and variation existence
        $table_products = $wpdb->prefix . 'storefront_products';
        $table_variations = $wpdb->prefix . 'storefront_variations';

        $product = $wpdb->get_row($wpdb->prepare("SELECT name FROM $table_products WHERE id = %d", $product_id), ARRAY_A);
        $variation = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_variations WHERE id = %d AND product_id = %d AND stock > 0", $variation_id, $product_id), ARRAY_A);

        if (!$product || !$variation) {
            return false;
        }

        $cart = $_SESSION['storefront_cart'];

        if (isset($cart[$variation_id])) {
            $cart[$variation_id]['quantity'] += $quantity;
        } else {
            $cart[$variation_id] = [
                'product_id'   => $product_id,
                'variation_id' => $variation_id,
                'quantity'     => $quantity,
                'price'        => $variation['price'],
                'name'         => $product['name'],
                'options'      => [
                    'storage'   => $variation['storage_option'],
                    'color'     => $variation['color'],
                    'condition' => $variation['condition_name'],
                ],
            ];
        }

        $_SESSION['storefront_cart'] = $cart;
        return true;
    }

    /**
     * Remove an item from the cart.
     */
    public static function remove_item($variation_id) {
        if (isset($_SESSION['storefront_cart'][$variation_id])) {
            unset($_SESSION['storefront_cart'][$variation_id]);
            return true;
        }
        return false;
    }

    /**
     * Get all cart items.
     */
    public static function get_items() {
        return isset($_SESSION['storefront_cart']) ? $_SESSION['storefront_cart'] : [];
    }

    /**
     * Clear the cart.
     */
    public static function clear_cart() {
        $_SESSION['storefront_cart'] = [];
    }
}
