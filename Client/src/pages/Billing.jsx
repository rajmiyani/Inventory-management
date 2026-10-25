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
    Smartphone,
    Printer,
    ChevronDown,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Package
} from 'lucide-react';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
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

    const addToCart = (product) => {
        const existing = cart.find(item => item.productId === product._id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                showWarning(`Only ${product.stock} units available in stock!`);
                return;
            }
            setCart(cart.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            if (product.stock <= 0) {
                showWarning('Product is currently out of stock!');
                return;
            }
            setCart([...cart, {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price
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
                if (newQty > product.stock) {
                    showWarning('Cannot exceed available stock level');
                    return item;
                }
                return { ...item, quantity: newQty, total: newQty * item.price };
            }
            return item;
        }).filter(Boolean));
    };

    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    const tax = subtotal * 0.18; // 18% GST Example
    const total = subtotal + tax;

    const handleSubmit = async () => {
        if (cart.length === 0) return showWarning('Your cart is empty');
        setLoading(true);
        try {
            const res = await api.post('/billing/generate', {
                customerName: customer.name || 'Walk-in Customer',
                customerEmail: customer.email,
                customerPhone: customer.phone,
                items: cart,
                subtotal,
                tax,
                totalAmount: total,
                paymentMethod,
                paymentStatus: 'paid'
            });
            showSuccess('Transaction COMPLETED successfully!');
            setCart([]);
            setCustomer({ name: '', email: '', phone: '' });
            fetchProducts(); // Refresh stock

            // Auto open print view in new tab
            window.open(`/billing/invoice/${res.data._id}`, '_blank');
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to generate invoice');
        } finally {
            setLoading(false);
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
                    <p className="text-secondary mb-0">Create professional bills and manage inventory in real-time.</p>
                </div>
                <div className="badge border px-3 py-2 bg-white rounded-pill shadow-sm d-flex align-items-center gap-2">
                    <div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div>
                    <span className="text-secondary text-xs fw-bold">Live System Sync</span>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {/* Search & Selection */}
                    <div className="card-pro p-4 mb-4 border-0 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4">
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
                                    placeholder="Type product name or scan SKU..."
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
                                <div className="results-dropdown shadow-xl border rounded-5 z-3 mt-2 overflow-hidden bg-white">
                                    <div className="p-2 border-bottom bg-light bg-opacity-50 text-xs fw-bold text-secondary uppercase tracking-widest px-4 py-2">
                                        Matching Results
                                    </div>
                                    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                        {filteredProducts.map(p => (
                                            <div
                                                key={p._id}
                                                className="p-3 border-bottom d-flex justify-content-between align-items-center cursor-pointer hover-bg-light transition-all px-4"
                                                onClick={() => addToCart(p)}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-5 p-2 rounded-3 text-primary">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{p.name}</div>
                                                        <div className="text-secondary text-xs font-medium">
                                                            {p.sku} • <span className={p.stock < 10 ? 'text-danger fw-bold' : ''}>{p.stock} in stock</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-primary h6 mb-0">₹{p.price.toFixed(2)}</div>
                                                    <div className="text-success text-xs font-bold">+ Click to Add</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="card-pro overflow-hidden d-flex flex-column border-0 shadow-sm" style={{ minHeight: '500px' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-30">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <ShoppingCart size={20} className="text-primary" />
                                <span>Current Order</span>
                                <span className="badge bg-primary-soft text-primary rounded-pill px-3 ms-2">{cart.length}</span>
                            </h5>
                            <button className="btn btn-light-pro btn-sm rounded-pill px-3 fw-bold text-secondary" onClick={() => setCart([])} disabled={cart.length === 0}>
                                Clear Cart
                            </button>
                        </div>

                        <div className="flex-grow-1 overflow-auto p-0">
                            <table className="table table-clean-pro mb-0">
                                <thead className="bg-light bg-opacity-50 px-4">
                                    <tr>
                                        <th className="ps-4 py-3 text-xs uppercase tracking-widest text-secondary fw-bold">Description</th>
                                        <th className="py-3 text-xs uppercase tracking-widest text-secondary fw-bold">Unit Price</th>
                                        <th className="py-3 text-xs uppercase tracking-widest text-secondary fw-bold">Qty</th>
                                        <th className="pe-4 text-end py-3 text-xs uppercase tracking-widest text-secondary fw-bold">Line Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.productId} className="border-bottom">
                                            <td className="ps-4 py-4">
                                                <div className="fw-bold text-dark">{item.name}</div>
                                            </td>
                                            <td className="py-4 text-secondary font-medium">₹{item.price.toFixed(2)}</td>
                                            <td className="py-4">
                                                <div className="qty-control">
                                                    <button onClick={() => updateQuantity(item.productId, -1)} className="qty-btn ripple">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="qty-val">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.productId, 1)} className="qty-btn ripple">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end py-4 fw-bold text-dark h6 mb-0">₹{item.total.toFixed(2)}</td>
                                            <td className="text-end pe-4">
                                                <button onClick={() => updateQuantity(item.productId, -item.quantity)} className="btn-icon-danger">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cart.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="mb-3 opacity-25">
                                                    <ShoppingCart size={64} className="text-primary" />
                                                </div>
                                                <h5 className="text-secondary fw-bold">No items in cart</h5>
                                                <p className="text-secondary text-sm">Scan a product or use the search bar to get started.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 bg-primary bg-opacity-5 border-top d-flex justify-content-between align-items-center mt-auto">
                                <div className="text-secondary text-sm fw-bold uppercase tracking-widest d-flex align-items-center gap-2">
                                    <CheckCircle2 size={18} className="text-success" />
                                    <span>{cart.reduce((a, b) => a + b.quantity, 0)} Units Verified</span>
                                </div>
                                <div className="h4 mb-0 fw-bold text-primary tracking-tighter">
                                    Subtotal: ₹{subtotal.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* Customer Info Card */}
                    <div className="card-pro p-4 mb-4 border-0 shadow-sm overflow-hidden position-relative">
                        <div className="bg-primary h-1 w-100 position-absolute top-0 start-0"></div>
                        <h5 className="mb-4 d-flex align-items-center gap-2 fw-bold pt-1">
                            <UserPlus size={20} className="text-primary" />
                            <span>Customer Profile</span>
                        </h5>
                        <div className="mb-2">
                            <div className="input-group-clean mb-3">
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    placeholder="Full Name (Optional)"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                            </div>
                            <div className="input-group-clean">
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    placeholder="Mobile Number"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Card */}
                    <div className="card-pro p-4 border-0 shadow-sm bg-gradient-light">
                        <h5 className="mb-4 d-flex align-items-center gap-2 fw-bold">
                            <Receipt size={20} className="text-primary" />
                            <span>Order Summary</span>
                        </h5>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-secondary fw-bold uppercase tracking-widest text-xs opacity-75">Subtotal</span>
                            <span className="fw-bold text-dark">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-secondary fw-bold uppercase tracking-widest text-xs opacity-75">Tax (GST 18%)</span>
                            <span className="fw-bold text-dark">₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-end mt-4 mb-4 pt-4 border-top">
                            <span className="text-secondary fw-bold uppercase tracking-widest text-xs opacity-75 mb-2">Total Amount Payable</span>
                            <span className="display-5 fw-bold text-primary tracking-tighter">₹{total.toFixed(2)}</span>
                        </div>

                        <label className="text-secondary text-xs font-bold uppercase tracking-widest mb-3 d-block">Select Payment Method</label>
                        <div className="d-flex gap-3 mb-5 mt-4">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`btn-payment ${paymentMethod === 'cash' ? 'active' : ''}`}
                            >
                                <div className="payment-icon">
                                    <Banknote size={24} />
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold">Cash Payment</span>
                                    <span className="text-xs opacity-75">Pay with paper money</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`btn-payment ${paymentMethod === 'card' ? 'active' : ''}`}
                            >
                                <div className="payment-icon">
                                    <Smartphone size={24} />
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold">Digital / UPI</span>
                                    <span className="text-xs opacity-75">PhonePe, GPay, Card</span>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="btn-pay-complete shadow-lg"
                            disabled={loading || cart.length === 0}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <Receipt size={22} />
                                    <span>Complete & Print Invoice</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .card-pro {
                    background: white;
                    border-radius: 28px;
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
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
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
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
                    border-radius: 20px;
                }
                
                .qty-control {
                    display: flex;
                    align-items: center;
                    background: #F1F5F9;
                    border-radius: 50px;
                    padding: 4px;
                    width: fit-content;
                }
                .qty-btn {
                    width: 28px;
                    height: 28px;
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
                .qty-val { padding: 0 12px; font-weight: 800; color: #1E293B; font-size: 0.9rem; }
                
                .btn-icon-danger {
                    background: rgba(239, 68, 68, 0.05);
                    color: #EF4444;
                    border: none;
                    padding: 10px;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .btn-icon-danger:hover { background: #EF4444; color: white; transform: rotate(8deg); }
                
                .form-control-custom {
                    width: 100%;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    padding: 14px 20px;
                    border-radius: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .form-control-custom:focus {
                    background: white;
                    border-color: var(--primary);
                    outline: none;
                }
                
                .btn-payment {
                    flex: 1;
                    padding: 1.25rem;
                    border-radius: 20px;
                    border: 2px solid #F1F5F9;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #64748B;
                    text-decoration: none;
                }
                .btn-payment:hover {
                    border-color: var(--primary-soft);
                    background: #F8FAFC;
                    transform: translateY(-2px);
                }
                .btn-payment.active {
                    border-color: var(--primary);
                    background: var(--primary-soft);
                    color: var(--primary);
                    box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.15);
                }
                .btn-payment.active i, .btn-payment.active svg {
                    transform: scale(1.1);
                }
                .payment-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background: #F8FAFC;
                    transition: all 0.2s;
                }
                .btn-payment.active .payment-icon {
                    background: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                
                .btn-pay-complete {
                    width: 100%;
                    padding: 18px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    transition: all 0.3s;
                }
                .btn-pay-complete:hover:not(:disabled) {
                    background: #7C3AED;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(139, 92, 246, 0.3);
                }
                .btn-pay-complete:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Billing;
