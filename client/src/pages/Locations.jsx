import React, { useState, useEffect } from 'react';
import api from '../api';

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [formData, setFormData] = useState({ name: '', shortCode: '', warehouseId: '', parentLocationId: '' });
    const [editingId, setEditingId] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedWarehouse) {
            fetchLocationsByWarehouse(selectedWarehouse);
        } else {
            fetchLocations();
        }
    }, [selectedWarehouse]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [warehousesRes, locationsRes] = await Promise.all([
                api.get('/warehouses'),
                api.get('/locations')
            ]);
            setWarehouses(warehousesRes.data);
            setLocations(locationsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const res = await api.get('/locations');
            setLocations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLocationsByWarehouse = async (warehouseId) => {
        try {
            const res = await api.get(`/locations/warehouse/${warehouseId}`);
            setLocations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/locations/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/locations', formData);
            }
            fetchData();
            setFormData({ name: '', shortCode: '', warehouseId: '', parentLocationId: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to save location');
        }
    };

    const handleEdit = (location) => {
        setFormData({
            name: location.name,
            shortCode: location.shortCode,
            warehouseId: location.warehouseId,
            parentLocationId: location.parentLocationId || ''
        });
        setEditingId(location.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this location?')) return;
        try {
            await api.delete(`/locations/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to delete location');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', shortCode: '', warehouseId: '', parentLocationId: '' });
    };

    const availableParentLocations = locations.filter(loc =>
        loc.warehouseId === parseInt(formData.warehouseId) && loc.id !== editingId
    );

    return (
        <div className="container">
            <h2>📍 Location Management</h2>

            <form onSubmit={onSubmit}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {editingId ? '✏️ Edit Location' : '➕ Add New Location'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Warehouse *
                        </label>
                        <select name="warehouseId" value={formData.warehouseId} onChange={onChange} required style={{ margin: 0 }}>
                            <option value="">Select warehouse...</option>
                            {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Location Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Room A, Shelf 1"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            required
                            style={{ margin: 0 }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Short Code *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., RA, S1"
                            name="shortCode"
                            value={formData.shortCode}
                            onChange={onChange}
                            required
                            style={{ margin: 0 }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Parent Location (Optional)
                        </label>
                        <select name="parentLocationId" value={formData.parentLocationId} onChange={onChange} style={{ margin: 0 }}>
                            <option value="">None (Top Level)</option>
                            {availableParentLocations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit">
                        {editingId ? 'Update Location' : 'Add Location'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-secondary" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Filter by Warehouse
                </label>
                <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    style={{ maxWidth: '300px', margin: 0 }}
                >
                    <option value="">All Warehouses</option>
                    {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="spinner"></div>
            ) : locations.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        📍 No locations yet. Add your first location above!
                    </p>
                </div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Short Code</th>
                            <th>Warehouse</th>
                            <th>Parent Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map(location => (
                            <tr key={location.id}>
                                <td>{location.name}</td>
                                <td><span className="badge badge-primary">{location.shortCode}</span></td>
                                <td>{location.Warehouse?.name || 'N/A'}</td>
                                <td>{location.parentLocation?.name || '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-secondary btn-sm" onClick={() => handleEdit(location)}>
                                            ✏️
                                        </button>
                                        <button className="btn-danger btn-sm" onClick={() => handleDelete(location.id)}>
                                            🗑️
                                        </button>
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

export default Locations;
