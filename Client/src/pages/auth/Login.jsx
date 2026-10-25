import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            showSuccess('Welcome back! Login successful.');
            navigate('/dashboard');
        } catch (err) {
            showError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center fade-in">
            <div className="card-clean p-5 shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-4">
                    <div className="bg-primary text-white p-3 rounded-circle d-inline-block mb-3">
                        <LogIn size={32} />
                    </div>
                    <h2 className="fw-bold mb-1">Welcome Back</h2>
                    <p className="text-secondary">Please sign in to your account</p>
                </div>

                {/* Toasts handle notifications now */}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 mb-3"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-secondary text-sm">Don't have an account? </span>
                    <Link to="/register" className="text-primary text-sm fw-semibold">Register now</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
