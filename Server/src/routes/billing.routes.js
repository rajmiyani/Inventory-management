const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const verifyToken = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Apply auth middleware to all billing routes
router.use(verifyToken);

// CREATE Invoice
router.post('/generate', async (req, res) => {
    const createInvoiceInternal = async (useTransaction = true) => {
        let session = null;
        if (useTransaction) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (e) {
                session = null;
            }
        }

        try {
            const {
                customerName,
                customerEmail,
                customerPhone,
                items,
                totalAmount,
                subtotal,
                tax,
                paymentStatus,
                paymentMethod,
                razorpayPaymentId
            } = req.body;

            if (!items || items.length === 0) {
                return { error: 'No items in invoice', status: 400 };
            }

            const count = await Invoice.countDocuments();
            const invoiceNo = `INV-${Date.now()}-${count + 1}`;

            const newInvoice = new Invoice({
                invoiceNo,
                customerName,
                customerEmail,
                customerPhone,
                items,
                total: totalAmount,
                subtotal,
                tax,
                paymentStatus,
                paymentMethod,
                notes: razorpayPaymentId ? `Razorpay ID: ${razorpayPaymentId}` : ''
            });

            // Deduct stock
            for (const item of items) {
                const product = await Product.findById(item.productId).session(session);
                if (!product) {
                    throw new Error(`Product ${item.name} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.name}`);
                }
                product.stock -= item.quantity;
                await product.save({ session });
            }

            await newInvoice.save({ session });

            if (session) {
                await session.commitTransaction();
            }

            return { data: newInvoice, status: 201 };
        } catch (error) {
            if (session) {
                await session.abortTransaction();
            }
            // If error is about transactions not being supported, retry without transaction
            if (useTransaction && (error.code === 20 || error.message.includes('Transaction numbers'))) {
                console.log('Standalone MongoDB detected, retrying without transaction...');
                return createInvoiceInternal(false);
            }
            console.error('Invoice generation error:', error);
            return { error: error.message, status: 400 };
        } finally {
            if (session) {
                session.endSession();
            }
        }
    };

    const result = await createInvoiceInternal();
    if (result.error) {
        res.status(result.status).json({ error: result.error });
    } else {
        res.status(result.status).json(result.data);
    }
});

// GET all invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ date: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
