<?php
function storefront_custom_scripts() {
    wp_enqueue_style('storefront-custom-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'storefront_custom_scripts');
?>
