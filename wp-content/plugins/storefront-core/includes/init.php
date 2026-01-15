<?php
/**
 * Initialization logic for the Storefront Core plugin.
 */

namespace StorefrontCore;

if (!defined('ABSPATH')) {
    exit;
}

function init() {
    // Initialization code here
}
add_action('init', __NAMESPACE__ . '\\init');
