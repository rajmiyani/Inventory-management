import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
    Search,
    Trash2,
    Plus,
    Minus,
    Receipt,
    UserPlus,
    ShoppingCart,
    CreditCard,
    Banknote,
    Printer,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Package,
    ShieldCheck,
    X
} from 'lucide-react';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'razorpay'
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [simulationModal, setSimulationModal] = useState(null); // { orderId, amount, keyId }
    const searchInputRef = useRef(null);
    const { showSuccess, showError, showWarning } = useToast();

    useEffect(() => {
        fetchProducts();
        if (searchInputRef.current) searchInputRef.current.focus();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/inventory');
            setProducts(res.data);
        } catch (error) {
            showError('Failed to fetch inventory');
        }
    };

    // Load Razorpay Checkout SDK
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.productId === product._id);
        const taxRate = Number(product.taxRate) || 0;
        const price = Number(product.price) || 0;

        if (existing) {
            if (existing.quantity >= product.stock) {
                showWarning(`Only ${product.stock} units available in stock!`);
                return;
            }
            const newQty = existing.quantity + 1;
            const baseSubtotal = newQty * price;
            const taxAmount = (baseSubtotal * (existing.taxRate || 0)) / 100;
            const total = baseSubtotal + taxAmount;

            setCart(cart.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: newQty, taxAmount, total }
                    : item
            ));
        } else {
            if (product.stock <= 0) {
                showWarning('Product is currently out of stock!');
                return;
            }
            const baseSubtotal = price * 1;
            const taxAmount = (baseSubtotal * taxRate) / 100;
            const total = baseSubtotal + taxAmount;

            setCart([...cart, {
                productId: product._id,
                name: product.name,
                sku: product.sku || '',
                price: price,
                quantity: 1,
                taxRate: taxRate,
                taxAmount: taxAmount,
                total: total
            }]);
        }
        setSearchTerm('');
        setShowResults(false);
        if (searchInputRef.current) searchInputRef.current.focus();
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.productId === id) {
                const product = products.find(p => p._id === id);
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null;
                if (product && newQty > product.stock) {
                    showWarning('Cannot exceed available stock level');
                    return item;
                }
                const baseSubtotal = newQty * item.price;
                const taxAmount = (baseSubtotal * (item.taxRate || 0)) / 100;
                const total = baseSubtotal + taxAmount;
                return { ...item, quantity: newQty, taxAmount, total };
            }
            return item;
        }).filter(Boolean));
    };

    const updateItemTaxRate = (id, newRate) => {
        const rate = Math.max(0, Number(newRate) || 0);
        setCart(cart.map(item => {
            if (item.productId === id) {
                const baseSubtotal = item.quantity * item.price;
                const taxAmount = (baseSubtotal * rate) / 100;
                const total = baseSubtotal + taxAmount;
                return { ...item, taxRate: rate, taxAmount, total };
            }
            return item;
        }));
    };

    // Calculate Cart Totals
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = cart.reduce((acc, item) => acc + (item.taxAmount || 0), 0);
    const total = subtotal + tax;

    // Internal helper to create invoice ONLY after payment is confirmed
    const executeInvoiceGeneration = async (paymentRefId = null) => {
        try {
            setLoading(true);
            const res = await api.post('/billing/generate', {
                customerName: customer.name || 'Walk-in Customer',
                customerEmail: customer.email,
                customerPhone: customer.phone,
                items: cart,
                subtotal,
                tax,
                totalAmount: total,
                paymentMethod,
                paymentStatus: 'paid',
                razorpayPaymentId: paymentRefId || undefined
            });

            showSuccess('Transaction completed & Invoice generated successfully!');
            setCart([]);
            setCustomer({ name: '', email: '', phone: '' });
            fetchProducts(); // Refresh stock

            // Open invoice view
            window.open(`/billing/invoice/${res.data._id}`, '_blank');
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    };

    // Razorpay Online Payment Flow
    const handleRazorpayCheckout = async () => {
        try {
            setLoading(true);
            // 1. Create order on backend
            const orderRes = await api.post('/payment/create-order', {
                amount: total,
                currency: 'INR',
                customerName: customer.name || 'Walk-in Customer'
            });

            const { orderId, amount, currency, keyId, isSimulation } = orderRes.data;

            // In simulation mode (e.g. test environment or missing Razorpay keys)
            if (isSimulation) {
                setLoading(false);
                setSimulationModal({
                    orderId,
                    amount: total,
                    keyId
                });
                return;
            }

            // Real Live Razorpay Gateway
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setLoading(false);
                showError('Failed to load Razorpay payment gateway. Please check internet connection.');
                return;
            }

            const options = {
                key: keyId,
                amount: amount,
                currency: currency || 'INR',
                name: 'POS Online Billing',
                description: `Invoice for ${customer.name || 'Customer'} (Total: ₹${total.toFixed(2)})`,
                order_id: orderId,
                prefill: {
                    name: customer.name || '',
                    email: customer.email || '',
                    contact: customer.phone || ''
                },
                theme: {
                    color: '#2563EB'
                },
                handler: async function (response) {
                    try {
                        setLoading(true);
                        // Verify payment with server
                        const verifyRes = await api.post('/payment/verify', response);
                        if (verifyRes.data.status === 'success') {
                            // ONLY GENERATE INVOICE AFTER PAYMENT VERIFIED!
                            await executeInvoiceGeneration(response.razorpay_payment_id);
                        } else {
                            showError('Payment verification failed. Invoice was NOT generated.');
                        }
                    } catch (err) {
                        showError(err.response?.data?.error || 'Payment verification failed');
                    } finally {
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        showWarning('Razorpay payment cancelled. No invoice was created.');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            setLoading(false);
            showError(error.response?.data?.error || 'Failed to initiate Razorpay payment');
        }
    };

    // Confirms payment in simulation mode
    const confirmSimulationPayment = async () => {
        if (!simulationModal) return;
        try {
            setLoading(true);
            const simPaymentId = `pay_sim_${Date.now()}`;
            // 1. Verify simulated payment
            await api.post('/payment/verify', {
                razorpay_order_id: simulationModal.orderId,
                razorpay_payment_id: simPaymentId,
                razorpay_signature: 'simulated_sig',
                isSimulation: true
            });
            setSimulationModal(null);
            // 2. Now generate invoice
            await executeInvoiceGeneration(simPaymentId);
        } catch (err) {
            showError(err.response?.data?.error || 'Payment verification failed');
            setLoading(false);
        }
    };

    const cancelSimulationPayment = () => {
        setSimulationModal(null);
        showWarning('Online payment cancelled. No invoice generated.');
    };

    const handleSubmit = async () => {
        if (cart.length === 0) return showWarning('Your cart is empty');

        if (paymentMethod === 'razorpay') {
            await handleRazorpayCheckout();
        } else {
            // Cash direct payment
            await executeInvoiceGeneration();
        }
    };

    const filteredProducts = searchTerm.trim() ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="fade-in pb-5">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Point of Sale</h2>
                    <p className="text-secondary mb-0">Create professional bills with line-item tax details and instant Razorpay payment.</p>
                </div>
                <div className="badge border px-3 py-2 bg-white rounded-pill shadow-sm d-flex align-items-center gap-2">
                    <div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div>
                    <span className="text-secondary text-xs fw-bold">Live Inventory Sync</span>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {/* Search & Selection */}
                    <div className="card-pro p-4 mb-4 border-0 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                <Search size={20} className="text-primary" />
                                <span>Search Products</span>
                            </h5>
                        </div>

                        <div className="position-relative">
                            <div className="input-group-pro">
                                <span className="input-group-icon">
                                    <Search size={22} className="text-secondary opacity-50" />
                                </span>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="form-control-pro"
                                    placeholder="Type product name or scan SKU / Barcode..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn btn-link text-secondary p-0 me-3"
                                        onClick={() => { setSearchTerm(''); setShowResults(false); }}
                                    >
                                        <AlertCircle size={18} />
                                    </button>
                                )}
                            </div>

                            {showResults && filteredProducts.length > 0 && (
                                <div className="results-dropdown shadow-xl border rounded-4 z-3 mt-2 overflow-hidden bg-white">
                                    <div className="p-2 border-bottom bg-light bg-opacity-50 text-xs fw-bold text-secondary uppercase tracking-widest px-4 py-2">
                                        Matching Products ({filteredProducts.length})
                                    </div>
                                    <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                                        {filteredProducts.map(p => (
                                            <div
                                                key={p._id}
                                                className="p-3 border-bottom d-flex justify-content-between align-items-center cursor-pointer hover-bg-light transition-all px-4"
                                                onClick={() => addToCart(p)}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{p.name}</div>
                                                        <div className="text-secondary text-xs">
                                                            {p.sku} • <span className={p.stock < 10 ? 'text-danger fw-bold' : ''}>{p.stock} in stock</span> • GST: {p.taxRate || 0}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-primary h6 mb-0 font-monospace">₹{p.price.toFixed(2)}</div>
                                                    <div className="text-success text-xs fw-bold">+ Add to Bill</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Items Table */}
                    <div className="card-pro overflow-hidden d-flex flex-column border-0 shadow-sm" style={{ minHeight: '500px' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-30">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <ShoppingCart size={20} className="text-primary" />
                                <span>Current Order Items</span>
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 ms-2">{cart.length}</span>
                            </h5>
                            <button 
                                className="btn btn-light-pro btn-sm rounded-pill px-3 fw-bold text-secondary border" 
                                onClick={() => setCart([])} 
                                disabled={cart.length === 0}
                            >
                                Clear Cart
                            </button>
                        </div>

                        <div className="flex-grow-1 overflow-auto p-0">
                            <table className="table table-clean-pro mb-0">
                                <thead className="bg-light bg-opacity-50">
                                    <tr>
                                        <th className="ps-4 py-3 text-xs uppercase tracking-wider text-secondary fw-bold">Description</th>
                                        <th className="py-3 text-xs uppercase tracking-wider text-secondary fw-bold">Unit Price</th>
                                        <th className="py-3 text-xs uppercase tracking-wider text-secondary fw-bold text-center">Qty</th>
                                        <th className="py-3 text-xs uppercase tracking-wider text-secondary fw-bold">Tax %</th>
                                        <th className="py-3 text-xs uppercase tracking-wider text-secondary fw-bold">Price of Tax (₹)</th>
                                        <th className="pe-4 text-end py-3 text-xs uppercase tracking-wider text-secondary fw-bold">Line Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.productId} className="border-bottom">
                                            <td className="ps-4 py-3">
                                                <div className="fw-bold text-dark">{item.name}</div>
                                                {item.sku && <div className="text-secondary text-xs">SKU: {item.sku}</div>}
                                            </td>
                                            <td className="py-3 text-secondary font-monospace">
                                                ₹{item.price.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-center">
                                                <div className="qty-control mx-auto">
                                                    <button onClick={() => updateQuantity(item.productId, -1)} className="qty-btn">
                                                        <Minus size={13} />
                                                    </button>
                                                    <span className="qty-val font-monospace">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.productId, 1)} className="qty-btn">
                                                        <Plus size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <select 
                                                    className="form-select form-select-sm py-1 px-2 border rounded-3 text-xs fw-semibold"
                                                    style={{ width: '82px' }}
                                                    value={item.taxRate}
                                                    onChange={(e) => updateItemTaxRate(item.productId, e.target.value)}
                                                >
                                                    <option value="0">0%</option>
                                                    <option value="5">5%</option>
                                                    <option value="12">12%</option>
                                                    <option value="18">18%</option>
                                                    <option value="28">28%</option>
                                                </select>
                                            </td>
                                            <td className="py-3 font-monospace text-primary fw-semibold">
                                                +₹{item.taxAmount.toFixed(2)}
                                            </td>
                                            <td className="pe-4 text-end py-3 fw-bold text-dark font-monospace h6 mb-0">
                                                ₹{item.total.toFixed(2)}
                                            </td>
                                            <td className="text-end pe-4">
                                                <button onClick={() => updateQuantity(item.productId, -item.quantity)} className="btn-icon-danger" title="Remove item">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cart.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5">
                                                <div className="mb-3 opacity-25">
                                                    <ShoppingCart size={54} className="text-primary" />
                                                </div>
                                                <h6 className="text-secondary fw-bold">Cart is empty</h6>
                                                <p className="text-secondary text-xs">Search for a product or scan barcode to add line items.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 bg-light border-top d-flex justify-content-between align-items-center mt-auto">
                                <div className="text-secondary text-xs fw-bold uppercase tracking-wider d-flex align-items-center gap-2">
                                    <CheckCircle2 size={18} className="text-success" />
                                    <span>{cart.reduce((a, b) => a + b.quantity, 0)} Units in cart</span>
                                </div>
                                <div className="h5 mb-0 fw-bold text-dark font-monospace">
                                    Base Subtotal: ₹{subtotal.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* Customer Info Card */}
                    <div className="card-pro p-4 mb-4 border-0 shadow-sm">
                        <h5 className="mb-3 d-flex align-items-center gap-2 fw-bold">
                            <UserPlus size={20} className="text-primary" />
                            <span>Customer Details</span>
                        </h5>
                        <div className="d-flex flex-column gap-2.5">
                            <input
                                type="text"
                                className="form-control-custom"
                                placeholder="Customer Name (Optional)"
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                            />
                            <input
                                type="text"
                                className="form-control-custom"
                                placeholder="Mobile Number"
                                value={customer.phone}
                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                            />
                            <input
                                type="email"
                                className="form-control-custom"
                                placeholder="Email (for Digital Receipt)"
                                value={customer.email}
                                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Order Summary & Payment Mode Card */}
                    <div className="card-pro p-4 border-0 shadow-sm bg-gradient-light">
                        <h5 className="mb-4 d-flex align-items-center gap-2 fw-bold">
                            <Receipt size={20} className="text-primary" />
                            <span>Payment & Checkout</span>
                        </h5>

                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-secondary fw-semibold text-xs text-uppercase tracking-wider">Subtotal (Excl. Tax)</span>
                            <span className="fw-bold text-dark font-monospace">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-secondary fw-semibold text-xs text-uppercase tracking-wider">Price of Tax (Total GST)</span>
                            <span className="fw-bold text-primary font-monospace">+₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-end mt-4 mb-4 pt-3 border-top">
                            <div>
                                <span className="text-secondary fw-bold text-xs uppercase tracking-wider d-block">Grand Total</span>
                                <span className="text-xs text-muted">Includes item tax rates</span>
                            </div>
                            <span className="display-6 fw-bold text-primary tracking-tight font-monospace">₹{total.toFixed(2)}</span>
                        </div>

                        <label className="text-secondary text-xs fw-bold uppercase tracking-wider mb-2 d-block">
                            Select Payment Method
                        </label>

                        <div className="d-flex flex-column gap-2 mb-4">
                            {/* Cash Option */}
                            <div 
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-3 rounded-4 border d-flex align-items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary bg-opacity-5' : 'bg-white'}`}
                            >
                                <div className={`p-2.5 rounded-3 ${paymentMethod === 'cash' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                                    <Banknote size={22} />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark text-sm">Cash Payment</div>
                                    <div className="text-secondary text-xs">Direct paper currency / cash register</div>
                                </div>
                                {paymentMethod === 'cash' && <CheckCircle2 size={18} className="text-primary" />}
                            </div>

                            {/* Razorpay Online Option */}
                            <div 
                                onClick={() => setPaymentMethod('razorpay')}
                                className={`p-3 rounded-4 border d-flex align-items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary bg-primary bg-opacity-5' : 'bg-white'}`}
                            >
                                <div className={`p-2.5 rounded-3 ${paymentMethod === 'razorpay' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                                    <CreditCard size={22} />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark text-sm d-flex align-items-center gap-2">
                                        <span>Razorpay Online</span>
                                        <span className="badge bg-primary text-white px-2 py-0.5 rounded-pill text-xs">UPI / Card</span>
                                    </div>
                                    <div className="text-secondary text-xs">Generate invoice ONLY after verified payment</div>
                                </div>
                                {paymentMethod === 'razorpay' && <CheckCircle2 size={18} className="text-primary" />}
                            </div>
                        </div>

                        {paymentMethod === 'razorpay' && (
                            <div className="alert alert-warning py-2.5 px-3 text-xs mb-4 rounded-3 d-flex align-items-center gap-2">
                                <ShieldCheck size={18} className="text-warning flex-shrink-0" />
                                <span><b>Secure Protocol:</b> Bill & direct invoice are blocked until online payment succeeds.</span>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            className="btn-pay-complete shadow-lg"
                            disabled={loading || cart.length === 0}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={22} />
                            ) : paymentMethod === 'razorpay' ? (
                                <>
                                    <CreditCard size={20} />
                                    <span>Pay ₹{total.toFixed(2)} with Razorpay</span>
                                </>
                            ) : (
                                <>
                                    <Receipt size={20} />
                                    <span>Complete Cash Sale & Print Bill</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Razorpay Simulation Modal for Offline / Test Environment */}
            {simulationModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 p-3" style={{ zIndex: 1050 }}>
                    <div className="bg-white rounded-4 p-4 shadow-xl border w-100" style={{ maxWidth: '440px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h6 className="fw-bold text-dark mb-0">Razorpay Online Gateway</h6>
                                    <span className="text-xs text-secondary">POS Online Checkout</span>
                                </div>
                            </div>
                            <button onClick={cancelSimulationPayment} className="btn btn-sm btn-light border p-1 rounded-circle">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-3 bg-light rounded-3 mb-3">
                            <div className="d-flex justify-content-between mb-1 text-xs">
                                <span className="text-secondary">Customer:</span>
                                <span className="fw-semibold text-dark">{customer.name || 'Walk-in Customer'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 text-xs">
                                <span className="text-secondary">Subtotal (Excl. Tax):</span>
                                <span className="fw-semibold text-dark font-monospace">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 text-xs">
                                <span className="text-secondary">Price of Tax:</span>
                                <span className="fw-semibold text-primary font-monospace">+₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2 mt-2">
                                <span className="fw-bold text-dark text-sm">Total Payable:</span>
                                <span className="fw-bold text-primary font-monospace h6 mb-0">₹{simulationModal.amount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="alert alert-info py-2 px-3 text-xs mb-4 rounded-3 d-flex align-items-center gap-2">
                            <AlertCircle size={16} className="text-info flex-shrink-0" />
                            <span>Invoice is blocked until you confirm payment below.</span>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                onClick={cancelSimulationPayment}
                                className="btn btn-light border flex-1 py-2.5 rounded-3 fw-bold text-secondary text-sm"
                            >
                                Cancel / Decline
                            </button>
                            <button
                                onClick={confirmSimulationPayment}
                                className="btn btn-primary flex-1 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 text-sm shadow-sm"
                            >
                                <CheckCircle2 size={16} />
                                <span>Confirm Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .card-pro {
                    background: white;
                    border-radius: 24px;
                    transition: all 0.3s ease;
                }
                .input-group-pro {
                    display: flex;
                    align-items: center;
                    background: #F8FAFC;
                    border: 2px solid transparent;
                    border-radius: 18px;
                    padding: 4px;
                    transition: all 0.2s ease;
                }
                .input-group-pro:focus-within {
                    background: white;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }
                .input-group-icon { padding: 0 15px; }
                .form-control-pro {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 12px 0;
                    font-weight: 600;
                    color: #1E293B;
                }
                .form-control-pro:focus { outline: none; }
                
                .results-dropdown {
                    position: absolute;
                    width: 100%;
                    background: white;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
                    border-radius: 20px;
                }
                
                .qty-control {
                    display: flex;
                    align-items: center;
                    background: #F1F5F9;
                    border-radius: 50px;
                    padding: 3px;
                    width: fit-content;
                }
                .qty-btn {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    border: none;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #475569;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .qty-btn:hover { background: var(--primary); color: white; }
                .qty-val { padding: 0 10px; font-weight: 700; color: #1E293B; font-size: 0.85rem; }
                
                .btn-icon-danger {
                    background: rgba(239, 68, 68, 0.08);
                    color: #EF4444;
                    border: none;
                    padding: 8px;
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .btn-icon-danger:hover { background: #EF4444; color: white; }
                
                .form-control-custom {
                    width: 100%;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .form-control-custom:focus {
                    background: white;
                    border-color: var(--primary);
                    outline: none;
                }
                
                .btn-pay-complete {
                    width: 100%;
                    padding: 16px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                }
                .btn-pay-complete:hover:not(:disabled) {
                    filter: brightness(1.08);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
                }
                .btn-pay-complete:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Billing;
