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
                'name'           => $_POST['customer_name'],
                'email'          => $_POST['customer_email'],
                'phone'          => $_POST['customer_phone'],
                'payment_method' => $_POST['payment_method']
            ];
            
            $order_id = OrderRepository::create_order($customer_data, $cart_items);
            if ($order_id) {
                if ($customer_data['payment_method'] === 'whatsapp') {
                    // ... existing whatsapp logic ...
                    $message = "New Order #" . $order_id . "\n";
                    $message .= "Customer: " . $customer_data['name'] . " (" . $customer_data['phone'] . ")\n";
                    $message .= "Items:\n";
                    $total = 0;
                    foreach ($cart_items as $item) {
                        $line_total = $item['price'] * $item['quantity'];
                        $message .= "- " . $item['name'] . " (" . implode(', ', $item['options']) . ") x " . $item['quantity'] . ": " . number_format($line_total, 0) . " RWF\n";
                        $total += $line_total;
                    }
                    $message .= "Total: " . number_format($total, 0) . " RWF";
                    
                    Cart::clear_cart();
                    $wa_url = "https://wa.me/250780000000?text=" . urlencode($message); // Example phone
                    wp_redirect($wa_url);
                    exit;
                } elseif ($customer_data['payment_method'] === 'stripe') {
                    $total = 0;
                    foreach ($cart_items as $item) {
                        $total += $item['price'] * $item['quantity'];
                    }
                    $stripe_url = StripeGateway::create_checkout_session($order_id, $total);
                    if ($stripe_url) {
                        Cart::clear_cart();
                        wp_redirect($stripe_url);
                        exit;
                    }
                }
                
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

            <div class="payment-methods">
                <h3>Payment Method</h3>
                <div class="method-option">
                    <label>
                        <input type="radio" name="payment_method" value="cod" required checked>
                        Cash on Delivery
                    </label>
                </div>
                <div class="method-option">
                    <label>
                        <input type="radio" name="payment_method" value="whatsapp" required>
                        WhatsApp Confirmation
                    </label>
                </div>
                <div class="method-option">
                    <label>
                        <input type="radio" name="payment_method" value="bank_transfer" required>
                        Bank Transfer
                    </label>
                </div>
                <div class="method-option">
                    <label>
                        <input type="radio" name="payment_method" value="stripe" required>
                        Card Payment (Stripe)
                    </label>
                </div>
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
.payment-methods { margin: 2rem 0; padding: 1.5rem; border: 1px solid #eee; border-radius: 8px; }
.method-option { margin-bottom: 0.5rem; }
.method-option label { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.place-order-btn { width: 100%; padding: 1rem; background: #333; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
.thank-you { text-align: center; padding: 4rem 0; }
</style>

<?php get_footer(); ?>
