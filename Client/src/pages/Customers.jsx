import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Users, Search, Plus, Phone, Mail, MapPin, MoreVertical, CreditCard, Calendar, Filter, ChevronRight } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { showError } = useToast();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (error) {
            showError('Failed to load customer list');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="fade-in pb-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Customer Directory</h2>
                    <p className="text-secondary mb-0">Total of {customers.length} professional profiles registered.</p>
                </div>
                <div className="d-flex gap-3">
                    <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm rounded-3">
                        <Plus size={18} />
                        <span className="fw-bold">Add Customer</span>
                    </button>
                </div>
            </div>

            <div className="card-pro p-4 mb-5 border-0 shadow-sm">
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
                    <div className="col-md-6 d-flex justify-content-md-end gap-2">
                        <button className="btn btn-light-pro border px-4 d-flex align-items-center gap-2 shadow-sm">
                            <Filter size={18} />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {filteredCustomers.map(customer => (
                    <div key={customer._id} className="col-md-6 col-lg-4">
                        <div className="card-pro p-0 h-100 overflow-hidden border-0 shadow-sm group hover-translate-y-n1 transition-all">
                            <div className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="fw-bold text-primary h4 mb-0 opacity-75">
                                            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <h5 className="mb-0 fw-extrabold text-dark group-hover-text-primary transition-all">{customer.name}</h5>
                                            <div className="text-secondary text-xs uppercase tracking-widest font-bold opacity-60">ID: {customer._id.slice(-6)}</div>
                                        </div>
                                    </div>
                                    <button className="btn-icon-light">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <div className="p-3 bg-light bg-opacity-50 rounded-4 border border-light mb-4 d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Phone size={14} className="text-primary" />
                                        <span className="text-sm fw-bold text-dark">{customer.phone || '-- No Phone --'}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <Mail size={14} className="text-primary" />
                                        <span className="text-sm fw-bold text-dark text-truncate">{customer.email || 'No email provided'}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <MapPin size={14} className="text-primary" />
                                        <span className="text-sm fw-bold text-secondary text-truncate opacity-75">{customer.address || 'Address information missing'}</span>
                                    </div>
                                </div>

                                <div className="row g-2 pt-1">
                                    <div className="col-6">
                                        <div className="p-2 border rounded-3 text-center bg-white shadow-xs">
                                            <div className="text-secondary text-xs uppercase tracking-wider mb-1">Total Bills</div>
                                            <div className="fw-bold text-dark">12 Invoices</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-2 border rounded-3 text-center bg-white shadow-xs">
                                            <div className="text-secondary text-xs uppercase tracking-wider mb-1">Lifetime Spend</div>
                                            <div className="fw-bold text-primary">₹{(Math.random() * 5000 + 500).toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-top p-3 d-flex gap-2 bg-light bg-opacity-30">
                                <button className="btn btn-white-pro shadow-xs border flex-grow-1 font-bold text-xs uppercase tracking-widest d-flex align-items-center justify-content-center gap-2 transition-all hover-bg-primary hover-text-white">
                                    <Calendar size={14} />
                                    <span>History</span>
                                </button>
                                <button className="btn btn-white-pro shadow-xs border flex-grow-1 font-bold text-xs uppercase tracking-widest d-flex align-items-center justify-content-center gap-2 transition-all hover-bg-primary hover-text-white">
                                    <span>Profile</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCustomers.length === 0 && !loading && (
                <div className="text-center py-5">
                    <div className="bg-light bg-opacity-30 p-5 rounded-circle d-inline-block mb-3 shadow-xs">
                        <Users size={64} className="text-secondary opacity-20" />
                    </div>
                    <h4 className="text-secondary fw-bold">Customer not found</h4>
                    <p className="text-secondary">Try searching for a different name or mobile number.</p>
                </div>
            )}

            <style>{`
                .card-pro {
                    background: white;
                    border-radius: 28px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .avatar-box {
                    width: 54px;
                    height: 54px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }
                .shadow-xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                .fw-extrabold { font-weight: 800; }
                .hover-translate-y-n1:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important; }
                
                .btn-white-pro {
                    background: white;
                    color: #475569;
                    border-radius: 12px;
                    padding: 0.75rem;
                }
                .btn-white-pro:hover {
                    border-color: var(--primary);
                }
                
                .btn-icon-light {
                    background: transparent;
                    color: #94A3B8;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-icon-light:hover { background: #F1F5F9; color: var(--primary); }
                
                .input-group-pro {
                    display: flex;
                    align-items: center;
                    background: #F8FAFC;
                    border: 2px solid transparent;
                    border-radius: 18px;
                    padding: 4px;
                    transition: all 0.2s;
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
                
                .btn-light-pro {
                    background: white;
                    color: #64748B;
                    font-weight: 700;
                    border-radius: 16px;
                    padding: 0.8rem 1.5rem;
                    transition: all 0.2s;
                }
                .btn-light-pro:hover {
                    background: #F1F5F9;
                    color: var(--primary);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default Customers;
