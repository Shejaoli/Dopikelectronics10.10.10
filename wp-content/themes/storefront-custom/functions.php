<?php
function storefront_custom_scripts() {
    wp_enqueue_style('storefront-custom-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'storefront_custom_scripts');

/**
 * Custom routing for /product/{slug}
 */
function storefront_custom_rewrite_rules() {
    add_rewrite_rule('product/([^/]+)/?$', 'index.php?product_slug=$matches[1]', 'top');
}
add_action('init', 'storefront_custom_rewrite_rules');

function storefront_custom_query_vars($vars) {
    $vars[] = 'product_slug';
    return $vars;
}
add_filter('query_vars', 'storefront_custom_query_vars');

function storefront_custom_template_include($template) {
    if (get_query_var('product_slug')) {
        return locate_template('single-product.php');
    }
    return $template;
}
add_filter('template_include', 'storefront_custom_template_include');
?>
