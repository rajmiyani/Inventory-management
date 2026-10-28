import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ChevronLeft } from 'lucide-react';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    /* ... state ... */
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        hsnCode: '',
        category: '',
        price: '',
        purchasePrice: '',
        taxRate: 0,
        stock: 0,
        lowStockThreshold: 10,
        unit: 'pcs',
        description: ''
    });

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/inventory/${id}`);
            setFormData(res.data);
        } catch (error) {
            showError('Error fetching product details');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await api.put(`/inventory/${id}`, formData);
                showSuccess('Product updated successfully');
            } else {
                await api.post('/inventory', formData);
                showSuccess('Product added successfully');
            }
            navigate('/products');
        } catch (error) {
            showError(error.response?.data?.error || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="mb-4">
                <Link to="/products" className="text-secondary text-decoration-none d-inline-flex align-items-center gap-2 mb-2">
                    <ChevronLeft size={18} />
                    <span>Back to Inventory</span>
                </Link>
                <h3>{id ? 'Edit Product' : 'Add New Product'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="card-clean p-4">
                <div className="row g-4">
                    <div className="col-md-6">
                        <label className="form-label font-medium">Product Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label font-medium">SKU (Barcode / Unique Code)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label font-medium">Category</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label font-medium">Unit (e.g., pcs, kg, ml)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label font-medium">HSN / SAC Code</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 8471"
                            value={formData.hsnCode || ''}
                            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label font-medium">Selling Price (Excl. Tax)</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white">₹</span>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label font-medium">Purchase Price</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white">₹</span>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.purchasePrice}
                                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label font-medium">Tax / GST Rate (%)</label>
                        <select
                            className="form-select"
                            value={formData.taxRate || 0}
                            onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                        >
                            <option value="0">0% (Tax Exempt)</option>
                            <option value="5">5% GST</option>
                            <option value="12">12% GST</option>
                            <option value="18">18% GST</option>
                            <option value="28">28% GST</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label font-medium">Initial Stock</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            disabled={!!id} // Usually stock is updated via purchases/sales
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label font-medium">Low Stock Threshold</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.lowStockThreshold}
                            onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label font-medium">Description</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-top text-end">
                    <Link to="/products" className="btn btn-light border px-4 me-3">Cancel</Link>
                    <button type="submit" className="btn btn-primary px-5 d-inline-flex align-items-center gap-2" disabled={loading}>
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
