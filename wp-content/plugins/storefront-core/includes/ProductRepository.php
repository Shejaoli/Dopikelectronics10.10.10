<?php
/**
 * Product Repository for data access.
 */

namespace StorefrontCore;

if (!defined('ABSPATH')) {
    exit;
}

class ProductRepository {

    /**
     * Get all active products.
     *
     * @return array
     */
    public static function get_all_products() {
        $cache_key = 'storefront_all_products';
        $products = get_transient($cache_key);
        
        if (false === $products) {
            global $wpdb;
            $table_name = $wpdb->prefix . 'storefront_products';
            $products = $wpdb->get_results(
                "SELECT * FROM $table_name WHERE status = 'active' ORDER BY created_at DESC",
                ARRAY_A
            );
            set_transient($cache_key, $products, HOUR_IN_SECONDS);
        }
        
        return $products ? $products : [];
    }

    /**
     * Get a single product by its slug, including variations.
     *
     * @param string $slug
     * @return array|null
     */
    public static function get_product_by_slug($slug) {
        global $wpdb;
        $table_products = $wpdb->prefix . 'storefront_products';

        $product = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_products WHERE slug = %s LIMIT 1",
                $slug
            ),
            ARRAY_A
        );

        if (!$product) {
            return null;
        }

        $product['variations'] = self::get_product_variations($product['id']);

        return $product;
    }

    /**
     * Get all variations for a specific product.
     *
     * @param int $product_id
     * @return array
     */
    public static function get_product_variations($product_id) {
        global $wpdb;
        $table_variations = $wpdb->prefix . 'storefront_variations';

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_variations WHERE product_id = %d AND stock >= 0 ORDER BY created_at ASC",
                $product_id
            ),
            ARRAY_A
        );

        return $results ? $results : [];
    }

    /**
     * Create a new product.
     */
    public static function create_product($data) {
        delete_transient('storefront_all_products');
        global $wpdb;
        $wpdb->insert(
            $wpdb->prefix . 'storefront_products',
            [
                'name' => sanitize_text_field($data['name']),
                'slug' => sanitize_title($data['slug']),
                'description' => wp_kses_post($data['description']),
                'base_price' => floatval($data['base_price']),
                'status' => sanitize_text_field($data['status']),
            ],
            ['%s', '%s', '%s', '%f', '%s']
        );
        return $wpdb->insert_id;
    }

    /**
     * Update a product.
     */
    public static function update_product($id, $data) {
        delete_transient('storefront_all_products');
        global $wpdb;
        return $wpdb->update(
            $wpdb->prefix . 'storefront_products',
            [
                'name' => sanitize_text_field($data['name']),
                'slug' => sanitize_title($data['slug']),
                'description' => wp_kses_post($data['description']),
                'base_price' => floatval($data['base_price']),
                'status' => sanitize_text_field($data['status']),
            ],
            ['id' => intval($id)],
            ['%s', '%s', '%s', '%f', '%s'],
            ['%d']
        );
    }

    /**
     * Delete a product and its variations.
     */
    public static function delete_product($id) {
        delete_transient('storefront_all_products');
        global $wpdb;
        $wpdb->delete($wpdb->prefix . 'storefront_variations', ['product_id' => intval($id)], ['%d']);
        return $wpdb->delete($wpdb->prefix . 'storefront_products', ['id' => intval($id)], ['%d']);
    }

    /**
     * Save a variation.
     */
    public static function save_variation($data) {
        global $wpdb;
        $table = $wpdb->prefix . 'storefront_variations';
        $variation_data = [
            'product_id' => intval($data['product_id']),
            'storage_option' => sanitize_text_field($data['storage_option']),
            'color' => sanitize_text_field($data['color']),
            'condition_name' => sanitize_text_field($data['condition_name']),
            'price' => floatval($data['price']),
            'stock' => intval($data['stock']),
        ];

        if (!empty($data['id'])) {
            return $wpdb->update($table, $variation_data, ['id' => intval($data['id'])], ['%d', '%s', '%s', '%s', '%f', '%d'], ['%d']);
        } else {
            return $wpdb->insert($table, $variation_data, ['%d', '%s', '%s', '%s', '%f', '%d']);
        }
    }

    /**
     * Delete a variation.
     */
    public static function delete_variation($id) {
        global $wpdb;
        return $wpdb->delete($wpdb->prefix . 'storefront_variations', ['id' => intval($id)], ['%d']);
    }
}
