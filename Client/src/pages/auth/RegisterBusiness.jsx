import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
    Store, 
    User, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck, 
    Sparkles, 
    Building2, 
    BadgeCheck,
    CreditCard
} from 'lucide-react';

const RegisterBusiness = () => {
    const navigate = useNavigate();
    const { registerBusiness } = useAuth();
    const { showSuccess, showError } = useToast();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        businessName: '',
        category: 'retail',
        currency: 'INR',
        phone: '',
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!formData.businessName.trim()) {
            showError('Please enter your business or store name');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
            showError('Please fill in all owner credential fields');
            return;
        }
        if (formData.password.length < 6) {
            showError('Password should be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await registerBusiness(formData);
            showSuccess(`🎉 Welcome to SmartInv SaaS! Store created with 14-Day Free Trial.`);
            navigate('/dashboard');
        } catch (err) {
            showError(err.response?.data?.error || 'Failed to register business account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5 fade-in">
            <div className="card-clean p-4 p-md-5 shadow-lg border-0" style={{ maxWidth: '580px', width: '100%', borderRadius: '24px' }}>
                {/* Brand Header */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex p-3 rounded-4 bg-primary text-white shadow-sm mb-3">
                        <Store size={36} />
                    </div>
                    <h2 className="fw-bold tracking-tight mb-1">Start Your Business Store</h2>
                    <p className="text-secondary text-sm">Launch a modern multi-user POS & inventory system in seconds</p>
                </div>

                {/* Step Progress Bar */}
                <div className="d-flex align-items-center justify-content-between mb-4 px-3 position-relative">
                    <div className="d-flex align-items-center gap-2">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-secondary'}`} style={{ width: 28, height: 28 }}>
                            1
                        </div>
                        <span className={`text-xs fw-semibold ${step >= 1 ? 'text-primary' : 'text-secondary'}`}>Business Details</span>
                    </div>

                    <div className="flex-grow-1 mx-3" style={{ height: 2, background: step === 2 ? 'var(--primary, #2563EB)' : '#E2E8F0' }}></div>

                    <div className="d-flex align-items-center gap-2">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-xs ${step === 2 ? 'bg-primary text-white' : 'bg-light text-secondary'}`} style={{ width: 28, height: 28 }}>
                            2
                        </div>
                        <span className={`text-xs fw-semibold ${step === 2 ? 'text-primary' : 'text-secondary'}`}>Owner Account</span>
                    </div>
                </div>

                {/* Step 1: Business Profile */}
                {step === 1 && (
                    <form onSubmit={handleNext} className="fade-in">
                        <div className="mb-3">
                            <label className="form-label font-medium text-xs text-uppercase tracking-wider text-secondary">Store / Business Name *</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-secondary">
                                    <Building2 size={18} />
                                </span>
                                <input
                                    type="text"
                                    name="businessName"
                                    className="form-control border-start-0"
                                    placeholder="e.g. Apex Mart, Royal Pharma, Fashion Hub"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label font-medium text-xs text-uppercase tracking-wider text-secondary">Category / Industry</label>
                                <select 
                                    name="category" 
                                    className="form-select"
                                    value={formData.category} 
                                    onChange={handleChange}
                                >
                                    <option value="retail">General Retail / POS</option>
                                    <option value="pharmacy">Pharmacy / Medical</option>
                                    <option value="supermarket">Grocery / Supermarket</option>
                                    <option value="electronics">Electronics & Mobile</option>
                                    <option value="clothing">Fashion & Apparel</option>
                                    <option value="wholesale">Wholesale & Distribution</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label font-medium text-xs text-uppercase tracking-wider text-secondary">Billing Currency</label>
                                <select 
                                    name="currency" 
                                    className="form-select"
                                    value={formData.currency} 
                                    onChange={handleChange}
                                >
                                    <option value="INR">₹ INR (Indian Rupee)</option>
                                    <option value="USD">$ USD (US Dollar)</option>
                                    <option value="EUR">€ EUR (Euro)</option>
                                    <option value="GBP">£ GBP (British Pound)</option>
                                    <option value="AED">AED (UAE Dirham)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label font-medium text-xs text-uppercase tracking-wider text-secondary">Business Contact Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-control"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Free Trial Highlight */}
                        <div className="p-3 rounded-4 bg-light bg-opacity-75 border mb-4 d-flex align-items-center gap-3">
                            <div className="p-2 rounded-circle bg-success-subtle text-success">
                                <Sparkles size={20} />
                            </div>
                            <div className="text-xs">
                                <div className="fw-bold text-dark">Includes 14-Day Free Trial</div>
                                <span className="text-secondary">Unlimited products, thermal POS billing & staff accounts. No credit card required.</span>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm">
                            <span className="fw-semibold">Next: Create Owner Account</span>
                            <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                {/* Step 2: Owner Credentials */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="fade-in">
                        <div className="mb-3">
                            <label className="form-label font-medium text-xs text-uppercase tracking-wider text-secondary">Owner Full Name *</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-secondary">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control border-start-0"
                                    placeholder="Your Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label font-medium text-xs text-uppercase tracking-wider text-secondary">Work / Business Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="owner@yourdomain.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label font-medium text-xs text-uppercase tracking-wider text-secondary">Secure Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="d-flex gap-2 mb-3">
                            <button 
                                type="button" 
                                onClick={() => setStep(1)} 
                                className="btn btn-light-pro border px-4 py-2 rounded-3"
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary flex-grow-1 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>Setting up your store...</span>
                                ) : (
                                    <>
                                        <BadgeCheck size={18} />
                                        <span className="fw-semibold">Launch My Store (Free Trial)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-3 border-top pt-3">
                    <span className="text-secondary text-xs">Already have an account? </span>
                    <Link to="/login" className="text-primary text-xs fw-semibold text-decoration-none">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterBusiness;
