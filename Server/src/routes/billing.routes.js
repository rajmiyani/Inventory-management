const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Business = require('../models/Business');
const verifyToken = require('../middleware/auth.middleware');
const { checkInvoiceLimit } = require('../middleware/subscriptionCheck.middleware');
const mongoose = require('mongoose');

// Apply auth middleware to all billing routes
router.use(verifyToken);

// CREATE Invoice (Quota-checked per subscription plan)
router.post('/generate', checkInvoiceLimit, async (req, res) => {
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
                customerId,
                customerName = 'Walk-in Customer',
                customerEmail = '',
                customerPhone = '',
                items,
                totalAmount,
                subtotal,
                tax = 0,
                discount = 0,
                paymentStatus = 'paid',
                paymentMethod = 'cash',
                razorpayPaymentId
            } = req.body;

            if (!items || items.length === 0) {
                return { error: 'No items in invoice', status: 400 };
            }

            // Calculate tax amount and totals per line item
            const formattedItems = items.map(item => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                const taxRate = Number(item.taxRate) || 0;
                const baseTotal = price * quantity;
                const taxAmount = item.taxAmount !== undefined ? Number(item.taxAmount) : ((baseTotal * taxRate) / 100);
                const total = item.total !== undefined ? Number(item.total) : (baseTotal + taxAmount);
                return {
                    productId: item.productId,
                    name: item.name,
                    sku: item.sku || '',
                    hsnCode: item.hsnCode || '',
                    quantity,
                    price,
                    taxRate,
                    taxAmount,
                    total
                };
            });

            const computedSubtotal = subtotal !== undefined ? Number(subtotal) : formattedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const computedTax = tax !== undefined ? Number(tax) : formattedItems.reduce((acc, i) => acc + i.taxAmount, 0);
            const computedTotal = totalAmount !== undefined ? Number(totalAmount) : (computedSubtotal + computedTax - (Number(discount) || 0));

            // Guaranteed collision-free sequential invoice numbering
            const year = new Date().getFullYear();
            const lastInvoice = await Invoice.findOne({ businessId: req.businessId })
                .sort({ createdAt: -1 });

            let seq = 1;
            if (lastInvoice && lastInvoice.invoiceNo) {
                const match = lastInvoice.invoiceNo.match(/-(\d+)$/);
                if (match) {
                    seq = parseInt(match[1], 10) + 1;
                }
            }

            let invoiceNo = `INV-${year}-${String(seq).padStart(4, '0')}`;
            // Double check no collision exists in database
            while (await Invoice.exists({ invoiceNo })) {
                seq++;
                invoiceNo = `INV-${year}-${String(seq).padStart(4, '0')}`;
            }

            const newInvoice = new Invoice({
                businessId: req.businessId,
                invoiceNo,
                customerId: customerId || undefined,
                customerName,
                customerEmail,
                customerPhone,
                cashierId: req.user.id,
                cashierName: req.user.name || 'Cashier',
                items: formattedItems,
                total: computedTotal,
                subtotal: computedSubtotal,
                tax: computedTax,
                discount: Number(discount) || 0,
                paymentStatus,
                paymentMethod,
                notes: razorpayPaymentId ? `Razorpay ID: ${razorpayPaymentId}` : ''
            });

            // Deduct stock for products belonging strictly to this business
            for (const item of items) {
                const product = await Product.findOne({ 
                    _id: item.productId, 
                    businessId: req.businessId 
                }).session(session);

                if (!product) {
                    throw new Error(`Product ${item.name} not found in your inventory`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.name} (Available: ${product.stock}, Requested: ${item.quantity})`);
                }
                product.stock -= item.quantity;
                await product.save({ session });
            }

            // If customer payment is pending/credit, update customer due ledger
            if (customerId && (paymentStatus === 'pending' || paymentMethod === 'credit')) {
                await Customer.findOneAndUpdate(
                    { _id: customerId, businessId: req.businessId },
                    { $inc: { dueBalance: newInvoice.total } },
                    { session }
                );
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
            if (useTransaction && (error.code === 20 || error.message.includes('Transaction numbers'))) {
                console.log('Standalone MongoDB detected, retrying without transaction...');
                return createInvoiceInternal(false);
            }
            // Auto self-heal legacy single-field index invoiceNo_1
            if (error.code === 11000 && (error.message.includes('invoiceNo_1') || error.keyPattern?.invoiceNo)) {
                console.log('Legacy invoiceNo_1 index conflict detected, dropping index and retrying...');
                try {
                    await Invoice.collection.dropIndex('invoiceNo_1');
                    console.log('✓ Successfully dropped legacy index invoiceNo_1');
                } catch (dropErr) {
                    console.log('Note dropping index:', dropErr.message);
                }
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

// GET all invoices for this business
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find({ businessId: req.businessId }).sort({ date: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single invoice scoped to this business
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        
        // Also attach business branding info
        const business = await Business.findById(req.businessId).select('name phone email taxNumber taxRate currency address logoUrl invoiceSettings');
        res.json({ ...invoice.toObject(), business });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
