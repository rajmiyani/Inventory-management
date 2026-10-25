const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
// In a real app, use process.env.RAZORPAY_KEY_ID and process.env.RAZORPAY_KEY_SECRET
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE'
});

// GET RAZORPAY CONFIG (Public ID)
router.get('/config', (req, res) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE' });
});

// CREATE ORDER
router.post('/create-order', async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys not missing in environment');
            return res.status(500).json({ error: 'Payment gateway not configured' });
        }

        const { amount, currency } = req.body;

        const options = {
            amount: amount, // Amount in smallest currency unit (e.g., paise)
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Something went wrong while creating order' });
    }
});

// VERIFY PAYMENT
router.post('/verify', (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            res.json({ status: 'success', message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ status: 'failure', message: 'Invalid signature sent!' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
