<?php
/**
 * Template Name: Shop
 */

use StorefrontCore\ProductRepository;

get_header(); ?>

<main class="shop-container">
    <header class="shop-header">
        <h1>Shop</h1>
    </header>

    <div class="product-grid">
        <?php
        $products = ProductRepository::get_all_products();

        if (!empty($products)) :
            foreach ($products as $product) :
                $product_url = home_url('/product/' . $product['slug']);
                ?>
                <article class="product-card">
                    <div class="product-image-placeholder">
                        <!-- Placeholder for product image -->
                        <div class="img-box">No Image</div>
                    </div>
                    
                    <div class="product-details">
                        <h2 class="product-title">
                            <a href="<?php echo esc_url($product_url); ?>">
                                <?php echo esc_html($product['name']); ?>
                            </a>
                        </h2>
                        
                        <p class="product-description">
                            <?php 
                            $description = strip_tags($product['description']);
                            echo esc_html(wp_trim_words($description, 15, '...')); 
                            ?>
                        </p>
                        
                        <div class="product-footer">
                            <span class="product-price">
                                <?php echo esc_html(number_format($product['base_price'], 0, '.', ',')); ?> RWF
                            </span>
                            <a href="<?php echo esc_url($product_url); ?>" class="view-button">View Details</a>
                        </div>
                    </div>
                </article>
            <?php 
            endforeach;
        else :
            echo '<p>No products found.</p>';
        endif; 
        ?>
    </div>
</main>

<style>
.shop-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}
.product-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.product-image-placeholder {
    background: #f5f5f5;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
}
.product-details {
    padding: 1rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
.product-title {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
}
.product-title a {
    text-decoration: none;
    color: #333;
}
.product-description {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
    flex-grow: 1;
}
.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.product-price {
    font-weight: bold;
    color: #222;
}
.view-button {
    background: #333;
    color: #fff;
    padding: 0.5rem 1rem;
    text-decoration: none;
    font-size: 0.8rem;
    border-radius: 4px;
}
</style>

<?php get_footer(); ?>
