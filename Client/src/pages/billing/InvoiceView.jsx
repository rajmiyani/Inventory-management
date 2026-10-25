import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
    Printer,
    Download,
    ChevronLeft,
    Calendar,
    User,
    Hash,
    Loader2,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';

const InvoiceView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError } = useToast();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 fade-in">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!invoice) return null;

    return (
        <div className="fade-in py-5 px-3">
            <div className="max-w-4xl mx-auto no-print">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <button onClick={() => navigate(-1)} className="btn btn-light-pro d-flex align-items-center gap-2 border px-4 py-2 rounded-3 transition-all hover-translate-x-n1">
                        <ChevronLeft size={18} />
                        <span className="fw-bold">Back to History</span>
                    </button>
                    <div className="d-flex gap-2">
                        <button onClick={handlePrint} className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm transition-all hover-scale-102">
                            <Printer size={18} />
                            <span className="fw-bold">Print Invoice</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="card-pro border-0 shadow-lg bg-white overflow-hidden invoice-printable">
                    {/* Invoice Header Stripe */}
                    <div className="bg-primary py-2 px-5 no-print"></div>

                    <div className="p-5 p-md-6">
                        <div className="row mb-5 pb-4 border-bottom g-4">
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div className="bg-primary text-white p-2 rounded-3 shadow-sm">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <h2 className="fw-bold text-dark mb-0 tracking-tighter">SmartInv</h2>
                                </div>
                                <div className="text-secondary text-sm">
                                    <p className="mb-1 fw-medium text-dark">SmartInv Business Solutions</p>
                                    <p className="mb-0">123 Business Avenue, Suite 100</p>
                                    <p className="mb-0">New Delhi, India 110001</p>
                                    <p className="mb-0">contact@smartinv.pro</p>
                                </div>
                            </div>
                            <div className="col-sm-6 text-sm-end">
                                <div className="mb-3">
                                    <span className="badge-pro bg-success-soft text-success text-xs font-bold uppercase tracking-widest mb-2 px-3">
                                        {invoice.paymentStatus}
                                    </span>
                                    <h1 className="fw-bold text-dark mb-1 h2 tracking-tighter">INVOICE</h1>
                                    <div className="text-secondary fw-bold text-sm">#{invoice.invoiceNo}</div>
                                </div>
                                <div className="text-secondary text-sm">
                                    <div className="mb-1">
                                        <span className="opacity-75">Issued Date: </span>
                                        <span className="text-dark fw-bold">{new Date(invoice.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                    </div>
                                    <div>
                                        <span className="opacity-75">Payment Method: </span>
                                        <span className="text-dark fw-bold uppercase">{invoice.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-5 g-4">
                            <div className="col-sm-6">
                                <div className="p-4 bg-light bg-opacity-50 rounded-4 h-100 border border-light">
                                    <div className="text-secondary text-xs fw-bold uppercase mb-3 opacity-50 tracking-widest">Bill To:</div>
                                    <div className="fw-bold h5 mb-2 text-dark">{invoice.customerName || 'Walk-in Customer'}</div>
                                    <div className="text-secondary d-flex align-items-center gap-2 mb-1">
                                        <CheckCircle2 size={14} className="text-success" />
                                        <span className="text-sm">{invoice.customerEmail || 'No Email provided'}</span>
                                    </div>
                                    <div className="text-secondary d-flex align-items-center gap-2">
                                        <CheckCircle2 size={14} className="text-success" />
                                        <span className="text-sm">{invoice.customerPhone || 'No Phone provided'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 text-sm-end d-flex flex-column justify-content-center">
                                <div className="pe-4">
                                    <div className="text-secondary text-xs fw-bold uppercase mb-2 opacity-50 tracking-widest">Amount Due:</div>
                                    <div className="display-5 fw-bold text-primary tracking-tighter">₹{invoice.total.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive mb-5">
                            <table className="table table-clean-pro">
                                <thead>
                                    <tr className="bg-light-pro border-top border-bottom">
                                        <th className="py-4 ps-4 text-xs uppercase tracking-widest text-secondary fw-bold">Item Description</th>
                                        <th className="py-4 text-center text-xs uppercase tracking-widest text-secondary fw-bold">Unit Price</th>
                                        <th className="py-4 text-center text-xs uppercase tracking-widest text-secondary fw-bold">Qty</th>
                                        <th className="py-4 pe-4 text-end text-xs uppercase tracking-widest text-secondary fw-bold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, idx) => (
                                        <tr key={idx} className="border-bottom">
                                            <td className="py-4 ps-4">
                                                <div className="fw-bold text-dark h6 mb-1">{item.name}</div>
                                                <div className="text-secondary text-xs">Product ID: <span className="text-dark bg-light px-2 py-1 rounded-pill">{item.productId}</span></div>
                                            </td>
                                            <td className="text-center py-4 text-dark font-medium">₹{item.price.toFixed(2)}</td>
                                            <td className="text-center py-4">
                                                <span className="bg-light px-3 py-1 rounded-pill fw-bold text-secondary text-sm">{item.quantity}</span>
                                            </td>
                                            <td className="text-end py-4 pe-4 fw-bold text-dark h6 mb-0">₹{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="row justify-content-end g-4">
                            <div className="col-sm-5">
                                <div className="p-4 bg-light bg-opacity-30 rounded-4 border">
                                    <div className="d-flex justify-content-between mb-3 text-sm">
                                        <span className="text-secondary fw-medium">Subtotal</span>
                                        <span className="fw-bold text-dark">₹{invoice.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4 text-sm">
                                        <span className="text-secondary fw-medium">Tax (GST 18%)</span>
                                        <span className="fw-bold text-dark">₹{invoice.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-top pt-3 align-items-center">
                                        <span className="h5 mb-0 fw-bold text-secondary">Total Due</span>
                                        <span className="h3 mb-0 fw-bold text-primary">₹{invoice.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-top text-center">
                            <h6 className="fw-bold text-dark mb-2 uppercase tracking-widest opacity-50 text-xs">Thank You!</h6>
                            <p className="text-secondary text-sm mb-4">We appreciate your business. For any queries regarding this invoice, please reach out via support portal.</p>
                            <div className="d-flex justify-content-center gap-4 text-xs font-bold text-primary tracking-wider uppercase">
                                <span className="hover-underline cursor-pointer">www.smartinv.pro</span>
                                <span className="text-secondary opacity-25">|</span>
                                <span className="hover-underline cursor-pointer">Terms & Conditions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .max-w-4xl { max-width: 900px; }
                .card-pro {
                    border-radius: 32px;
                    transition: all 0.3s ease;
                }
                .hover-scale-102:hover { transform: scale(1.02); }
                .hover-translate-x-n1:hover { transform: translateX(-4px); }
                .tracking-tighter { letter-spacing: -0.05em; }
                .tracking-widest { letter-spacing: 0.15em; }
                .bg-success-soft { background: rgba(16, 185, 129, 0.1); }
                .bg-light-pro { background: #F8FAFC; }
                .mt-6 { margin-top: 4rem; }
                
                .table-clean-pro th { border: none; }
                .table-clean-pro td { border: none; vertical-align: middle; }
                
                @media print {
                    .no-print { display: none !important; }
                    .sidebar { display: none !important; }
                    .navbar { display: none !important; }
                    .main-content { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .invoice-printable { 
                        box-shadow: none !important; 
                        border: none !important;
                        padding: 0 !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    body { background: white !important; margin: 0; padding: 0; }
                    .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .p-6 { padding: 2rem !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceView;
