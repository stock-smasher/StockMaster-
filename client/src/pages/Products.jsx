import React, { useEffect, useState } from 'react';
import api from '../api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: '', sku: '', quantity: 0, price: 0, description: '' });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/products', formData);
            }
            fetchProducts();
            setFormData({ name: '', sku: '', quantity: 0, price: 0, description: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            sku: product.sku,
            quantity: product.quantity,
            price: product.price,
            description: product.description || ''
        });
        setEditingId(product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Failed to delete product');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', sku: '', quantity: 0, price: 0, description: '' });
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h2>Products Management</h2>

            {/* Product Form */}
            <form onSubmit={onSubmit}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder="SKU"
                        name="sku"
                        value={formData.sku}
                        onChange={onChange}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={onChange}
                        min="0"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        name="price"
                        value={formData.price}
                        onChange={onChange}
                        step="0.01"
                        min="0"
                    />
                </div>
                <input
                    type="text"
                    placeholder="Description (optional)"
                    name="description"
                    value={formData.description}
                    onChange={onChange}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit">
                        {editingId ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-secondary" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Search Bar */}
            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="🔍 Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ margin: 0 }}
                />
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="spinner"></div>
            ) : filteredProducts.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {searchTerm ? '🔍 No products found matching your search' : '📦 No products yet. Add your first product above!'}
                    </p>
                </div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <h3>{product.name}</h3>
                                {product.quantity < 10 && (
                                    <span className="badge badge-warning">Low Stock</span>
                                )}
                            </div>

                            <p className="product-sku">SKU: {product.sku}</p>

                            {product.description && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {product.description}
                                </p>
                            )}

                            <div className="product-info">
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        Quantity
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: product.quantity < 10 ? 'var(--warning)' : 'var(--success)' }}>
                                        {product.quantity}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        Price
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary-light)' }}>
                                        ${parseFloat(product.price).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className="product-actions">
                                <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => handleEdit(product)}
                                    style={{ flex: 1 }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn-danger btn-sm"
                                    onClick={() => handleDelete(product.id)}
                                    style={{ flex: 1 }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;
