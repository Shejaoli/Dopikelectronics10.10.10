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
    // Activation logic here
    flush_rewrite_rules();
}

function storefront_core_deactivate() {
    // Deactivation logic here
    flush_rewrite_rules();
}

// Load includes
require_once plugin_dir_path(__FILE__) . 'includes/init.php';
