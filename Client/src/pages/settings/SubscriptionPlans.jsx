import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
    CreditCard, 
    Check, 
    Sparkles, 
    Zap, 
    ShieldCheck, 
    Layers, 
    Clock, 
    Loader2, 
    CheckCircle2, 
    ExternalLink 
} from 'lucide-react';

const SubscriptionPlans = () => {
    const { business, user, updateBusinessState } = useAuth();
    const { showSuccess, showError } = useToast();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgradingPlan, setUpgradingPlan] = useState(null);

    // Load Razorpay script helper
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

    const fetchSubscriptionData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/subscription/current');
            setData(res.data);
        } catch (error) {
            showError('Failed to load subscription status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const handlePurchasePlan = async (planKey) => {
        setUpgradingPlan(planKey);
        try {
            // 1. Create Order on backend
            const orderRes = await api.post('/subscription/create-order', { plan: planKey });
            const { orderId, amount, currency, keyId, isSimulation } = orderRes.data;

            // If keys not configured or simulation mode
            if (isSimulation) {
                const verifyRes = await api.post('/subscription/verify-payment', {
                    plan: planKey,
                    razorpay_order_id: orderId,
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_signature: 'mock_sig',
                    isSimulation: true
                });
                showSuccess(verifyRes.data.message);
                updateBusinessState({
                    subscription: verifyRes.data.subscription,
                    limits: verifyRes.data.limits
                });
                fetchSubscriptionData();
                return;
            }

            // 2. Load Razorpay SDK
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                showError('Failed to load Razorpay payment gateway. Please check internet connection.');
                return;
            }

            // 3. Open Razorpay Checkout modal
            const options = {
                key: keyId,
                amount: amount,
                currency: currency || 'INR',
                name: 'SmartInv Cloud SaaS',
                description: `Upgrade to ${planKey.toUpperCase()} Plan (${business?.name || 'Store'})`,
                order_id: orderId,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: business?.phone || ''
                },
                theme: {
                    color: '#2563EB'
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/subscription/verify-payment', {
                            plan: planKey,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            isSimulation: false
                        });

                        showSuccess(verifyRes.data.message);
                        updateBusinessState({
                            subscription: verifyRes.data.subscription,
                            limits: verifyRes.data.limits
                        });
                        fetchSubscriptionData();
                    } catch (err) {
                        showError(err.response?.data?.error || 'Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: function () {
                        showError('Subscription payment cancelled.');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to initiate plan purchase');
        } finally {
            setUpgradingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-50">
                <Loader2 className="animate-spin text-primary" size={36} />
            </div>
        );
    }

    const currentPlan = data?.subscription?.plan || 'trial';
    const usage = data?.usage || { products: 0, staff: 0, monthlyInvoices: 0 };
    const limits = data?.limits || { maxProducts: 50, maxStaff: 2, maxInvoicesPerMonth: 200 };

    const prodPercent = Math.min(100, Math.round((usage.products / (limits.maxProducts || 50)) * 100));
    const staffPercent = Math.min(100, Math.round((usage.staff / (limits.maxStaff || 2)) * 100));

    return (
        <div className="container-fluid py-4 px-3 px-md-4 fade-in">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-5">
                <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill text-xs fw-bold text-uppercase tracking-wider mb-2">
                    SaaS Subscription & Plan Quota
                </span>
                <h2 className="fw-bold display-6 tracking-tight text-dark mb-2">Choose the Right Plan for Your Store</h2>
                <p className="text-secondary text-sm">
                    Flexible monthly plans designed for retail shops, growing supermarkets, and wholesale businesses.
                </p>
            </div>

            {/* Current Active Plan & Quota Meters */}
            <div className="card-clean border-0 shadow-sm rounded-4 p-4 mb-5">
                <div className="row g-4 align-items-center">
                    <div className="col-lg-4 border-end-lg">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 rounded-4 bg-primary text-white shadow-sm">
                                <Zap size={28} />
                            </div>
                            <div>
                                <span className="text-secondary text-xs text-uppercase tracking-wider fw-bold">Active Store Plan</span>
                                <div className="h4 fw-bold text-dark text-capitalize mb-0">{currentPlan} Plan</div>
                                <span className="text-success text-xs fw-semibold d-flex align-items-center gap-1 mt-1">
                                    <Clock size={12} />
                                    <span>Valid until: {new Date(data?.subscription?.validUntil || Date.now()).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="d-flex justify-content-between text-xs font-medium mb-1">
                            <span className="text-secondary">Products Catalog</span>
                            <span className="fw-bold text-dark">
                                {usage.products} / {limits.maxProducts > 99999 ? 'Unlimited' : limits.maxProducts} ({limits.maxProducts > 99999 ? 'Active' : `${prodPercent}%`})
                            </span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: 8 }}>
                            <div 
                                className={`progress-bar ${prodPercent > 85 ? 'bg-danger' : 'bg-primary'}`} 
                                style={{ width: `${limits.maxProducts > 99999 ? 100 : prodPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="d-flex justify-content-between text-xs font-medium mb-1">
                            <span className="text-secondary">Staff & Cashier Accounts</span>
                            <span className="fw-bold text-dark">{usage.staff} / {limits.maxStaff} ({staffPercent}%)</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: 8 }}>
                            <div 
                                className={`progress-bar ${staffPercent > 80 ? 'bg-warning' : 'bg-info'}`} 
                                style={{ width: `${staffPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="row g-4 justify-content-center">
                {/* 1. Starter Plan */}
                <div className="col-md-6 col-lg-4">
                    <div className={`card-clean h-100 p-4 rounded-4 border d-flex flex-column justify-content-between ${currentPlan === 'starter' ? 'border-primary shadow' : 'border-light-subtle shadow-sm'}`}>
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h4 className="fw-bold text-dark mb-0">Starter</h4>
                                <span className="badge bg-light text-secondary border px-2 py-1 text-xs">Small shops</span>
                            </div>
                            <div className="d-flex align-items-baseline gap-1 my-3">
                                <span className="display-6 fw-bold text-dark">₹499</span>
                                <span className="text-secondary text-sm">/ month</span>
                            </div>
                            <p className="text-secondary text-xs mb-4">Best for single-counter shops and boutiques.</p>

                            <ul className="list-unstyled d-flex flex-column gap-2.5 mb-4 text-sm">
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Up to <b>500 products</b></span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span><b>2 staff/cashier</b> accounts</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span><b>1,000 invoices/month</b></span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>POS billing and receipts</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Basic inventory management</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Priority support</span>
                                </li>
                            </ul>
                        </div>

                        <button 
                            onClick={() => handlePurchasePlan('starter')}
                            disabled={currentPlan === 'starter' || upgradingPlan === 'starter'}
                            className={`btn w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${currentPlan === 'starter' ? 'btn-light border disabled' : 'btn-outline-primary'}`}
                        >
                            {upgradingPlan === 'starter' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : currentPlan === 'starter' ? (
                                <>
                                    <CheckCircle2 size={16} className="text-success" />
                                    <span>Active Plan</span>
                                </>
                            ) : (
                                <span>Subscribe via Razorpay (₹499)</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Growth Plan (Most Popular) */}
                <div className="col-md-6 col-lg-4">
                    <div className="card-clean h-100 p-4 rounded-4 border-2 border-primary shadow-lg position-relative bg-white d-flex flex-column justify-content-between">
                        <div className="position-absolute top-0 end-0 m-3">
                            <span className="badge bg-primary text-white rounded-pill px-3 py-1 text-xs fw-bold">
                                MOST POPULAR
                            </span>
                        </div>

                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h4 className="fw-bold text-dark mb-0">Growth</h4>
                                <span className="badge bg-primary-subtle text-primary border-0 px-2 py-1 text-xs">Most popular</span>
                            </div>
                            <div className="d-flex align-items-baseline gap-1 my-3">
                                <span className="display-6 fw-bold text-primary">₹1,499</span>
                                <span className="text-secondary text-sm">/ month</span>
                            </div>
                            <p className="text-secondary text-xs mb-4">Best for supermarkets, pharmacies and busy retailers.</p>

                            <ul className="list-unstyled d-flex flex-column gap-2.5 mb-4 text-sm">
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Up to <b>5,000 products</b></span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span><b>5 staff/cashier</b> accounts</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span><b>10,000 invoices/month</b></span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Thermal printing (58mm/80mm)</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Barcode label generator</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Stock reports & low-stock alerts</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Priority support</span>
                                </li>
                            </ul>
                        </div>

                        <button 
                            onClick={() => handlePurchasePlan('growth')}
                            disabled={currentPlan === 'growth' || upgradingPlan === 'growth'}
                            className={`btn w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 ${currentPlan === 'growth' ? 'btn-light border disabled' : 'btn-primary'}`}
                        >
                            {upgradingPlan === 'growth' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : currentPlan === 'growth' ? (
                                <>
                                    <CheckCircle2 size={16} className="text-success" />
                                    <span>Active Plan</span>
                                </>
                            ) : (
                                <span>Upgrade to Growth (₹1,499)</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* 3. Enterprise Plan */}
                <div className="col-md-6 col-lg-4">
                    <div className={`card-clean h-100 p-4 rounded-4 border d-flex flex-column justify-content-between ${currentPlan === 'enterprise' ? 'border-primary shadow' : 'border-light-subtle shadow-sm'}`}>
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h4 className="fw-bold text-dark mb-0">Enterprise</h4>
                                <span className="badge bg-light text-secondary border px-2 py-1 text-xs">Growing businesses</span>
                            </div>
                            <div className="d-flex align-items-baseline gap-1 my-3">
                                <span className="display-6 fw-bold text-dark">₹3,499</span>
                                <span className="text-secondary text-sm">/ month</span>
                            </div>
                            <p className="text-secondary text-xs mb-4">Best for wholesalers and multi-store businesses.</p>

                            <ul className="list-unstyled d-flex flex-column gap-2.5 mb-4 text-sm">
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span><b>Unlimited products</b></span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Up to <b>50 staff accounts</b></span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span><b>Unlimited invoices & PDF generation</b></span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Advanced accounting and P&L reports</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Multi-store management</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Check size={16} className="text-success" />
                                    <span>Priority support</span>
                                </li>
                            </ul>
                        </div>

                        <button 
                            onClick={() => handlePurchasePlan('enterprise')}
                            disabled={currentPlan === 'enterprise' || upgradingPlan === 'enterprise'}
                            className={`btn w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${currentPlan === 'enterprise' ? 'btn-light border disabled' : 'btn-outline-dark'}`}
                        >
                            {upgradingPlan === 'enterprise' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : currentPlan === 'enterprise' ? (
                                <>
                                    <CheckCircle2 size={16} className="text-success" />
                                    <span>Active Plan</span>
                                </>
                            ) : (
                                <span>Subscribe Enterprise (₹3,499)</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;
