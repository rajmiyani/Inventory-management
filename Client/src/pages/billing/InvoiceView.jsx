import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
    Printer,
    Download,
    ChevronLeft,
    Calendar,
    User,
    Hash,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    Store,
    QrCode,
    FileText,
    Receipt,
    CreditCard,
    Lock,
    ArrowRight,
    X
} from 'lucide-react';

const InvoiceView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError, showSuccess, showWarning } = useToast();
    const { hasFeature, plan } = useAuth();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('a4'); // 'a4' or 'thermal'
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/billing/${id}`);
                setInvoice(res.data);
            } catch (error) {
                showError('Failed to load invoice details');
                navigate('/billing/history');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id, navigate, showError]);

    const handleSwitchMode = (mode) => {
        if (mode === 'thermal' && !hasFeature('thermalPrint')) {
            setUpgradeModalOpen(true);
            return;
        }
        setViewMode(mode);
    };

    const handlePrint = (mode = 'a4') => {
        if (mode === 'thermal' && !hasFeature('thermalPrint')) {
            setUpgradeModalOpen(true);
            return;
        }
        setViewMode(mode);
        setTimeout(() => {
            window.print();
        }, 150);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 fade-in">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!invoice) return null;

    const b = invoice.business || {};
    const invSettings = b.invoiceSettings || {};
    const primaryColor = invSettings.primaryColor || '#2563EB';
    const currency = b.currency === 'INR' ? '₹' : (b.currency || '₹');
    const storeAddress = b.address || {};
    const addressStr = [storeAddress.street, storeAddress.city, storeAddress.state, storeAddress.zip].filter(Boolean).join(', ');

    return (
        <div className="fade-in py-5 px-3">
            {/* Top Toolbar (Hidden when printing) */}
            <div className="max-w-4xl mx-auto no-print mb-4">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <button 
                        onClick={() => navigate('/billing/history')} 
                        className="btn btn-light-pro d-inline-flex align-items-center gap-2 border px-4 py-2 rounded-3"
                    >
                        <ChevronLeft size={18} />
                        <span className="fw-semibold">Back to History</span>
                    </button>

                    <div className="d-flex flex-wrap gap-2">
                        {/* Format Switcher */}
                        <div className="btn-group p-1 bg-light rounded-3 border me-2">
                            <button
                                onClick={() => handleSwitchMode('a4')}
                                className={`btn btn-sm px-3 rounded-2 fw-semibold ${viewMode === 'a4' ? 'btn-white shadow-sm text-primary' : 'text-secondary'}`}
                            >
                                Standard A4
                            </button>
                            <button
                                onClick={() => handleSwitchMode('thermal')}
                                className={`btn btn-sm px-3 rounded-2 fw-semibold d-flex align-items-center gap-1.5 ${viewMode === 'thermal' ? 'btn-white shadow-sm text-primary' : 'text-secondary'}`}
                            >
                                {!hasFeature('thermalPrint') && <Lock size={12} className="text-warning" />}
                                <span>80mm Thermal</span>
                            </button>
                        </div>

                        {/* Print Buttons */}
                        <button 
                            onClick={() => handlePrint('a4')} 
                            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
                        >
                            <Printer size={18} />
                            <span className="fw-bold">Print A4 / PDF</span>
                        </button>

                        <button 
                            onClick={() => handlePrint('thermal')} 
                            className="btn btn-light-pro border d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                            title={!hasFeature('thermalPrint') ? 'Growth/Enterprise plan required' : 'Print 80mm Roll'}
                        >
                            <Receipt size={18} />
                            <span className="fw-bold">Thermal Slip</span>
                            {!hasFeature('thermalPrint') && <Lock size={14} className="text-warning" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* A4 Format View */}
            {viewMode === 'a4' && (
                <div className="max-w-4xl mx-auto print-a4-container">
                    <div className="card-pro border-0 shadow-lg bg-white overflow-hidden invoice-printable rounded-4">
                        {/* Dynamic Brand Color Stripe */}
                        <div style={{ backgroundColor: primaryColor, height: '8px' }}></div>

                        <div className="p-4 p-md-5">
                            {/* Header: Business & Invoice Details */}
                            <div className="row mb-4 pb-4 border-bottom g-4">
                                <div className="col-sm-7">
                                    <div className="d-flex align-items-center gap-2.5 mb-2">
                                        <div className="p-2 rounded-3 text-white shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: primaryColor, width: 44, height: 44 }}>
                                            <Store size={26} />
                                        </div>
                                        <div>
                                            <h3 className="fw-bold text-dark mb-0 tracking-tight">{b.name || 'SmartInv Store'}</h3>
                                            <span className="text-xs text-secondary text-uppercase tracking-wider fw-semibold">
                                                {b.category || 'Retail Store'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-secondary text-xs mt-2">
                                        {addressStr && <p className="mb-0.5">{addressStr}</p>}
                                        {b.phone && <p className="mb-0.5">Phone: {b.phone}</p>}
                                        {b.email && <p className="mb-0.5">Email: {b.email}</p>}
                                        {b.taxNumber && (
                                            <p className="mb-0 fw-bold text-dark mt-1">
                                                GSTIN / Tax ID: <span className="font-monospace">{b.taxNumber}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="col-sm-5 text-sm-end">
                                    <div className="mb-2 d-flex justify-content-sm-end gap-1.5 flex-wrap">
                                        <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill text-xs fw-bold text-uppercase tracking-wider">
                                            {invoice.paymentStatus}
                                        </span>
                                        {invoice.paymentMethod === 'razorpay' && (
                                            <span className="badge bg-primary-subtle text-primary border px-2.5 py-1 rounded-pill text-xs fw-bold d-inline-flex align-items-center gap-1">
                                                <CreditCard size={12} />
                                                <span>Razorpay Verified</span>
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="fw-bold mb-1 h3 tracking-tight" style={{ color: primaryColor }}>TAX INVOICE</h1>
                                    <div className="text-secondary fw-bold text-sm mb-2">#{invoice.invoiceNo}</div>

                                    <div className="text-secondary text-xs">
                                        <div>Date: <span className="text-dark fw-semibold">{new Date(invoice.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span></div>
                                        <div>Payment Method: <span className="text-dark fw-bold text-uppercase">{invoice.paymentMethod || 'CASH'}</span></div>
                                        {invoice.notes && (
                                            <div className="text-primary fw-medium font-monospace mt-0.5">{invoice.notes}</div>
                                        )}
                                        {invoice.cashierName && (
                                            <div>Billed by: <span className="text-dark fw-semibold">{invoice.cashierName}</span></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Billed To */}
                            <div className="row mb-4 g-3">
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded-4 border border-light-subtle h-100">
                                        <div className="text-secondary text-xs fw-bold text-uppercase tracking-wider mb-1.5 opacity-75">Billed To (Customer):</div>
                                        <div className="fw-bold h6 mb-1 text-dark">{invoice.customerName || 'Walk-in Customer'}</div>
                                        {invoice.customerPhone && (
                                            <div className="text-secondary text-xs">Phone: {invoice.customerPhone}</div>
                                        )}
                                        {invoice.customerEmail && (
                                            <div className="text-secondary text-xs">Email: {invoice.customerEmail}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-sm-6 text-sm-end d-flex flex-column justify-content-center">
                                    <div className="pe-2">
                                        <div className="text-secondary text-xs fw-bold text-uppercase tracking-wider mb-1 opacity-75">Total Invoice Amount:</div>
                                        <div className="display-6 fw-bold tracking-tight font-monospace" style={{ color: primaryColor }}>
                                            {currency}{invoice.total.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table with Tax Rate % and Price of Tax Columns */}
                            <div className="table-responsive mb-4">
                                <table className="table table-clean-pro">
                                    <thead>
                                        <tr style={{ backgroundColor: `${primaryColor}15` }}>
                                            <th className="py-3 ps-3 text-xs text-uppercase tracking-wider fw-bold text-dark">#</th>
                                            <th className="py-3 text-xs text-uppercase tracking-wider fw-bold text-dark">Item Description</th>
                                            <th className="py-3 text-center text-xs text-uppercase tracking-wider fw-bold text-dark">Qty</th>
                                            <th className="py-3 text-end text-xs text-uppercase tracking-wider fw-bold text-dark">Unit Price (Excl. Tax)</th>
                                            <th className="py-3 text-end text-xs text-uppercase tracking-wider fw-bold text-dark">Tax Rate (%)</th>
                                            <th className="py-3 text-end text-xs text-uppercase tracking-wider fw-bold text-dark">Price of Tax (₹)</th>
                                            <th className="py-3 pe-3 text-end text-xs text-uppercase tracking-wider fw-bold text-dark">Total (Incl. Tax)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, idx) => {
                                            const itemTaxAmt = item.taxAmount !== undefined 
                                                ? Number(item.taxAmount) 
                                                : ((item.price * item.quantity * (item.taxRate || 0)) / 100);
                                            return (
                                                <tr key={idx} className="border-bottom">
                                                    <td className="ps-3 py-3 text-secondary text-xs">{idx + 1}</td>
                                                    <td className="py-3">
                                                        <div className="fw-bold text-dark text-sm">{item.name}</div>
                                                        {item.sku && <div className="text-secondary text-xs">SKU: {item.sku}</div>}
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <span className="badge bg-light text-dark border px-2 py-1 font-monospace">{item.quantity}</span>
                                                    </td>
                                                    <td className="text-end py-3 text-sm text-secondary font-monospace">
                                                        {currency}{item.price.toFixed(2)}
                                                    </td>
                                                    <td className="text-end py-3 text-xs fw-semibold text-secondary font-monospace">
                                                        {item.taxRate ? `${item.taxRate}%` : '0%'}
                                                    </td>
                                                    <td className="text-end py-3 text-sm text-primary fw-semibold font-monospace">
                                                        +{currency}{itemTaxAmt.toFixed(2)}
                                                    </td>
                                                    <td className="text-end py-3 pe-3 fw-bold text-dark text-sm font-monospace">
                                                        {currency}{item.total.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary & UPI Payment Box */}
                            <div className="row g-4 align-items-start mb-4">
                                <div className="col-sm-7">
                                    {/* Scan to Pay UPI Box */}
                                    {invSettings.bankDetails?.upiId && (
                                        <div className="p-3 bg-light rounded-4 border d-flex align-items-center gap-3">
                                            <div className="p-2 bg-white rounded-3 border shadow-xs">
                                                <QrCode size={40} className="text-primary" />
                                            </div>
                                            <div>
                                                <span className="text-xs fw-bold text-dark d-block">Scan with UPI to Pay</span>
                                                <span className="text-xs text-secondary font-monospace">{invSettings.bankDetails.upiId}</span>
                                                <span className="text-xs text-secondary d-block mt-0.5 opacity-75">GooglePay • PhonePe • Paytm</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="col-sm-5">
                                    <div className="p-3 bg-light rounded-4 border">
                                        <div className="d-flex justify-content-between mb-2 text-xs">
                                            <span className="text-secondary">Subtotal (Excl. Tax)</span>
                                            <span className="fw-semibold text-dark font-monospace">{currency}{invoice.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 text-xs">
                                            <span className="text-secondary">Price of Tax (Total GST)</span>
                                            <span className="fw-semibold text-primary font-monospace">+{currency}{(invoice.tax || 0).toFixed(2)}</span>
                                        </div>
                                        {invoice.discount > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-xs text-success">
                                                <span>Discount</span>
                                                <span className="fw-semibold font-monospace">-{currency}{invoice.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between border-top pt-2 mt-2 align-items-center">
                                            <span className="fw-bold text-dark text-sm">Grand Total</span>
                                            <span className="h5 mb-0 fw-bold font-monospace" style={{ color: primaryColor }}>
                                                {currency}{invoice.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Footer */}
                            <div className="border-top pt-3 text-secondary text-xs">
                                <div className="row g-2 align-items-end">
                                    <div className="col-sm-8">
                                        <div className="fw-bold text-dark mb-1 text-uppercase opacity-75">Terms & Conditions:</div>
                                        <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-line' }}>
                                            {invSettings.termsAndConditions || 'Goods once sold will not be returned.'}
                                        </p>
                                    </div>
                                    <div className="col-sm-4 text-sm-end">
                                        <div className="mt-4 pt-4 border-top d-inline-block text-center" style={{ minWidth: 140 }}>
                                            <span className="fw-bold text-dark text-xs d-block">Authorized Signatory</span>
                                            <span className="text-secondary text-xs opacity-75">{b.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center mt-4 pt-2 border-top text-secondary opacity-75 text-xs">
                                    {invSettings.customFooterNote || 'Thank you for your business!'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Thermal POS Receipt View (80mm) with Tax % and Tax Amount */}
            {viewMode === 'thermal' && (
                <div className="thermal-roll-preview mx-auto bg-white p-3 shadow rounded-3 border" style={{ maxWidth: '340px', fontFamily: 'monospace' }}>
                    <div className="text-center mb-2">
                        <h5 className="fw-bold mb-0">{b.name || 'SmartInv Store'}</h5>
                        <p className="text-xs mb-0">{addressStr}</p>
                        {b.phone && <p className="text-xs mb-0">Tel: {b.phone}</p>}
                        {b.taxNumber && <p className="text-xs mb-0">GST: {b.taxNumber}</p>}
                    </div>

                    <div className="border-top border-bottom py-1 my-2 text-xs">
                        <div className="d-flex justify-content-between">
                            <span>Receipt: #{invoice.invoiceNo}</span>
                            <span>{new Date(invoice.date).toLocaleDateString()}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Cashier: {invoice.cashierName || 'Staff'}</span>
                            <span className="text-uppercase">{invoice.paymentMethod}</span>
                        </div>
                        {invoice.notes && (
                            <div className="text-xs text-secondary mt-0.5">{invoice.notes}</div>
                        )}
                    </div>

                    <table className="w-100 text-xs mb-2">
                        <thead>
                            <tr className="border-bottom">
                                <th className="text-start py-1">Item</th>
                                <th className="text-center py-1">Qty</th>
                                <th className="text-end py-1">Rate</th>
                                <th className="text-end py-1">Tax%</th>
                                <th className="text-end py-1">Tax₹</th>
                                <th className="text-end py-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, idx) => {
                                const itemTaxAmt = item.taxAmount !== undefined 
                                    ? Number(item.taxAmount) 
                                    : ((item.price * item.quantity * (item.taxRate || 0)) / 100);
                                return (
                                    <tr key={idx}>
                                        <td className="py-0.5 text-truncate" style={{ maxWidth: '95px' }}>{item.name}</td>
                                        <td className="text-center py-0.5">{item.quantity}</td>
                                        <td className="text-end py-0.5">{item.price.toFixed(1)}</td>
                                        <td className="text-end py-0.5">{item.taxRate || 0}%</td>
                                        <td className="text-end py-0.5">{itemTaxAmt.toFixed(1)}</td>
                                        <td className="text-end py-0.5 fw-bold">{currency}{item.total.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="border-top pt-1 text-xs">
                        <div className="d-flex justify-content-between">
                            <span>Subtotal (Excl. Tax):</span>
                            <span>{currency}{invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Price of Tax (GST):</span>
                            <span>+{currency}{(invoice.tax || 0).toFixed(2)}</span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="d-flex justify-content-between">
                                <span>Discount:</span>
                                <span>-{currency}{invoice.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1 h6 mb-1">
                            <span>TOTAL:</span>
                            <span>{currency}{invoice.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="text-center mt-3 pt-2 border-top text-xs">
                        <p className="mb-1">Thank you for your visit!</p>
                        <p className="mb-0 text-secondary" style={{ fontSize: '10px' }}>Powered by SmartInv SaaS</p>
                    </div>
                </div>
            )}

            {/* Upgrade Modal for Thermal Printing (Tier Permission Gate) */}
            {upgradeModalOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 p-3" style={{ zIndex: 1050 }}>
                    <div className="bg-white rounded-4 p-4 shadow-xl border w-100 max-w-md" style={{ maxWidth: '460px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="p-2.5 bg-warning bg-opacity-15 text-warning rounded-3">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h6 className="fw-bold text-dark mb-0">Feature Locked</h6>
                                    <span className="text-xs text-secondary">Requires Growth or Enterprise Plan</span>
                                </div>
                            </div>
                            <button onClick={() => setUpgradeModalOpen(false)} className="btn btn-sm btn-light border p-1 rounded-circle">
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-secondary text-sm mb-3">
                            Thermal Roll Printing (58mm / 80mm) is a premium feature available on <b>Growth (₹1,499/mo)</b> and <b>Enterprise (₹3,499/mo)</b> plans.
                            Your current store plan is <b className="text-capitalize text-dark">{plan}</b>.
                        </p>

                        <div className="p-3 bg-light rounded-3 mb-4">
                            <div className="fw-bold text-dark text-xs text-uppercase tracking-wider mb-2">Growth Plan includes:</div>
                            <ul className="list-unstyled mb-0 text-xs text-secondary d-flex flex-column gap-1.5">
                                <li>✓ Thermal printing (58mm/80mm)</li>
                                <li>✓ Barcode label generator</li>
                                <li>✓ Up to 5,000 products & 5 staff accounts</li>
                                <li>✓ 10,000 invoices/month</li>
                            </ul>
                        </div>

                        <div className="d-flex gap-2">
                            <button 
                                onClick={() => setUpgradeModalOpen(false)} 
                                className="btn btn-light border flex-1 py-2.5 rounded-3 fw-bold text-secondary text-sm"
                            >
                                Keep Standard A4
                            </button>
                            <button 
                                onClick={() => navigate('/settings/subscription')} 
                                className="btn btn-primary flex-1 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-1.5 text-sm shadow-sm"
                            >
                                <span>Upgrade Plan</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .sidebar, .navbar { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .print-a4-container { width: 100% !important; max-width: 100% !important; }
                    .card-pro { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
                    .thermal-roll-preview { width: 80mm !important; max-width: 80mm !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceView;
