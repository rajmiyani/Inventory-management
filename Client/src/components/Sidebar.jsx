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
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const menuItems = [
        {
            group: 'Main',
            items: [
                { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            ]
        },
        {
            group: 'Inventory & Sales',
            items: [
                { path: '/products', icon: <Package size={20} />, label: 'Inventory' },
                { path: '/products/alerts', icon: <AlertTriangle size={20} />, label: 'Stock Alerts' },
                { path: '/billing', icon: <ReceiptIndianRupee size={20} />, label: 'New Bill' },
                { path: '/billing/history', icon: <History size={20} />, label: 'Bill History' },
            ]
        },
        {
            group: 'Management',
            items: [
                { path: '/customers', icon: <Users size={20} />, label: 'Customers' },
                { path: '/accounting', icon: <Wallet size={20} />, label: 'Accounting' },
            ]
        },
        {
            group: 'System',
            items: [
                { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
            ]
        }
    ];

    return (
        <div className="sidebar shadow-lg d-flex flex-column p-0 bg-white">
            {/* Logo/Brand Section */}
            <div className="p-4 mb-2 d-flex align-items-center gap-2 border-bottom mx-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                    <LayoutDashboard size={24} />
                </div>
                <div>
                    <h5 className="mb-0 text-dark fw-bold" style={{ letterSpacing: '-0.5px' }}>SmartInv</h5>
                    <span className="text-secondary text-xs font-medium uppercase tracking-wider">Business Pro</span>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-grow-1 overflow-auto no-scrollbar py-3 px-3">
                {menuItems.map((group, gIdx) => (
                    <div key={gIdx} className="mb-4">
                        <div className="text-secondary text-xs fw-bold uppercase px-3 mb-2 tracking-widest opacity-50">
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

            {/* User Profile Section */}
            <div className="p-3 border-top mt-auto bg-light bg-opacity-50">
                <Link to="/profile" className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none hover-bg-white transition-all mb-3 group">
                    <div className="bg-primary text-white p-2 rounded-circle shadow-sm">
                        <User size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-dark fw-bold text-sm text-truncate">{user?.name || 'Guest User'}</div>
                        <div className="text-secondary text-xs text-truncate">{user?.email || 'View Profile'}</div>
                    </div>
                </Link>

                <button
                    onClick={logout}
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 border-0 bg-danger bg-opacity-10 text-danger hover-bg-danger hover-text-white transition-all py-2"
                >
                    <LogOut size={18} />
                    <span className="fw-bold">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
