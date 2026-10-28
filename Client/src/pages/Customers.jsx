import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
    Users, 
    Search, 
    Plus, 
    Phone, 
    Mail, 
    MapPin, 
    MoreVertical, 
    CreditCard, 
    Calendar, 
    Filter, 
    ChevronRight, 
    Trash2, 
    CheckCircle2, 
    X, 
    DollarSign 
} from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [settleModal, setSettleModal] = useState(null); // customer object
    const [settleAmount, setSettleAmount] = useState('');
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (error) {
            showError('Failed to load customer list');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers', newCustomer);
            showSuccess('Customer added successfully!');
            setShowAddModal(false);
            setNewCustomer({ name: '', phone: '', email: '', address: '' });
            fetchCustomers();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to add customer');
        }
    };

    const handleSettleDue = async (e) => {
        e.preventDefault();
        if (!settleModal) return;
        try {
            await api.post(`/customers/${settleModal._id}/settle-due`, { amount: Number(settleAmount) });
            showSuccess(`Payment of ₹${settleAmount} recorded against due!`);
            setSettleModal(null);
            setSettleAmount('');
            fetchCustomers();
        } catch (error) {
            showError('Failed to record payment');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete customer profile for ${name}?`)) return;
        try {
            await api.delete(`/customers/${id}`);
            showSuccess('Customer deleted');
            fetchCustomers();
        } catch (error) {
            showError('Failed to delete customer');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="fade-in pb-5">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Customer Directory & Khata</h2>
                    <p className="text-secondary mb-0">Total of {customers.length} registered customer accounts.</p>
                </div>
                <div className="d-flex gap-3">
                    <button 
                        onClick={() => setShowAddModal(true)} 
                        className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm rounded-3"
                    >
                        <Plus size={18} />
                        <span className="fw-bold">Add Customer</span>
                    </button>
                </div>
            </div>

            {/* Search Filter Bar */}
            <div className="card-pro p-4 mb-4 border-0 shadow-sm">
                <div className="row g-3 align-items-center">
                    <div className="col-md-6">
                        <div className="input-group-pro">
                            <span className="input-group-icon">
                                <Search size={22} className="text-secondary opacity-50" />
                            </span>
                            <input
                                type="text"
                                className="form-control-pro"
                                placeholder="Search by name, mobile or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Cards Grid */}
            <div className="row g-4">
                {filteredCustomers.map(customer => {
                    const due = customer.dueBalance || 0;
                    return (
                        <div key={customer._id} className="col-xl-4 col-md-6">
                            <div className="card-pro border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar-box bg-primary bg-opacity-10 text-primary fw-bold">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h5 className="fw-bold text-dark mb-0">{customer.name}</h5>
                                                <span className="text-xs text-secondary">Added {new Date(customer.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(customer._id, customer.name)}
                                            className="btn btn-sm btn-link text-danger p-0"
                                            title="Delete Customer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="p-3 bg-light rounded-4 border mb-3 d-flex flex-column gap-2 text-xs">
                                        <div className="d-flex align-items-center gap-2 text-secondary">
                                            <Phone size={14} className="text-primary" />
                                            <span className="text-dark fw-semibold">{customer.phone || 'No phone'}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-secondary">
                                            <Mail size={14} className="text-primary" />
                                            <span className="text-dark fw-semibold text-truncate">{customer.email || 'No email'}</span>
                                        </div>
                                        {customer.address && (
                                            <div className="d-flex align-items-center gap-2 text-secondary">
                                                <MapPin size={14} className="text-primary" />
                                                <span className="text-truncate">{customer.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Khata / Outstanding Due Section */}
                                <div className="border-top pt-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="text-xs text-secondary d-block fw-bold text-uppercase">Khata / Due Balance</span>
                                            <span className={`h6 mb-0 fw-bold ${due > 0 ? 'text-danger' : 'text-success'}`}>
                                                ₹{due.toFixed(2)}
                                            </span>
                                        </div>

                                        {due > 0 ? (
                                            <button 
                                                onClick={() => {
                                                    setSettleModal(customer);
                                                    setSettleAmount(due.toString());
                                                }}
                                                className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                                            >
                                                Settle Due
                                            </button>
                                        ) : (
                                            <span className="badge bg-success-subtle text-success text-xs rounded-pill px-2.5 py-1">
                                                All Clear
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg p-3">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark">Add New Customer</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateCustomer}>
                                <div className="modal-body pt-3">
                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newCustomer.name}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="+91..."
                                            value={newCustomer.phone}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={newCustomer.email}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newCustomer.address}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light-pro border px-4" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4 shadow-sm">
                                        Save Customer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Settle Due Modal */}
            {settleModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg p-3">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark">Settle Customer Due</h5>
                                <button type="button" className="btn-close" onClick={() => setSettleModal(null)}></button>
                            </div>
                            <form onSubmit={handleSettleDue}>
                                <div className="modal-body pt-3">
                                    <p className="text-secondary text-sm">
                                        Recording payment for <b>{settleModal.name}</b>. Total due outstanding: <b className="text-danger">₹{settleModal.dueBalance.toFixed(2)}</b>.
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Payment Amount Received (₹) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={settleAmount}
                                            onChange={(e) => setSettleAmount(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light-pro border px-4" onClick={() => setSettleModal(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success px-4 shadow-sm">
                                        Record Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
