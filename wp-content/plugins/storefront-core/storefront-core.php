<?php
/**
 * Plugin Name: Storefront Core
 * Description: Custom store logic for products, cart, and orders.
 * Version: 1.0
 * Author: DOPIK ELECTRONICS
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit;
}

// Register activation and deactivation hooks
register_activation_hook(__FILE__, 'storefront_core_activate');
register_deactivation_hook(__FILE__, 'storefront_core_deactivate');

function storefront_core_activate() {
    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // Products table
    $table_products = $wpdb->prefix . 'storefront_products';
    $sql_products = "CREATE TABLE $table_products (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        slug varchar(255) NOT NULL,
        description text,
        base_price decimal(10,2) NOT NULL,
        status varchar(50) DEFAULT 'active' NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    dbDelta($sql_products);

    // Variations table
    $table_variations = $wpdb->prefix . 'storefront_variations';
    $sql_variations = "CREATE TABLE $table_variations (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        product_id bigint(20) NOT NULL,
        storage_option varchar(100),
        color varchar(100),
        condition_name varchar(100),
        price decimal(10,2) NOT NULL,
        stock int(11) DEFAULT 0 NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    dbDelta($sql_variations);

    flush_rewrite_rules();
}

function storefront_core_deactivate() {
    // Deactivation logic here
    flush_rewrite_rules();
}

// Load includes
require_once plugin_dir_path(__FILE__) . 'includes/init.php';
