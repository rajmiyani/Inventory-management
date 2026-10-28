import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ReceiptIndianRupee,
    Users,
    History,
    Settings,
    LogOut,
    AlertTriangle,
    Wallet,
    User,
    ChevronRight,
    Store,
    Sparkles,
    UserPlus,
    CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user, business, isOwner, isManager, isCashier } = useAuth();

    const plan = business?.subscription?.plan || 'trial';
    const storeName = business?.name || 'SmartInv Store';

    const menuItems = [
        {
            group: 'Main',
            items: [
                { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            ]
        },
        {
            group: 'Inventory & POS',
            items: [
                { path: '/products', icon: <Package size={20} />, label: 'Inventory' },
                { path: '/products/alerts', icon: <AlertTriangle size={20} />, label: 'Stock Alerts' },
                { path: '/billing', icon: <ReceiptIndianRupee size={20} />, label: 'POS Billing' },
                { path: '/billing/history', icon: <History size={20} />, label: 'Sales History' },
            ]
        },
        {
            group: 'Management',
            items: [
                { path: '/customers', icon: <Users size={20} />, label: 'Customers & Due' },
                ...(!isCashier ? [{ path: '/accounting', icon: <Wallet size={20} />, label: 'Accounting & P&L' }] : []),
            ]
        },
        {
            group: 'SaaS & Store',
            items: [
                ...(!isCashier ? [{ path: '/settings/staff', icon: <UserPlus size={20} />, label: 'Team & Staff' }] : []),
                ...(isOwner ? [
                    { path: '/settings/subscription', icon: <CreditCard size={20} />, label: 'Subscription & Quota' },
                    { path: '/settings/tenant', icon: <Store size={20} />, label: 'Store Branding' }
                ] : []),
                { path: '/settings', icon: <Settings size={20} />, label: 'System Settings' }
            ]
        }
    ];

    return (
        <div className="sidebar shadow-lg d-flex flex-column p-0 bg-white">
            {/* Business Tenant Header */}
            <div className="p-3 mb-2 border-bottom mx-3">
                <div className="d-flex align-items-center gap-2.5 mb-1.5">
                    <div className="bg-primary text-white p-2 rounded-3 shadow-xs">
                        <Store size={22} />
                    </div>
                    <div className="overflow-hidden">
                        <h6 className="mb-0 text-dark fw-bold text-truncate" title={storeName}>
                            {storeName}
                        </h6>
                        <span className="text-secondary text-xs text-capitalize">
                            {business?.category || 'Retail Store'}
                        </span>
                    </div>
                </div>

                {/* Plan Badge */}
                <div className="d-flex align-items-center justify-content-between pt-1">
                    <span className="badge bg-primary-subtle text-primary text-uppercase font-monospace text-xs px-2 py-0.5 rounded-pill">
                        {plan} plan
                    </span>
                    {isOwner && (
                        <Link to="/settings/subscription" className="text-xs text-primary fw-semibold text-decoration-none">
                            Upgrade
                        </Link>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-grow-1 overflow-auto no-scrollbar py-2 px-3">
                {menuItems.map((group, gIdx) => (
                    <div key={gIdx} className="mb-3">
                        <div className="text-secondary text-xs fw-bold uppercase px-3 mb-1.5 tracking-widest opacity-50">
                            {group.group}
                        </div>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-link-pro ${isActive ? 'active' : ''}`}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    {item.icon}
                                    <span className="fw-medium">{item.label}</span>
                                </div>
                                <ChevronRight size={14} className="chevron opacity-0" />
                            </NavLink>
                        ))}
                    </div>
                ))}
            </div>

            {/* User Profile & Role Section */}
            <div className="p-3 border-top mt-auto bg-light bg-opacity-50">
                <Link to="/profile" className="d-flex align-items-center gap-2.5 p-2 rounded-3 text-decoration-none hover-bg-white transition-all mb-2.5 group">
                    <div className="bg-primary text-white p-2 rounded-circle shadow-sm" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={18} />
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-dark fw-bold text-sm text-truncate">{user?.name || 'Owner'}</div>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-light text-secondary border text-xs px-1.5 py-0.2 text-capitalize">
                                {user?.role || 'Owner'}
                            </span>
                        </div>
                    </div>
                </Link>

                <button
                    onClick={logout}
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 border-0 bg-danger bg-opacity-10 text-danger hover-bg-danger hover-text-white transition-all py-1.5 rounded-3 text-sm fw-bold"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
