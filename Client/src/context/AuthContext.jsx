import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            // res.data can be { user, business } or just user
            if (res.data.user) {
                setUser(res.data.user);
                setBusiness(res.data.business);
            } else {
                setUser(res.data);
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
            localStorage.removeItem('token');
            setUser(null);
            setBusiness(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setBusiness(res.data.business);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setBusiness(res.data.business);
        return res.data;
    };

    const registerBusiness = async (formData) => {
        const res = await api.post('/auth/register-business', formData);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setBusiness(res.data.business);
        return res.data;
    };

    const updateBusinessState = (updatedBusiness) => {
        setBusiness(prev => ({ ...prev, ...updatedBusiness }));
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setBusiness(null);
    };

    const role = user?.role || 'cashier';
    const isOwner = role === 'owner' || role === 'admin' || role === 'superadmin';
    const isManager = role === 'manager';
    const isCashier = role === 'cashier' || role === 'staff';
    const canManageSettings = isOwner || isManager;
    const canViewAccounting = isOwner || isManager;

    const plan = business?.subscription?.plan || 'trial';

    // Feature permission checker according to SaaS tier
    const hasFeature = (featureKey) => {
        if (plan === 'trial' || plan === 'enterprise') return true;
        if (plan === 'growth') {
            return ['posBilling', 'basicInventory', 'thermalPrint', 'barcodeGenerator', 'stockAlerts', 'prioritySupport'].includes(featureKey);
        }
        if (plan === 'starter') {
            return ['posBilling', 'basicInventory', 'prioritySupport'].includes(featureKey);
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{
            user,
            business,
            login,
            register,
            registerBusiness,
            updateBusinessState,
            logout,
            loading,
            role,
            plan,
            hasFeature,
            isOwner,
            isManager,
            isCashier,
            canManageSettings,
            canViewAccounting
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
