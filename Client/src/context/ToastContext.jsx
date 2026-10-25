import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = (msg) => addToast(msg, 'success');
    const showError = (msg) => addToast(msg, 'error');
    const showInfo = (msg) => addToast(msg, 'info');
    const showWarning = (msg) => addToast(msg, 'warning');

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
            {children}
            <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-show d-flex align-items-center p-3 mb-2 rounded-3 shadow-lg border-start border-4 ${toast.type === 'success' ? 'bg-success text-white border-success' :
                                toast.type === 'error' ? 'bg-danger text-white border-danger' :
                                    toast.type === 'warning' ? 'bg-warning text-dark border-warning' :
                                        'bg-primary text-white border-primary'
                            }`}
                        role="alert"
                    >
                        <div className="me-3">
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'warning' && <AlertTriangle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <div className="flex-grow-1 text-sm font-medium">{toast.message}</div>
                        <button
                            type="button"
                            className="bg-transparent border-0 text-white ms-3 opacity-75 hover-opacity-100"
                            onClick={() => removeToast(toast.id)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
