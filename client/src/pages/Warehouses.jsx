import React, { useState, useEffect } from 'react';
import api from '../api';

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [formData, setFormData] = useState({ name: '', shortCode: '', address: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/warehouses');
            setWarehouses(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch warehouses');
        } finally {
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/warehouses/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/warehouses', formData);
            }
            fetchWarehouses();
            setFormData({ name: '', shortCode: '', address: '' });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to save warehouse');
        }
    };

    const handleEdit = (warehouse) => {
        setFormData({
            name: warehouse.name,
            shortCode: warehouse.shortCode,
            address: warehouse.address || ''
        });
        setEditingId(warehouse.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
        try {
            await api.delete(`/warehouses/${id}`);
            fetchWarehouses();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to delete warehouse');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', shortCode: '', address: '' });
    };

    return (
        <div className="container">
            <h2>🏭 Warehouse Management</h2>

            <form onSubmit={onSubmit}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {editingId ? '✏️ Edit Warehouse' : '➕ Add New Warehouse'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Warehouse Name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Short Code (e.g., WH)"
                        name="shortCode"
                        value={formData.shortCode}
                        onChange={onChange}
                        required
                    />
                </div>
                <textarea
                    placeholder="Address (optional)"
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    rows="3"
                    style={{ margin: 0, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit">
                        {editingId ? 'Update Warehouse' : 'Add Warehouse'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-secondary" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <div className="spinner"></div>
            ) : warehouses.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem', marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        🏭 No warehouses yet. Add your first warehouse above!
                    </p>
                </div>
            ) : (
                <div className="product-grid" style={{ marginTop: '2rem' }}>
                    {warehouses.map(warehouse => (
                        <div key={warehouse.id} className="product-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <h3>{warehouse.name}</h3>
                                <span className="badge badge-primary">{warehouse.shortCode}</span>
                            </div>

                            {warehouse.address && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    📍 {warehouse.address}
                                </p>
                            )}

                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    Locations
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary-light)' }}>
                                    {warehouse.Locations?.length || 0}
                                </div>
                            </div>

                            <div className="product-actions">
                                <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => handleEdit(warehouse)}
                                    style={{ flex: 1 }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn-danger btn-sm"
                                    onClick={() => handleDelete(warehouse.id)}
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

export default Warehouses;
