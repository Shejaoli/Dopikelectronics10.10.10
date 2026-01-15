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

function init() {
    // Initialization code here
}
add_action('init', __NAMESPACE__ . '\\init');
