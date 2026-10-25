import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, Save, Store, MapPin, Phone, Globe, DollarSign } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        pharmacyName: '',
        address: '',
        contact: '',
        currency: 'USD',
        taxRate: 18,
        lowStockThreshold: 10
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (error) {
            showError('Failed to load system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/settings', settings);
            showSuccess('Settings updated and syncronized successfully!');
        } catch (error) {
            showError('Error updating system settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 className="mb-4 fw-bold">System Settings</h3>

            <form onSubmit={handleSave} className="card-clean p-4">
                <div className="mb-5">
                    <h5 className="mb-4 d-flex align-items-center gap-2">
                        <Store size={20} className="text-primary" />
                        <span>Business Profile</span>
                    </h5>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="form-label font-medium">Business/Pharmacy Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.pharmacyName}
                                onChange={(e) => setSettings({ ...settings, pharmacyName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-medium">Currency Symbol</label>
                            <div className="input-group">
                                <span className="input-group-text"><DollarSign size={16} /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={settings.currency}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label font-medium">Business Address</label>
                            <div className="input-group">
                                <span className="input-group-text"><MapPin size={16} /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-medium">Contact Number</label>
                            <div className="input-group">
                                <span className="input-group-text"><Phone size={16} /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={settings.contact}
                                    onChange={(e) => setSettings({ ...settings, contact: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-top pt-5">
                    <h5 className="mb-4 d-flex align-items-center gap-2">
                        <SettingsIcon size={20} className="text-primary" />
                        <span>Inventory & Taxation</span>
                    </h5>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="form-label font-medium">Global Tax Rate (%)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={settings.taxRate}
                                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-medium">Default Low Stock Threshold</label>
                            <input
                                type="number"
                                className="form-control"
                                value={settings.lowStockThreshold}
                                onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-top text-end">
                    <button type="submit" className="btn btn-primary px-5 d-inline-flex align-items-center gap-2" disabled={saving}>
                        <Save size={18} />
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
