import React, { useState, useEffect } from 'react';
import api from '../api';

const Deliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [locations, setLocations] = useState([]);
    const [products, setProducts] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        reference: '',
        fromLocationId: '',
        toLocationId: '',
        contact: '',
        scheduleDate: '',
        items: []
    });
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const url = statusFilter ? `/deliveries?status=${statusFilter}` : '/deliveries';
            const [deliveriesRes, locationsRes, productsRes] = await Promise.all([
                api.get(url),
                api.get('/locations'),
                api.get('/products')
            ]);
            setDeliveries(deliveriesRes.data);
            setLocations(locationsRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const addProduct = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', quantity: 1 }]
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/deliveries', formData);
            fetchData();
            setShowForm(false);
            setFormData({
                reference: '',
                fromLocationId: '',
                toLocationId: '',
                contact: '',
                scheduleDate: '',
                items: []
            });
        } catch (err) {
            console.error(err);
            alert('Failed to create delivery');
        }
    };

    const changeStatus = async (deliveryId, newStatus) => {
        try {
            await api.put(`/deliveries/${deliveryId}/status`, { status: newStatus });
            fetchData();
            setSelectedDelivery(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to change status');
        }
    };

    const deleteDelivery = async (id) => {
        if (!window.confirm('Are you sure you want to delete this delivery?')) return;
        try {
            await api.delete(`/deliveries/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to delete delivery');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'waiting': return 'warning';
            case 'ready': return 'info';
            case 'done': return 'success';
            default: return 'secondary';
        }
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'draft': return 'waiting';
            case 'waiting': return 'ready';
            case 'ready': return 'done';
            default: return null;
        }
    };

    const canGoBack = (status) => status === 'waiting' || status === 'ready';

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Delivery Operations</h2>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'New Delivery'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={onSubmit} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Create New Delivery
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Reference (e.g., WH/OUT/0001)"
                            name="reference"
                            value={formData.reference}
                            onChange={onChange}
                            required
                            style={{ margin: 0 }}
                        />
                        <select name="fromLocationId" value={formData.fromLocationId} onChange={onChange} required style={{ margin: 0 }}>
                            <option value="">From Location...</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name} ({loc.Warehouse?.name})</option>
                            ))}
                        </select>
                        <select name="toLocationId" value={formData.toLocationId} onChange={onChange} required style={{ margin: 0 }}>
                            <option value="">To Location...</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name} ({loc.Warehouse?.name})</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Contact"
                            name="contact"
                            value={formData.contact}
                            onChange={onChange}
                            style={{ margin: 0 }}
                        />
                        <input
                            type="date"
                            name="scheduleDate"
                            value={formData.scheduleDate}
                            onChange={onChange}
                            style={{ margin: 0 }}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Products</label>
                            <button type="button" onClick={addProduct} className="btn-sm">+ Add Product</button>
                        </div>
                        {formData.items.map((item, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <select
                                    value={item.productId}
                                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                    required
                                    style={{ flex: 2, margin: 0 }}
                                >
                                    <option value="">Select product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                    min="1"
                                    required
                                    style={{ flex: 1, margin: 0 }}
                                />
                                <button type="button" onClick={() => removeItem(index)} className="btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={{ marginTop: '1rem' }}>Create Delivery</button>
                </form>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Filter by Status
                </label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: '300px', margin: 0 }}>
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="waiting">Waiting</option>
                    <option value="ready">Ready</option>
                    <option value="done">Done</option>
                </select>
            </div>

            {loading ? (
                <div className="spinner"></div>
            ) : deliveries.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        No deliveries yet. Create your first delivery above!
                    </p>
                </div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Reference</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Contact</th>
                            <th>Schedule</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveries.map(delivery => (
                            <tr key={delivery.id}>
                                <td>{delivery.reference}</td>
                                <td>{delivery.fromLocation?.name}</td>
                                <td>{delivery.toLocation?.name}</td>
                                <td>{delivery.contact || '-'}</td>
                                <td>{delivery.scheduleDate ? new Date(delivery.scheduleDate).toLocaleDateString() : '-'}</td>
                                <td>
                                    <span className={`badge badge-${getStatusColor(delivery.status)}`}>
                                        {delivery.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {delivery.status !== 'done' && getNextStatus(delivery.status) && (
                                            <button
                                                className="btn-success"
                                                onClick={() => changeStatus(delivery.id, getNextStatus(delivery.status))}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                            >
                                                Validate
                                            </button>
                                        )}
                                        {canGoBack(delivery.status) && (
                                            <button
                                                className="btn-secondary"
                                                onClick={() => changeStatus(delivery.id, delivery.status === 'waiting' ? 'draft' : 'waiting')}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                            >
                                                Back
                                            </button>
                                        )}
                                        {delivery.status === 'draft' && (
                                            <button
                                                className="btn-danger"
                                                onClick={() => deleteDelivery(delivery.id)}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Deliveries;
