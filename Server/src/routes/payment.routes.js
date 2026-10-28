const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && 
    process.env.RAZORPAY_KEY_SECRET && 
    !process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY');

const razorpay = hasRazorpayKeys ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
}) : null;

// GET RAZORPAY CONFIG (Public Key ID)
router.get('/config', (req, res) => {
    res.json({ 
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        isConfigured: !!hasRazorpayKeys
    });
});

// CREATE ORDER for POS Billing
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', customerName } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        // Amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(Number(amount) * 100);
        const receipt = `pos_${Date.now()}`;

        if (hasRazorpayKeys && razorpay) {
            const options = {
                amount: amountInPaise,
                currency,
                receipt
            };
            const order = await razorpay.orders.create(options);
            return res.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                isSimulation: false
            });
        }

        // Fallback simulation mode for testing when live keys not in .env
        const mockOrderId = `order_pos_${Date.now()}`;
        res.json({
            orderId: mockOrderId,
            amount: amountInPaise,
            currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
            isSimulation: true
        });
    } catch (error) {
        console.error('Error creating Razorpay billing order:', error);
        res.status(500).json({ error: error.message || 'Payment order creation failed' });
    }
});

// VERIFY PAYMENT
router.post('/verify', (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isSimulation } = req.body;

        if (isSimulation) {
            return res.json({ status: 'success', message: 'Payment verified (Simulation Mode)' });
        }

        if (hasRazorpayKeys) {
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(sign.toString())
                .digest("hex");

            if (razorpay_signature === expectedSign) {
                return res.json({ status: 'success', message: 'Payment verified successfully' });
            } else {
                return res.status(400).json({ status: 'failure', message: 'Invalid payment signature' });
            }
        }

        res.json({ status: 'success', message: 'Payment verified' });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

module.exports = router;
