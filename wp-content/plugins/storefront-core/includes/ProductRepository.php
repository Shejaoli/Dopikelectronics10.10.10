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
        global $wpdb;
        $table_name = $wpdb->prefix . 'storefront_products';

        $results = $wpdb->get_results(
            "SELECT * FROM $table_name WHERE status = 'active' ORDER BY created_at DESC",
            ARRAY_A
        );

        return $results ? $results : [];
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
}
