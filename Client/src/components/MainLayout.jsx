import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const MainLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="d-flex min-vh-100">
            <Sidebar />
            <div className="flex-grow-1 bg-light main-content overflow-hidden">
                <nav className="navbar bg-white border-bottom px-4 py-3 sticky-top">
                    <div className="container-fluid p-0">
                        <span className="navbar-brand text-secondary fw-medium">Welcome, {user.name}</span>
                        <div className="d-flex align-items-center gap-3">
                            <div className="text-end d-none d-sm-block">
                                <div className="fw-semibold text-primary">{user.name}</div>
                                <div className="text-secondary text-xs">{user.role}</div>
                            </div>
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white font-bold" style={{ width: '40px', height: '40px' }}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
