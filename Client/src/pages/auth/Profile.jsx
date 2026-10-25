import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { User, Mail, Phone, FileText, Save, Loader2, Camera, ShieldCheck, MapPin, Globe } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: ''
    });
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                bio: res.data.bio || ''
            });
        } catch (error) {
            showError('Failed to load profile');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/profile', {
                name: formData.name,
                phone: formData.phone,
                bio: formData.bio
            });
            setUser({ ...user, ...res.data });
            showSuccess('Profile updated successfully!');
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 fade-in">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="fade-in pb-5">
            {/* Header / Cover Area */}
            <div className="profile-cover mb-5 rounded-5 overflow-hidden position-relative shadow-lg border border-white border-4" style={{ height: '240px' }}>
                <div className="bg-gradient-primary h-100 w-100 opacity-90 d-flex align-items-end p-5">
                    <div className="d-flex align-items-center gap-4 z-2 mb-n5">
                        <div className="profile-avatar-container shadow-xl">
                            <div className="profile-avatar">
                                {formData.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <button className="avatar-edit-btn">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div className="text-white pb-3">
                            <h2 className="fw-bold mb-1 display-6">{formData.name}</h2>
                            <div className="d-flex align-items-center gap-2 opacity-75 fw-medium">
                                <ShieldCheck size={18} />
                                <span>Business Owner • {formData.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-4">
                <div className="col-lg-4">
                    <div className="card-pro p-4 h-100 border-0 shadow-sm border-top border-primary border-4">
                        <h5 className="fw-bold text-dark mb-4">Quick Stats</h5>
                        <div className="d-flex flex-column gap-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box bg-primary-soft text-primary">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-secondary fw-bold uppercase tracking-wider mb-0 text-dark">Location</div>
                                    <div className="fw-bold text-dark">Ludhiana, Punjab, IN</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box bg-success-soft text-success">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-secondary fw-bold uppercase tracking-wider mb-0">Website</div>
                                    <div className="fw-bold text-dark">smart-inv.pro</div>
                                </div>
                            </div>
                            <div className="pt-3 border-top mt-2">
                                <div className="text-xs text-secondary fw-bold uppercase tracking-widest mb-3 opacity-50">About Business</div>
                                <p className="text-secondary text-sm mb-0 lh-lg">
                                    {formData.bio || "No business description provided yet. Add one to show customers what you're about!"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <form onSubmit={handleSubmit} className="card-pro p-5 border-0 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                            <div>
                                <h4 className="fw-bold text-dark mb-1">Account Information</h4>
                                <p className="text-secondary mb-0">Update your public profile and contact handles.</p>
                            </div>
                            <div className="badge bg-primary bg-opacity-10 text-primary px-4 py-2 rounded-pill fw-bold">
                                Profile Settings
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label-pro">Display Name</label>
                                <div className="input-group-pro">
                                    <span className="input-group-icon">
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control-pro"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label-pro">Contact Phone</label>
                                <div className="input-group-pro">
                                    <span className="input-group-icon">
                                        <Phone size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control-pro"
                                        placeholder="+91 98765-43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label-pro">Business Email (Read Only)</label>
                                <div className="input-group-pro opacity-75 bg-light">
                                    <span className="input-group-icon">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control-pro"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label-pro">Business Biography</label>
                                <div className="input-group-pro align-items-start pt-2">
                                    <span className="input-group-icon pt-2">
                                        <FileText size={18} />
                                    </span>
                                    <textarea
                                        className="form-control-pro"
                                        rows="4"
                                        placeholder="Describe your business mission..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 text-end">
                            <button
                                type="submit"
                                className="btn-pay-complete shadow-lg d-inline-flex px-5 w-auto"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                <span className="ms-2">Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .profile-cover {
                    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
                }
                .profile-avatar-container {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    border: 6px solid white;
                    border-radius: 35px;
                    background: white;
                }
                .profile-avatar {
                    width: 100%;
                    height: 100%;
                    background: #F1F5F9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 800;
                    color: var(--primary);
                    border-radius: 28px;
                }
                .avatar-edit-btn {
                    position: absolute;
                    bottom: -10px;
                    right: -10px;
                    width: 36px;
                    height: 36px;
                    background: var(--primary);
                    color: white;
                    border: 4px solid white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                }
                .avatar-edit-btn:hover { transform: scale(1.1); }
                
                .form-label-pro {
                    font-weight: 700;
                    color: #475569;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.75rem;
                }
                
                .input-group-pro {
                    display: flex;
                    align-items: center;
                    background: #F8FAFC;
                    border: 2px solid transparent;
                    border-radius: 16px;
                    padding: 4px;
                    transition: all 0.2s ease;
                }
                .input-group-pro:focus-within {
                    background: white;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
                }
                .input-group-icon { padding: 0 15px; color: var(--primary); opacity: 0.6; }
                .form-control-pro {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 12px 0;
                    font-weight: 600;
                    color: #1E293B;
                }
                .form-control-pro:focus { outline: none; }
                
                .bg-gradient-primary {
                    background: linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 100%);
                }
                
                .icon-box {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                }
                .bg-primary-soft { background: rgba(139, 92, 246, 0.1); }
                .bg-success-soft { background: rgba(16, 185, 129, 0.1); }
                
                .btn-pay-complete {
                    padding: 1rem 2rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-weight: 800;
                    transition: all 0.3s;
                }
                .btn-pay-complete:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
                }
            `}</style>
        </div>
    );
};

export default Profile;
