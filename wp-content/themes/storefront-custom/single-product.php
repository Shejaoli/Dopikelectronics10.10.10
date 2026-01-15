<?php
/**
 * Template Name: Single Product
 */

use StorefrontCore\ProductRepository;

get_header();

// Extract slug from URL or global variable if handled by a router
// For now, we assume a simple query var or global setup for this conversion step
$slug = get_query_var('product_slug');

if (!$slug) {
    // Fallback for direct template testing or if routing isn't set up yet
    global $wp_query;
    $slug = isset($wp_query->query_vars['product_slug']) ? $wp_query->query_vars['product_slug'] : '';
}

$product = ProductRepository::get_product_by_slug($slug);

if (!$product) :
    global $wp_query;
    $wp_query->set_404();
    status_header(404);
    get_template_part('404');
    get_footer();
    exit;
endif;

$variations = $product['variations'];

// Group variations by specific attributes if needed
$storage_options = array_unique(array_column($variations, 'storage_option'));
$colors = array_unique(array_column($variations, 'color'));
$conditions = array_unique(array_column($variations, 'condition_name'));

?>

<main class="product-detail-container">
    <div class="product-layout">
        <div class="product-gallery">
            <div class="image-placeholder">No Image</div>
        </div>

        <div class="product-info">
            <h1 class="product-title"><?php echo esc_html($product['name']); ?></h1>
            <p class="base-price">Starting from: <?php echo esc_html(number_format($product['base_price'], 0, '.', ',')); ?> RWF</p>
            
            <div class="product-description">
                <?php echo wp_kses_post(wpautop($product['description'])); ?>
            </div>

            <?php if (!empty($variations)) : ?>
                <form class="variation-selector">
                    <div class="variation-group">
                        <h3>Storage</h3>
                        <div class="options-list">
                            <?php foreach ($storage_options as $option) : ?>
                                <label class="option-item">
                                    <input type="radio" name="storage" value="<?php echo esc_attr($option); ?>">
                                    <span><?php echo esc_html($option); ?></span>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="variation-group">
                        <h3>Color</h3>
                        <div class="options-list">
                            <?php foreach ($colors as $color) : ?>
                                <label class="option-item color-swatch">
                                    <input type="radio" name="color" value="<?php echo esc_attr($color); ?>">
                                    <span style="background-color: <?php echo esc_attr($color); ?>;" title="<?php echo esc_attr($color); ?>"></span>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="variation-group">
                        <h3>Condition</h3>
                        <div class="options-list">
                            <?php foreach ($conditions as $condition) : ?>
                                <label class="option-item">
                                    <input type="radio" name="condition" value="<?php echo esc_attr($condition); ?>">
                                    <span><?php echo esc_html($condition); ?></span>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="variations-table-container">
                        <h3>Available Variations</h3>
                        <table class="variations-table">
                            <thead>
                                <tr>
                                    <th>Option</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($variations as $v) : ?>
                                    <tr class="<?php echo $v['stock'] <= 0 ? 'out-of-stock' : ''; ?>">
                                        <td>
                                            <?php echo esc_html($v['storage_option'] . ' - ' . $v['color'] . ' (' . $v['condition_name'] . ')'); ?>
                                        </td>
                                        <td><?php echo esc_html(number_format($v['price'], 0, '.', ',')); ?> RWF</td>
                                        <td>
                                            <?php if ($v['stock'] > 0) : ?>
                                                <span class="stock-status in-stock">In Stock</span>
                                            <?php else : ?>
                                                <span class="stock-status out-of-stock">Out of Stock</span>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </form>
            <?php endif; ?>
        </div>
    </div>
</main>

<style>
.product-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}
.product-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
}
@media (max-width: 768px) {
    .product-layout { grid-template-columns: 1fr; }
}
.image-placeholder {
    background: #f5f5f5;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: #999;
}
.product-title { font-size: 2.5rem; margin-bottom: 0.5rem; }
.base-price { font-size: 1.5rem; color: #222; font-weight: bold; margin-bottom: 2rem; }
.variation-group { margin-bottom: 1.5rem; }
.variation-group h3 { font-size: 1rem; margin-bottom: 0.75rem; color: #666; }
.options-list { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.option-item input { display: none; }
.option-item span {
    display: inline-block;
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
}
.option-item input:checked + span {
    border-color: #333;
    background: #333;
    color: #fff;
}
.color-swatch span {
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 50%;
}
.variations-table-container { margin-top: 2rem; }
.variations-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.variations-table th, .variations-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
}
.variations-table tr.out-of-stock { opacity: 0.5; }
.stock-status { font-size: 0.8rem; font-weight: bold; }
.stock-status.in-stock { color: green; }
.stock-status.out-of-stock { color: red; }
</style>

<?php get_footer(); ?>
