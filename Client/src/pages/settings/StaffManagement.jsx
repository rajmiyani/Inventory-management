import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    Mail, 
    Phone, 
    Sparkles, 
    KeyRound, 
    X 
} from 'lucide-react';

const StaffManagement = () => {
    const { business, isOwner } = useAuth();
    const { showSuccess, showError } = useToast();

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        phone: ''
    });

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await api.get('/staff');
            setStaffList(res.data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/staff', formData);
            showSuccess(`Staff member ${formData.name} added successfully!`);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'cashier', phone: '' });
            fetchStaff();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to add staff member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await api.put(`/staff/${id}/status`, { status: newStatus });
            showSuccess(`Staff status set to ${newStatus}`);
            fetchStaff();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to update status');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from your team?`)) return;
        try {
            await api.delete(`/staff/${id}`);
            showSuccess('Staff member removed');
            fetchStaff();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to remove staff member');
        }
    };

    const maxStaff = business?.limits?.maxStaff || 2;
    const isAtLimit = staffList.length >= maxStaff;

    return (
        <div className="container-fluid py-4 px-3 px-md-4 fade-in">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Users className="text-primary" size={28} />
                        <span>Staff & Team Management</span>
                    </h2>
                    <p className="text-secondary text-sm mb-0">
                        Manage cashier accounts, managers, and system role access for {business?.name || 'your store'}
                    </p>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="text-end d-none d-sm-block">
                        <span className="text-xs text-secondary d-block">Plan Staff Quota</span>
                        <span className="fw-bold text-dark">{staffList.length} / {maxStaff} Members</span>
                    </div>

                    <button 
                        onClick={() => setShowModal(true)} 
                        className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
                        disabled={isAtLimit}
                    >
                        <UserPlus size={18} />
                        <span className="fw-semibold">Add Team Member</span>
                    </button>
                </div>
            </div>

            {/* Quota Limit Warning if near limit */}
            {isAtLimit && (
                <div className="alert alert-warning border-0 rounded-4 d-flex align-items-center gap-3 mb-4 shadow-sm">
                    <Sparkles className="text-warning" size={24} />
                    <div className="text-sm">
                        <b>Staff quota limit reached ({maxStaff}/{maxStaff}).</b> Need more cashier counters or branch managers? Upgrade to the <b>Growth</b> or <b>Enterprise</b> tier in Subscription settings.
                    </div>
                </div>
            )}

            {/* Staff Cards / Table */}
            <div className="card-clean border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-xs text-uppercase tracking-wider text-secondary fw-semibold">Team Member</th>
                                <th className="py-3 text-xs text-uppercase tracking-wider text-secondary fw-semibold">Role & Permissions</th>
                                <th className="py-3 text-xs text-uppercase tracking-wider text-secondary fw-semibold">Contact</th>
                                <th className="py-3 text-xs text-uppercase tracking-wider text-secondary fw-semibold">Status</th>
                                <th className="pe-4 py-3 text-end text-xs text-uppercase tracking-wider text-secondary fw-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <Loader2 className="animate-spin text-primary mx-auto mb-2" size={32} />
                                        <span className="text-secondary text-sm">Loading staff members...</span>
                                    </td>
                                </tr>
                            ) : staffList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-secondary">
                                        No additional staff members added yet. Click "Add Team Member" to invite cashiers.
                                    </td>
                                </tr>
                            ) : (
                                staffList.map(member => (
                                    <tr key={member._id} className="border-bottom">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{member.name}</div>
                                                    <div className="text-secondary text-xs">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            {member.role === 'owner' ? (
                                                <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-1 text-xs fw-bold">
                                                    👑 Store Owner
                                                </span>
                                            ) : member.role === 'manager' ? (
                                                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 text-xs fw-bold">
                                                    🛡️ Manager
                                                </span>
                                            ) : (
                                                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 text-xs fw-bold">
                                                    💳 POS Cashier
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm">{member.phone || 'No phone'}</span>
                                        </td>
                                        <td className="py-3">
                                            {member.status === 'active' ? (
                                                <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 text-xs d-inline-flex align-items-center gap-1">
                                                    <CheckCircle2 size={12} />
                                                    <span>Active</span>
                                                </span>
                                            ) : (
                                                <span className="badge bg-danger-subtle text-danger rounded-pill px-2.5 py-1 text-xs d-inline-flex align-items-center gap-1">
                                                    <XCircle size={12} />
                                                    <span>Suspended</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            {member.role !== 'owner' && isOwner && (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(member._id, member.status)}
                                                        className={`btn btn-sm ${member.status === 'active' ? 'btn-light border' : 'btn-success'}`}
                                                        title={member.status === 'active' ? 'Suspend access' : 'Activate access'}
                                                    >
                                                        {member.status === 'active' ? 'Suspend' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member._id, member.name)}
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Remove staff member"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg p-3">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                    <UserPlus className="text-primary" size={22} />
                                    <span>Add Team Member</span>
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <form onSubmit={handleAddStaff}>
                                <div className="modal-body pt-3">
                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="e.g. Rahul Sharma"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Login Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="staff@store.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-xs fw-bold text-secondary text-uppercase">Temporary Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            placeholder="At least 6 characters"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-sm-6">
                                            <label className="form-label text-xs fw-bold text-secondary text-uppercase">Assign Role *</label>
                                            <select 
                                                name="role" 
                                                className="form-select"
                                                value={formData.role} 
                                                onChange={handleChange}
                                            >
                                                <option value="cashier">Cashier (POS & Billing)</option>
                                                <option value="manager">Manager (Stock & Team)</option>
                                            </select>
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label text-xs fw-bold text-secondary text-uppercase">Contact Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="form-control"
                                                placeholder="+91..."
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0 pt-0">
                                    <button 
                                        type="button" 
                                        className="btn btn-light-pro border px-4" 
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-4 shadow-sm"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
