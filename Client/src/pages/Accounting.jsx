import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Download,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    FileText,
    ArrowDownRight,
    Loader2,
    CheckCircle2,
    Clock,
    ChevronDown
} from 'lucide-react';

const Accounting = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState('1m'); // Default 1 Month
    const { showError } = useToast();

    const ranges = [
        { id: '7d', label: '7 Days' },
        { id: '15d', label: '15 Days' },
        { id: '1m', label: '1 Month' },
        { id: '3m', label: '3 Months' },
        { id: '6m', label: '6 Months' },
        { id: '1y', label: '1 Year' },
        { id: 'all', label: 'All Time' }
    ];

    useEffect(() => {
        fetchStats();
    }, [selectedRange]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/accounting/stats?range=${selectedRange}`);
            setStats(res.data);
        } catch (error) {
            showError('Failed to load accounting data');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Revenue', amount: stats?.totalIncome || 0, icon: <TrendingUp size={22} />, color: 'primary', trend: '+15.2%' },
        { label: 'Operating Expenses', amount: stats?.totalExpenses || 0, icon: <TrendingDown size={22} />, color: 'danger', trend: '+2.4%' },
        { label: 'Net Profit', amount: stats?.netProfit || 0, icon: <DollarSign size={22} />, color: 'success', trend: '+12.8%' },
    ];

    return (
        <div className="fade-in pb-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Financial Overview</h2>
                    <p className="text-secondary mb-0">Monitor your cash flow, track expenses, and analyze profit margins.</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="dropdown">
                        <button
                            className="btn btn-light-pro border shadow-sm d-flex align-items-center gap-2 px-3 dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <Calendar size={18} />
                            <span>Report: {ranges.find(r => r.id === selectedRange)?.label}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2 mt-2">
                            {ranges.map(range => (
                                <li key={range.id}>
                                    <button
                                        className={`dropdown-item rounded-3 py-2 px-3 fw-bold text-sm ${selectedRange === range.id ? 'bg-primary text-white' : ''}`}
                                        onClick={() => setSelectedRange(range.id)}
                                    >
                                        {range.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm rounded-3">
                        <Download size={18} />
                        <span className="fw-bold">Export Report</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <>
                    <div className="row g-4 mb-5">
                        {statCards.map((card, idx) => (
                            <div key={idx} className="col-md-4">
                                <div className="card-pro p-4 border-0 shadow-sm h-100 group transition-all">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className={`icon-box bg-${card.color}-soft text-${card.color} shadow-sm`}>
                                            {card.icon}
                                        </div>
                                        <div className="text-success text-xs fw-bold bg-success bg-opacity-10 px-2 py-1 rounded-pill">
                                            {card.trend}
                                        </div>
                                    </div>
                                    <div className="text-secondary text-xs fw-bold uppercase tracking-widest mb-1 opacity-60">
                                        {card.label}
                                    </div>
                                    <div className="h2 mb-0 fw-bold text-dark tracking-tighter">
                                        ₹{card.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card-pro border-0 shadow-sm overflow-hidden mb-4">
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-30">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                                <FileText size={20} className="text-primary" />
                                <span>Transaction Ledger</span>
                                <span className="text-xs text-secondary ms-2 opacity-50 fw-normal">Showing last {stats?.transactions?.length || 0} active records</span>
                            </h5>
                            <button className="btn btn-light-pro btn-sm border d-flex align-items-center gap-2 px-3 shadow-xs">
                                <Filter size={16} />
                                <span className="fw-bold">Filter Transactions</span>
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-clean-pro mb-0">
                                <thead>
                                    <tr className="bg-light bg-opacity-20 border-bottom">
                                        <th className="ps-4 py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Date & Time</th>
                                        <th className="py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Description</th>
                                        <th className="py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Type</th>
                                        <th className="py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Category</th>
                                        <th className="text-end py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Status</th>
                                        <th className="text-end pe-4 py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.transactions?.map((txn, idx) => (
                                        <tr key={idx} className="border-bottom group hover-bg-light transition-all">
                                            <td className="ps-4 py-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light p-2 rounded-3 text-secondary">
                                                        <Clock size={16} />
                                                    </div>
                                                    <div className="text-sm fw-bold text-dark">{new Date(txn.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 fw-bold text-dark text-sm">{txn.description}</td>
                                            <td className="py-4">
                                                <span className={`badge-pro text-xs font-bold uppercase tracking-wider ${txn.type === 'Income' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                                                    {txn.type}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className="bg-light-pro px-3 py-1 rounded-pill text-secondary text-xs fw-bold border">
                                                    {txn.category}
                                                </span>
                                            </td>
                                            <td className="text-end py-4">
                                                <div className="d-inline-flex align-items-center gap-2 text-xs fw-bold text-secondary opacity-75">
                                                    <CheckCircle2 size={14} className="text-success" />
                                                    <span>{txn.status}</span>
                                                </div>
                                            </td>
                                            <td className={`text-end pe-4 py-4 fw-bold h6 mb-0 ${txn.type === 'Income' ? 'text-primary' : 'text-danger'}`}>
                                                {txn.type === 'Income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats?.transactions || stats.transactions.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="mb-3 opacity-10">
                                                    <Wallet size={64} className="text-primary" />
                                                </div>
                                                <h5 className="text-secondary fw-bold">No transactions found</h5>
                                                <p className="text-secondary text-sm">No records match the selected {ranges.find(r => r.id === selectedRange)?.label} window.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .card-pro {
                    background: white;
                    border-radius: 28px;
                }
                .tracking-tighter { letter-spacing: -0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .text-xs { font-size: 0.75rem; }
                .bg-success-soft { background: rgba(16, 185, 129, 0.1); }
                .bg-danger-soft { background: rgba(239, 68, 68, 0.1); }
                .bg-primary-soft { background: rgba(139, 92, 246, 0.1); }
                .bg-light-pro { background: #F8FAFC; }
                
                .badge-pro {
                    padding: 0.4rem 0.8rem;
                    border-radius: 10px;
                }
                
                .table-clean-pro th { border: none; }
                .table-clean-pro td { border: none; vertical-align: middle; }
                
                .icon-box {
                    padding: 12px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .shadow-xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                
                .btn-light-pro {
                    background: white;
                    color: #64748B;
                    font-weight: 700;
                    border-radius: 14px;
                    padding: 0.6rem 1.2rem;
                    transition: all 0.2s;
                }
                .btn-light-pro:hover {
                    background: #F1F5F9;
                    color: var(--primary);
                }

                .dropdown-toggle::after {
                    display: none;
                }
                
                .dropdown-item {
                    transition: all 0.2s;
                }
                .dropdown-item:hover {
                    background: var(--primary-soft);
                    color: var(--primary);
                }
            `}</style>
        </div >
    );
};

export default Accounting;
