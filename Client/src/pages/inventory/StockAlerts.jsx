import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
    AlertCircle,
    PackageSearch,
    RefreshCw,
    ArrowRight,
    TrendingDown,
    Loader2,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StockAlerts = () => {
    const [data, setData] = useState({ lowStock: [], bestSellers: [], worstSellers: [] });
    const [loading, setLoading] = useState(true);
    const { showError } = useToast();

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inventory/insights');
            setData(res.data);
        } catch (error) {
            showError('Failed to load stock alerts');
        } finally {
            setLoading(false);
        }
    };

    const renderProductItem = (prod, type) => {
        const isCritical = type === 'low';
        const isBest = type === 'best';

        return (
            <div key={prod._id} className="col-md-6 col-lg-4">
                <div className={`card-pro h-100 group transition-all ${isBest ? 'border-primary-soft' : ''}`}>
                    <div className="p-4 h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div className={`icon-box shadow-sm border border-opacity-10 ${isBest ? 'bg-primary-soft text-primary border-primary' :
                                    isCritical ? 'bg-danger-soft text-danger border-danger' :
                                        'bg-warning-soft text-warning border-warning'
                                }`}>
                                {isBest ? <TrendingUp size={24} /> : isCritical ? <TrendingDown size={24} /> : <BarChart3 size={24} />}
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <span className={`badge-pro mb-1 shadow-sm ${isBest ? 'bg-primary text-white' :
                                        isCritical ? 'bg-danger text-white pulse-danger' :
                                            'bg-warning text-dark'
                                    }`}>
                                    {isBest ? `${prod.totalSales} Sold` : isCritical ? `${prod.stock} Left` : `${prod.totalSales} Sales`}
                                </span>
                                <span className="text-secondary text-xs opacity-75">
                                    {isBest ? 'Top Performer' : isCritical ? 'Critical Level' : 'Low Velocity'}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-1 group-hover-text-primary transition-all">
                                {prod.name}
                            </h5>
                            <div className="text-secondary text-sm d-flex align-items-center gap-2">
                                <span className="opacity-75">Category:</span>
                                <span className="fw-medium text-dark">{prod.category || 'General'}</span>
                            </div>
                        </div>

                        <div className="card-inner-soft p-3 rounded-4 mb-4 mb-auto">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-secondary text-xs uppercase tracking-widest">
                                    {isBest ? 'Market Share' : 'Inventory Health'}
                                </span>
                                <span className="text-xs fw-bold">
                                    {isBest ? 'High' : (prod.stock / (prod.lowStockThreshold || 10) * 100).toFixed(0) + '%'}
                                </span>
                            </div>
                            <div className={`progress h-6 mt-2 rounded-pill overflow-hidden ${isBest ? 'bg-primary bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                                <div
                                    className={`progress-bar shadow-sm ${isBest ? 'bg-primary' : 'bg-danger'}`}
                                    role="progressbar"
                                    style={{ width: isBest ? '100%' : `${Math.min(100, (prod.stock / (prod.lowStockThreshold || 1) * 100))}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="pt-3">
                            <Link to={`/products/edit/${prod._id}`} className="btn btn-primary-soft w-100 d-flex align-items-center justify-content-center gap-2 group-hover-bg-primary group-hover-text-white transition-all">
                                <span className="fw-bold">{isBest ? 'View Details' : 'Replenish Stock'}</span>
                                <ArrowRight size={18} className="transition-all transform group-hover-translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fade-in pb-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Business Analytics & Alerts</h2>
                    <p className="text-secondary mb-0">Actionable insights on stock health and sales performance.</p>
                </div>
                <button
                    onClick={fetchAlerts}
                    className="btn btn-light-pro d-flex align-items-center gap-2 border shadow-sm"
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Analytics</span>
                </button>
            </div>

            {/* Section 1: Critical Alerts */}
            <div className="mb-6">
                <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="bg-danger text-white p-2 rounded-3 shadow-sm">
                        <AlertCircle size={20} />
                    </div>
                    <h4 className="fw-bold text-dark mb-0">Critical Stock Alerts ({data.lowStock.length})</h4>
                </div>
                <div className="row g-4">
                    {data.lowStock.map(p => renderProductItem(p, 'low'))}
                    {data.lowStock.length === 0 && !loading && (
                        <div className="col-12 py-4">
                            <div className="p-4 bg-success bg-opacity-5 rounded-4 border border-dashed text-center">
                                <span className="text-success fw-bold">All products are healthy! No stock alerts.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 2: High Selling Products */}
            <div className="mb-6 mt-5">
                <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="bg-primary text-white p-2 rounded-3 shadow-sm">
                        <ArrowUpRight size={20} />
                    </div>
                    <h4 className="fw-bold text-dark mb-0">High Selling Products (Top 5)</h4>
                </div>
                <div className="row g-4">
                    {data.bestSellers.map(p => renderProductItem(p, 'best'))}
                    {data.bestSellers.length === 0 && !loading && (
                        <div className="col-12 py-4 text-center text-secondary opacity-50">
                            Insufficient sales data to show best sellers.
                        </div>
                    )}
                </div>
            </div>

            {/* Section 3: Low Selling Products */}
            <div className="mb-6 mt-5">
                <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="bg-warning text-dark p-2 rounded-3 shadow-sm">
                        <ArrowDownRight size={20} />
                    </div>
                    <h4 className="fw-bold text-dark mb-0">Low Selling / Dead Stock (Bottom 5)</h4>
                </div>
                <div className="row g-4">
                    {data.worstSellers.map(p => renderProductItem(p, 'worst'))}
                    {data.worstSellers.length === 0 && !loading && (
                        <div className="col-12 py-4 text-center text-secondary opacity-50">
                            All products are moving well!
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="text-center py-5 vh-50 d-flex align-items-center justify-content-center w-100">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            )}

            <style>{`
                .mb-6 { margin-bottom: 4rem; }
                .card-pro {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                }
                .card-pro:hover {
                    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.08);
                    border-color: rgba(139, 92, 246, 0.2);
                    transform: translateY(-5px);
                }
                .badge-pro {
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    font-weight: 700;
                }
                .card-inner-soft {
                    background: rgba(var(--bs-light-rgb), 0.5);
                    border: 1px solid rgba(0,0,0,0.02);
                }
                .btn-primary-soft {
                    background: var(--primary-soft);
                    color: var(--primary);
                    border: none;
                    border-radius: 14px;
                    padding: 0.8rem;
                }
                .btn-primary-soft:hover {
                    background: var(--primary);
                    color: white;
                }
                .h-6 { height: 6px; }
                .text-xs { font-size: 0.75rem; }
                .tracking-widest { letter-spacing: 0.1em; }
                .bg-danger-soft { background: rgba(239, 68, 68, 0.1); }
                .bg-primary-soft { background: rgba(139, 92, 246, 0.1); }
                .bg-warning-soft { background: rgba(245, 158, 11, 0.1); }
                .icon-box {
                    padding: 12px;
                    border-radius: 16px;
                }
                .group-hover-text-primary:hover { color: var(--primary); }
                .group-hover-translate-x-1 { transform: translateX(4px); }
                
                @keyframes pulse-danger {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .pulse-danger {
                    animation: pulse-danger 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default StockAlerts;
