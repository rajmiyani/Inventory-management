import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Package,
    AlertCircle,
    Clock,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [invRes, accRes] = await Promise.all([
                api.get('/inventory/insights'),
                api.get('/accounting/stats')
            ]);
            setStats({ ...invRes.data, accounting: accRes.data });
        } catch (error) {
            console.error('Error fetching dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 fade-in">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    const chartData = {
        labels: stats?.accounting?.transactions?.length > 0
            ? stats.accounting.transactions.slice(0, 7).reverse().map(t => new Date(t.date).toLocaleDateString())
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                fill: true,
                label: 'Revenue',
                data: stats?.accounting?.transactions?.length > 0
                    ? stats.accounting.transactions.slice(0, 7).map(t => t.amount)
                    : [1200, 1900, 1500, 2500, 2200, 3000, 2800],
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#8B5CF6',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E293B',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
                ticks: { color: '#64748B', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748B', font: { size: 11 } }
            }
        }
    };

    const statCards = [
        { label: 'Total Products', value: stats?.stats?.totalProducts || 0, icon: <Package size={22} />, color: 'primary', trend: '+12%', isUp: true },
        { label: 'Low Stock', value: stats?.stats?.lowStockCount || 0, icon: <AlertCircle size={22} />, color: 'danger', trend: '-2%', isUp: false },
        { label: 'Expiring Soon', value: stats?.stats?.expiringCount || 0, icon: <Clock size={22} />, color: 'warning', trend: '0%', isUp: true },
        { label: 'Monthly Profit', value: `₹${stats?.accounting?.netProfit || '0.00'}`, icon: <TrendingUp size={22} />, color: 'success', trend: '+8%', isUp: true },
    ];

    return (
        <div className="fade-in pb-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</h2>
                    <p className="text-secondary mb-0">Here's what's happening with your inventory today.</p>
                </div>
                <div className="d-flex gap-2 no-print">
                    <Link to="/billing" className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm rounded-3">
                        <TrendingUp size={18} />
                        <span className="fw-bold">New Sale</span>
                    </Link>
                </div>
            </div>

            <div className="row g-4 mb-5">
                {statCards.map((card, idx) => (
                    <div key={idx} className="col-md-3">
                        <div className="card-pro p-4 group cursor-pointer transition-all h-100 border-0 shadow-sm">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className={`icon-box bg-${card.color}-soft text-${card.color}`}>
                                    {card.icon}
                                </div>
                                <div className={`d-flex align-items-center gap-1 text-xs fw-bold ${card.isUp ? 'text-success' : 'text-danger'}`}>
                                    {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {card.trend}
                                </div>
                            </div>
                            <div>
                                <div className="text-secondary text-xs fw-bold uppercase tracking-wider mb-1 opacity-75">{card.label}</div>
                                <div className="h3 mb-0 fw-bold text-dark">{card.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card-pro p-5 h-100 border-0 shadow-sm d-flex flex-column justify-content-center align-items-center text-center">
                        <div className="bg-primary-soft text-primary p-4 rounded-circle mb-4">
                            <TrendingUp size={64} />
                        </div>
                        <h3 className="fw-bold text-dark mb-2">Inventory Management Pro</h3>
                        <p className="text-secondary max-w-md mx-auto">Your business is growing! Monitor real-time stock levels, generate professional invoices, and track your financial health with ease.</p>
                        <div className="d-flex gap-3 mt-4">
                            <div className="p-3 bg-light rounded-4 text-start">
                                <div className="text-xs text-secondary uppercase fw-bold mb-1">Total Items</div>
                                <div className="h5 mb-0 fw-bold">{stats?.stats?.totalProducts || 0}</div>
                            </div>
                            <div className="p-3 bg-light rounded-4 text-start">
                                <div className="text-xs text-secondary uppercase fw-bold mb-1">Stock Health</div>
                                <div className="h5 mb-0 fw-bold text-success">Excellent</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card-pro p-4 h-100 border-0 shadow-sm d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark mb-0">Inventory Alerts</h5>
                            <Link to="/products/alerts" className="text-primary text-xs fw-bold text-decoration-none hover-underline">View All</Link>
                        </div>
                        <div className="flex-grow-1">
                            {stats?.lowStock?.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {stats.lowStock.slice(0, 5).map(prod => (
                                        <div key={prod._id} className="p-3 bg-light bg-opacity-50 rounded-4 d-flex justify-content-between align-items-center hover-bg-light transition-all cursor-pointer">
                                            <div className="overflow-hidden">
                                                <div className="fw-bold text-dark text-sm text-truncate">{prod.name}</div>
                                                <div className="text-secondary text-xs uppercase tracking-wider">SKU: {prod.sku}</div>
                                            </div>
                                            <div className="text-end ms-3">
                                                <div className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill text-xs fw-bold">
                                                    {prod.stock} {prod.unit}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="bg-success-soft text-success p-3 rounded-circle d-inline-block mb-3">
                                        <Package size={32} />
                                    </div>
                                    <h6 className="fw-bold text-secondary">All stock is healthy</h6>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-3 border-top">
                            <div className="p-3 bg-primary bg-opacity-5 rounded-4 d-flex align-items-center gap-3">
                                <div className="bg-primary text-white p-2 rounded-circle shadow-sm">
                                    <AlertCircle size={18} />
                                </div>
                                <div>
                                    <div className="text-dark fw-bold text-xs">{stats?.stats?.lowStockCount || 0} items low on stock</div>
                                    <div className="text-secondary text-xs">Immediate action recommended</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .card-pro {
                    background: white;
                    border-radius: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-pro:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.04) !important;
                }
                .icon-box {
                    padding: 12px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bg-primary-soft { background: rgba(139, 92, 246, 0.1); }
                .bg-danger-soft { background: rgba(239, 68, 68, 0.1); }
                .bg-warning-soft { background: rgba(245, 158, 11, 0.1); }
                .bg-success-soft { background: rgba(16, 185, 129, 0.1); }
                
                .text-xs { font-size: 0.75rem; }
                .tracking-wider { letter-spacing: 0.05em; }
                .progress.h-6 { height: 6px; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
