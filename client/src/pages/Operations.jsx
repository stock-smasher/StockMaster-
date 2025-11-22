import React, { useState, useEffect } from 'react';
import api from '../api';

const Operations = () => {
    const [products, setProducts] = useState([]);
    const [operations, setOperations] = useState([]);
    const [formData, setFormData] = useState({
        type: 'receipt',
        productId: '',
        quantity: 0,
        reason: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, operationsRes] = await Promise.all([
                api.get('/products'),
                api.get('/operations')
            ]);
            setProducts(productsRes.data);
            setOperations(operationsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (!formData.productId) {
            alert('Please select a product');
            return;
        }
        try {
            await api.post('/operations', formData);
            setFormData({ type: 'receipt', productId: '', quantity: 0, reason: '' });
            fetchData();
            alert('Operation completed successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to perform operation');
        }
    };

    const getOperationColor = (type) => {
        switch (type) {
            case 'receipt': return 'success';
            case 'delivery': return 'primary';
            case 'transfer': return 'info';
            case 'adjustment': return 'warning';
            default: return 'secondary';
        }
    };

    const getOperationIcon = (type) => {
        switch (type) {
            case 'receipt': return '📥';
            case 'delivery': return '📤';
            case 'transfer': return '🔄';
            case 'adjustment': return '⚙️';
            default: return '📋';
        }
    };

    return (
        <div className="container">
            <h2>Inventory Operations</h2>

            {/* Operation Form */}
            <form onSubmit={onSubmit}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    New Operation
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Operation Type
                        </label>
                        <select name="type" value={formData.type} onChange={onChange} required>
                            <option value="receipt">Receipt (Add Stock)</option>
                            <option value="delivery">Delivery (Remove Stock)</option>
                            <option value="transfer">Transfer</option>
                            <option value="adjustment">Adjustment</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Product
                        </label>
                        <select name="productId" value={formData.productId} onChange={onChange} required>
                            <option value="">Select a product...</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Stock: {product.quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={onChange}
                            min="1"
                            required
                            style={{ margin: 0 }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Reason / Notes
                    </label>
                    <input
                        type="text"
                        name="reason"
                        value={formData.reason}
                        onChange={onChange}
                        placeholder="Enter reason for this operation..."
                        style={{ margin: 0 }}
                    />
                </div>

                <button type="submit">
                    Perform Operation
                </button>
            </form>

            {/* Recent Operations */}
            <div className="mt-4">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent Operations</h3>

                {loading ? (
                    <div className="spinner"></div>
                ) : operations.length === 0 ? (
                    <div className="card text-center" style={{ padding: '3rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            No operations yet. Perform your first operation above!
                        </p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Reason</th>
                                <th>Performed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.slice(0, 20).map(operation => (
                                <tr key={operation.id}>
                                    <td>{new Date(operation.date).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge badge-${getOperationColor(operation.type)}`}>
                                            {operation.type}
                                        </span>
                                    </td>
                                    <td>{operation.productId?.name || 'Deleted Product'}</td>
                                    <td style={{
                                        color: operation.type === 'receipt' ? 'var(--success)' :
                                            operation.type === 'delivery' ? 'var(--danger)' :
                                                'var(--text-primary)',
                                        fontWeight: '600'
                                    }}>
                                        {operation.type === 'receipt' ? '+' : operation.type === 'delivery' ? '-' : ''}
                                        {operation.quantity}
                                    </td>
                                    <td>{operation.reason || '-'}</td>
                                    <td>{operation.performedBy?.username || 'Unknown'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Operations;
