import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
    History,
    Search,
    Eye,
    FileText,
    ChevronLeft,
    Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showError } = useToast();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/billing');
            setInvoices(res.data);
        } catch (error) {
            showError('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrint = (id) => {
        // We'll redirect to view and trigger print there or just open in new window
        window.open(`/billing/invoice/${id}`, '_blank');
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">Transaction History</h3>
                <Link to="/billing" className="btn btn-primary d-flex align-items-center gap-2">
                    <FileText size={18} />
                    <span>Generate Bill</span>
                </Link>
            </div>

            <div className="card-clean p-4 mb-4">
                <div className="input-group" style={{ maxWidth: '500px' }}>
                    <span className="input-group-text bg-white border-end-0">
                        <Search size={18} className="text-secondary" />
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search by Invoice No or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-clean overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-clean mb-0">
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th className="text-end">Total Amount</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map(inv => (
                                <tr key={inv._id}>
                                    <td className="fw-semibold text-primary">{inv.invoiceNo}</td>
                                    <td>
                                        <div className="fw-medium text-dark">{inv.customerName || 'Walk-in'}</div>
                                        <div className="text-secondary text-xs">{inv.customerPhone || 'No Phone'}</div>
                                    </td>
                                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 text-xs uppercase fw-bold tracking-wider">
                                            {inv.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="text-end fw-bold text-dark">₹{inv.total?.toFixed(2)}</td>
                                    <td className="text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                onClick={() => handlePrint(inv._id)}
                                                className="btn btn-sm btn-light border p-2 hover-bg-primary hover-text-white transition-all"
                                                title="Print Invoice"
                                            >
                                                <Printer size={16} />
                                            </button>
                                            <Link
                                                to={`/billing/invoice/${inv._id}`}
                                                className="btn btn-sm btn-light border p-2 text-primary hover-bg-primary hover-text-white transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="text-secondary mb-2">No transactions found matching your search.</div>
                                        <Link to="/billing" className="btn btn-link text-primary p-0">Create your first invoice</Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
