<?php
/**
 * Initialization logic for the Storefront Core plugin.
 */

namespace StorefrontCore;

if (!defined('ABSPATH')) {
    exit;
}

// Load data access layer
require_once __DIR__ . '/ProductRepository.php';
require_once __DIR__ . '/Cart.php';
require_once __DIR__ . '/OrderRepository.php';
require_once __DIR__ . '/AdminOrdersPage.php';

function init() {
    \StorefrontCore\Cart::init();
    
    if (is_admin()) {
        \StorefrontCore\AdminOrdersPage::init();
    }
}
    // Initialization code here
}
add_action('init', __NAMESPACE__ . '\\init');
