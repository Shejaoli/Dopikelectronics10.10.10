<?php
/**
 * Template Name: Checkout
 */

use StorefrontCore\Cart;
use StorefrontCore\OrderRepository;

get_header();

$cart_items = Cart::get_items();
$order_success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['storefront_checkout_nonce'])) {
    if (wp_verify_nonce($_POST['storefront_checkout_nonce'], 'storefront_checkout')) {
        if (!empty($cart_items)) {
            $customer_data = [
                'name'  => $_POST['customer_name'],
                'email' => $_POST['customer_email'],
                'phone' => $_POST['customer_phone']
            ];
            
            $order_id = OrderRepository::create_order($customer_data, $cart_items);
            if ($order_id) {
                Cart::clear_cart();
                $order_success = true;
            }
        }
    }
}
?>

<main class="checkout-container">
    <?php if ($order_success) : ?>
        <div class="thank-you">
            <h1>Thank you for your order!</h1>
            <p>Your order ID is: #<?php echo $order_id; ?></p>
            <a href="<?php echo home_url('/shop'); ?>">Return to Shop</a>
        </div>
    <?php elseif (empty($cart_items)) : ?>
        <div class="empty-checkout">
            <p>Your cart is empty. Please add items before checking out.</p>
            <a href="<?php echo home_url('/shop'); ?>">Go to Shop</a>
        </div>
    <?php else : ?>
        <h1>Checkout</h1>
        <form method="POST" action="" class="checkout-form">
            <?php wp_nonce_field('storefront_checkout', 'storefront_checkout_nonce'); ?>
            
            <div class="form-group">
                <label for="customer_name">Full Name</label>
                <input type="text" name="customer_name" id="customer_name" required>
            </div>

            <div class="form-group">
                <label for="customer_email">Email Address</label>
                <input type="email" name="customer_email" id="customer_email" required>
            </div>

            <div class="form-group">
                <label for="customer_phone">Phone Number</label>
                <input type="tel" name="customer_phone" id="customer_phone" required>
            </div>

            <div class="order-summary">
                <h3>Order Summary</h3>
                <?php $total = 0; foreach ($cart_items as $item) : $total += $item['price'] * $item['quantity']; ?>
                    <div class="summary-item">
                        <span><?php echo esc_html($item['name']); ?> x <?php echo $item['quantity']; ?></span>
                        <span><?php echo number_format($item['price'] * $item['quantity'], 0, '.', ','); ?> RWF</span>
                    </div>
                <?php endforeach; ?>
                <div class="summary-total">
                    <strong>Total:</strong>
                    <strong><?php echo number_format($total, 0, '.', ','); ?> RWF</strong>
                </div>
            </div>

            <button type="submit" class="place-order-btn">Place Order</button>
        </form>
    <?php endif; ?>
</main>

<style>
.checkout-container { max-width: 600px; margin: 0 auto; padding: 2rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px; }
.order-summary { background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; }
.summary-item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.summary-total { display: flex; justify-content: space-between; margin-top: 1rem; border-top: 1px solid #ddd; padding-top: 1rem; font-size: 1.2rem; }
.place-order-btn { width: 100%; padding: 1rem; background: #333; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
.thank-you { text-align: center; padding: 4rem 0; }
</style>

<?php get_footer(); ?>
