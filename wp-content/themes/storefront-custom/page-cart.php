<?php
/**
 * Template Name: Cart
 */

use StorefrontCore\Cart;

get_header(); ?>

<main class="cart-container">
    <header class="cart-header">
        <h1>Your Cart</h1>
    </header>

    <?php $items = Cart::get_items(); ?>

    <?php if (!empty($items)) : ?>
        <form method="POST" action="">
            <?php wp_nonce_field('storefront_cart_action'); ?>
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php 
                    $total = 0;
                    foreach ($items as $variation_id => $item) : 
                        $subtotal = $item['price'] * $item['quantity'];
                        $total += $subtotal;
                        ?>
                        <tr>
                            <td>
                                <strong><?php echo esc_html($item['name']); ?></strong>
                                <div class="item-options">
                                    <small>
                                        <?php echo esc_html($item['options']['storage'] . ' | ' . $item['options']['color'] . ' | ' . $item['options']['condition']); ?>
                                    </small>
                                </div>
                            </td>
                            <td><?php echo esc_html(number_format($item['price'], 0, '.', ',')); ?> RWF</td>
                            <td>
                                <input type="number" name="cart_qty[<?php echo esc_attr($variation_id); ?>]" value="<?php echo esc_attr($item['quantity']); ?>" min="1" class="qty-input">
                            </td>
                            <td><?php echo esc_html(number_format($subtotal, 0, '.', ',')); ?> RWF</td>
                            <td>
                                <button type="submit" name="remove_item" value="<?php echo esc_attr($variation_id); ?>" class="remove-btn">Remove</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-right"><strong>Total:</strong></td>
                        <td colspan="2"><strong><?php echo esc_html(number_format($total, 0, '.', ',')); ?> RWF</strong></td>
                    </tr>
                </tfoot>
            </table>

            <div class="cart-actions">
                <a href="<?php echo esc_url(home_url('/shop')); ?>" class="continue-btn">Continue Shopping</a>
                <button type="submit" name="update_cart" class="update-btn">Update Cart</button>
                <a href="#" class="checkout-btn">Proceed to Checkout</a>
            </div>
        </form>
    <?php else : ?>
        <div class="empty-cart">
            <p>Your cart is empty.</p>
            <a href="<?php echo esc_url(home_url('/shop')); ?>" class="continue-btn">Browse Products</a>
        </div>
    <?php endif; ?>
</main>

<style>
.cart-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
.cart-table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
.cart-table th, .cart-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
.qty-input { width: 60px; padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px; }
.text-right { text-align: right; }
.cart-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; gap: 1rem; }
.remove-btn { background: #ff4d4d; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; }
.continue-btn, .update-btn, .checkout-btn { text-decoration: none; padding: 0.8rem 1.5rem; border-radius: 4px; font-weight: bold; cursor: pointer; }
.continue-btn { border: 1px solid #333; color: #333; }
.update-btn { background: #eee; color: #333; border: 1px solid #ddd; }
.checkout-btn { background: #333; color: white; border: none; }
.empty-cart { text-align: center; padding: 4rem 0; }
</style>

<?php get_footer(); ?>
