import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Filter,
    Package,
    LayoutGrid,
    List,
    ChevronRight,
    ArrowUpDown,
    Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/inventory');
            setProducts(res.data);
        } catch (error) {
            showError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/inventory/${id}`);
            setProducts(products.filter(p => p._id !== id));
            showSuccess('Product deleted successfully');
        } catch (error) {
            showError('Error deleting product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in pb-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Inventory Management</h2>
                    <p className="text-secondary mb-0">Manage your product catalog, track stock levels, and monitor SKU health.</p>
                </div>
                <div className="d-flex gap-3">
                    <button className="btn btn-light-pro border shadow-sm d-flex align-items-center gap-2 px-3">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <Link to="/products/add" className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm rounded-3">
                        <Plus size={18} />
                        <span className="fw-bold">Add Product</span>
                    </Link>
                </div>
            </div>

            <div className="card-pro p-4 mb-4 border-0 shadow-sm">
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group-pro">
                            <span className="input-group-icon">
                                <Search size={20} className="text-secondary opacity-50" />
                            </span>
                            <input
                                type="text"
                                className="form-control-pro"
                                placeholder="Search by name, SKU or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-7 d-flex justify-content-md-end gap-2">
                        <button className="btn btn-light-pro border px-3 d-flex align-items-center gap-2">
                            <Filter size={18} />
                            <span>Filter by Category</span>
                        </button>
                        <button className="btn btn-light-pro border px-3 d-flex align-items-center gap-2">
                            <ArrowUpDown size={18} />
                            <span>Sort: A-Z</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-pro overflow-hidden border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-clean-pro mb-0">
                        <thead>
                            <tr className="bg-light bg-opacity-30 border-bottom">
                                <th className="ps-4 py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Product Information</th>
                                <th className="py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Category</th>
                                <th className="py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Inventory Status</th>
                                <th className="py-4 text-xs uppercase tracking-widest text-secondary fw-bold">Pricing</th>
                                <th className="pe-4 py-4 text-end text-xs uppercase tracking-widest text-secondary fw-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => {
                                const isLow = product.stock <= product.lowStockThreshold;
                                return (
                                    <tr key={product._id} className="border-bottom group hover-bg-light transition-all">
                                        <td className="ps-4 py-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <Package size={22} className="text-secondary opacity-50" />
                                                <div>
                                                    <div className="fw-bold text-dark h6 mb-1 transition-all group-hover-text-primary">{product.name}</div>
                                                    <div className="text-secondary text-xs uppercase tracking-wider fw-medium">SKU: {product.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="bg-light px-3 py-1 rounded-pill text-dark text-xs fw-bold uppercase">
                                                {product.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="d-flex flex-column gap-1" style={{ maxWidth: '140px' }}>
                                                <div className="d-flex justify-content-between text-xs mb-1">
                                                    <span className={`fw-bold ${isLow ? 'text-danger' : 'text-success'}`}>
                                                        {isLow ? 'Low Stock' : 'Healthy'}
                                                    </span>
                                                    <span className="text-secondary fw-bold">{product.stock} Units</span>
                                                </div>
                                                <div className="progress h-6 rounded-pill bg-light overflow-hidden">
                                                    <div
                                                        className={`progress-bar ${isLow ? 'bg-danger shadow-sm' : 'bg-success shadow-sm'}`}
                                                        style={{ width: `${Math.min(100, (product.stock / 50 * 100))}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="fw-bold text-dark h6 mb-0 font-monospace">₹{product.price.toFixed(2)}</div>
                                            <div className="text-secondary text-xs">
                                                <span className="badge bg-light text-secondary border px-1.5 py-0.5 me-1">{product.taxRate || 0}% GST</span>
                                                <span>per {product.unit || 'pcs'}</span>
                                            </div>
                                        </td>
                                        <td className="pe-4 py-4 text-end">
                                            <div className="d-flex justify-content-end gap-2 transition-all">
                                                <Link to={`/products/edit/${product._id}`} className="btn-icon-primary" title="Edit Product">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button onClick={() => deleteProduct(product._id)} className="btn-icon-danger" title="Delete Product">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="btn-icon-light">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && !loading && (
                    <div className="text-center py-5">
                        <div className="bg-light bg-opacity-30 p-4 rounded-circle d-inline-block mb-3">
                            <Search size={48} className="text-secondary opacity-20" />
                        </div>
                        <h5 className="text-secondary fw-bold">No products found</h5>
                        <p className="text-secondary text-sm">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>

            <style>{`
                .card-pro {
                    background: white;
                    border-radius: 28px;
                }
                .table-clean-pro th { border: none; }
                .table-clean-pro td { border: none; vertical-align: middle; }
                
                .btn-icon-primary {
                    background: rgba(139, 92, 246, 0.05);
                    color: var(--primary);
                    border: none;
                    padding: 10px;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .btn-icon-primary:hover { background: var(--primary); color: white; transform: translateY(-2px); }
                
                .btn-icon-danger {
                    background: rgba(239, 68, 68, 0.05);
                    color: #EF4444;
                    border: none;
                    padding: 10px;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .btn-icon-danger:hover { background: #EF4444; color: white; transform: translateY(-2px); }
                
                .btn-icon-light {
                    background: transparent;
                    color: #CBD5E1;
                    border: none;
                    padding: 10px;
                    border-radius: 12px;
                }
                
                .input-group-pro {
                    display: flex;
                    align-items: center;
                    background: #F8FAFC;
                    border: 2px solid transparent;
                    border-radius: 16px;
                    padding: 2px;
                    transition: all 0.2s;
                }
                .input-group-pro:focus-within {
                    background: white;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
                }
                .input-group-icon { padding: 0 15px; }
                .form-control-pro {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 12px 0;
                    font-weight: 600;
                    color: #1E293B;
                }
                .form-control-pro:focus { outline: none; }
                .h-6 { height: 6px; }
                
                .btn-light-pro {
                    background: white;
                    color: #64748B;
                    font-weight: 600;
                    border-radius: 14px;
                    padding: 0.6rem 1.2rem;
                    transition: all 0.2s;
                }
                .btn-light-pro:hover {
                    background: #F8FAFC;
                    color: var(--primary);
                    border-color: var(--primary);
                }
            `}</style>
        </div>
    );
};

export default ProductList;
