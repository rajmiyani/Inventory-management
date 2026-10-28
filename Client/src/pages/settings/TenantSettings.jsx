import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
    Store, 
    FileText, 
    QrCode, 
    Landmark, 
    Palette, 
    Save, 
    Loader2, 
    Building2, 
    Percent, 
    ShieldCheck 
} from 'lucide-react';

const TenantSettings = () => {
    const { business, updateBusinessState, isOwner } = useAuth();
    const { showSuccess, showError } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        currency: 'INR',
        taxNumber: '',
        taxRate: 0,
        logoUrl: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'India'
        },
        invoiceSettings: {
            template: 'modern',
            primaryColor: '#2563EB',
            accentColor: '#06B6D4',
            paperSize: 'A4',
            showGstBreakdown: true,
            showUpiQr: true,
            bankDetails: {
                accountName: '',
                accountNumber: '',
                bankName: '',
                ifsc: '',
                upiId: ''
            },
            termsAndConditions: '1. Goods once sold will not be returned.\n2. Invoices are due within 15 days.\n3. Subject to local jurisdiction.',
            customFooterNote: 'Thank you for your business!'
        }
    });

    useEffect(() => {
        const fetchTenantProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get('/tenant/profile');
                if (res.data) {
                    setFormData({
                        name: res.data.name || '',
                        phone: res.data.phone || '',
                        currency: res.data.currency || 'INR',
                        taxNumber: res.data.taxNumber || '',
                        taxRate: res.data.taxRate || 0,
                        logoUrl: res.data.logoUrl || '',
                        address: {
                            street: res.data.address?.street || '',
                            city: res.data.address?.city || '',
                            state: res.data.address?.state || '',
                            zip: res.data.address?.zip || '',
                            country: res.data.address?.country || 'India'
                        },
                        invoiceSettings: {
                            template: res.data.invoiceSettings?.template || 'modern',
                            primaryColor: res.data.invoiceSettings?.primaryColor || '#2563EB',
                            accentColor: res.data.invoiceSettings?.accentColor || '#06B6D4',
                            paperSize: res.data.invoiceSettings?.paperSize || 'A4',
                            showGstBreakdown: res.data.invoiceSettings?.showGstBreakdown ?? true,
                            showUpiQr: res.data.invoiceSettings?.showUpiQr ?? true,
                            bankDetails: {
                                accountName: res.data.invoiceSettings?.bankDetails?.accountName || '',
                                accountNumber: res.data.invoiceSettings?.bankDetails?.accountNumber || '',
                                bankName: res.data.invoiceSettings?.bankDetails?.bankName || '',
                                ifsc: res.data.invoiceSettings?.bankDetails?.ifsc || '',
                                upiId: res.data.invoiceSettings?.bankDetails?.upiId || ''
                            },
                            termsAndConditions: res.data.invoiceSettings?.termsAndConditions || '1. Goods once sold will not be returned.\n2. Subject to local jurisdiction.',
                            customFooterNote: res.data.invoiceSettings?.customFooterNote || 'Thank you for your business!'
                        }
                    });
                }
            } catch (error) {
                showError('Failed to load store settings');
            } finally {
                setLoading(false);
            }
        };

        fetchTenantProfile();
    }, [showError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/tenant/profile', formData);
            showSuccess('Store profile & invoice branding updated successfully!');
            updateBusinessState(res.data.business);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-50">
                <Loader2 className="animate-spin text-primary" size={36} />
            </div>
        );
    }

    return (
        <div className="container-fluid py-4 px-3 px-md-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Store className="text-primary" size={28} />
                        <span>Business & Invoice Branding</span>
                    </h2>
                    <p className="text-secondary text-sm mb-0">
                        Customize store address, GST/VAT tax details, UPI payments, and PDF invoice styles
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* 1. Basic Store Details */}
                    <div className="col-lg-6">
                        <div className="card-clean border-0 shadow-sm rounded-4 p-4 h-100">
                            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                <Building2 size={20} className="text-primary" />
                                <span>Store Identity</span>
                            </h5>

                            <div className="mb-3">
                                <label className="form-label text-xs fw-bold text-secondary text-uppercase">Store / Business Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="row g-2 mb-3">
                                <div className="col-sm-6">
                                    <label className="form-label text-xs fw-bold text-secondary text-uppercase">Contact Phone</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label text-xs fw-bold text-secondary text-uppercase">Currency</label>
                                    <select
                                        className="form-select"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="INR">₹ INR (India)</option>
                                        <option value="USD">$ USD (US Dollar)</option>
                                        <option value="EUR">€ EUR (Euro)</option>
                                        <option value="GBP">£ GBP (Pound)</option>
                                        <option value="AED">AED (Dirham)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-xs fw-bold text-secondary text-uppercase">Street Address</label>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Shop / Unit No, Street Name"
                                    value={formData.address.street}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                />
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="City"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="State / Zip"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-sm-8">
                                    <label className="form-label text-xs fw-bold text-secondary text-uppercase">GSTIN / VAT / Tax ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. 07AAAAA0000A1Z5"
                                        value={formData.taxNumber}
                                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                                    />
                                </div>
                                <div className="col-sm-4">
                                    <label className="form-label text-xs fw-bold text-secondary text-uppercase">Default Tax %</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        value={formData.taxRate}
                                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Invoice & UPI Payment Customization */}
                    <div className="col-lg-6">
                        <div className="card-clean border-0 shadow-sm rounded-4 p-4 h-100">
                            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                <FileText size={20} className="text-primary" />
                                <span>PDF Invoice & Thermal Roll Settings</span>
                            </h5>

                            <div className="row g-2 mb-3">
                                <div className="col-sm-6">
                                    <label className="form-label text-xs fw-bold text-secondary text-uppercase">Primary Brand Color</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            type="color"
                                            className="form-control form-control-color rounded-3"
                                            value={formData.invoiceSettings.primaryColor}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                invoiceSettings: { ...formData.invoiceSettings, primaryColor: e.target.value }
                                            })}
                                            title="Choose Invoice Header Color"
                                        />
                                        <span className="text-xs fw-mono text-secondary">{formData.invoiceSettings.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label text-xs fw-bold text-secondary text-uppercase">Default Paper Size</label>
                                    <select
                                        className="form-select"
                                        value={formData.invoiceSettings.paperSize}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            invoiceSettings: { ...formData.invoiceSettings, paperSize: e.target.value }
                                        })}
                                    >
                                        <option value="A4">A4 Full Page (Standard GST)</option>
                                        <option value="thermal_80mm">Thermal 80mm Roll (POS)</option>
                                        <option value="thermal_58mm">Thermal 58mm Roll (Compact)</option>
                                    </select>
                                </div>
                            </div>

                            {/* UPI Scan to Pay */}
                            <div className="p-3 rounded-4 bg-light bg-opacity-75 border mb-3">
                                <h6 className="fw-bold text-dark text-xs text-uppercase mb-2 d-flex align-items-center gap-1.5">
                                    <QrCode size={16} className="text-primary" />
                                    <span>Scan to Pay UPI QR Code</span>
                                </h6>
                                <p className="text-secondary text-xs mb-2">
                                    Embed dynamic QR code directly into printable invoices so customers can scan with GPay / PhonePe / Paytm to settle bills.
                                </p>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="e.g. merchant@okhdfcbank"
                                    value={formData.invoiceSettings.bankDetails.upiId}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        invoiceSettings: {
                                            ...formData.invoiceSettings,
                                            bankDetails: { ...formData.invoiceSettings.bankDetails, upiId: e.target.value }
                                        }
                                    })}
                                />
                            </div>

                            {/* Terms & Footer Note */}
                            <div className="mb-3">
                                <label className="form-label text-xs fw-bold text-secondary text-uppercase">Invoice Terms & Conditions</label>
                                <textarea
                                    rows="2"
                                    className="form-control text-xs"
                                    value={formData.invoiceSettings.termsAndConditions}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        invoiceSettings: { ...formData.invoiceSettings, termsAndConditions: e.target.value }
                                    })}
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-xs fw-bold text-secondary text-uppercase">Custom Footer Thank You Message</label>
                                <input
                                    type="text"
                                    className="form-control text-sm"
                                    value={formData.invoiceSettings.customFooterNote}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        invoiceSettings: { ...formData.invoiceSettings, customFooterNote: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                    <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center gap-2 px-5 py-2.5 rounded-3 shadow-sm fw-bold"
                        disabled={saving || !isOwner}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantSettings;
