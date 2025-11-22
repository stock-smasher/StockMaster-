import React, { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = () => {
    const [ledger, setLedger] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        lowStockCount: 0,
        recentOperations: 0,
        lowStockProducts: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ledgerRes, statsRes] = await Promise.all([
                api.get('/ledger'),
                api.get('/dashboard/stats')
            ]);
            setLedger(ledgerRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLedger = ledger.filter(entry => {
        const productName = entry.productId?.name || 'Deleted Product';
        const operationType = entry.operationId?.type || 'N/A';
        return productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            operationType.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Dashboard</h2>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Products</div>
                    <div className="stat-value">{stats.totalProducts}</div>
                    <div className="stat-change">Active inventory items</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Inventory Value</div>
                    <div className="stat-value">${stats.totalValue}</div>
                    <div className="stat-change">Total stock worth</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Low Stock Alerts</div>
                    <div className="stat-value" style={{ color: stats.lowStockCount > 0 ? 'var(--warning)' : 'var(--success)' }}>
                        {stats.lowStockCount}
                    </div>
                    <div className="stat-change">Items below threshold</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Recent Operations</div>
                    <div className="stat-value">{stats.recentOperations}</div>
                    <div className="stat-change">Last 7 days</div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
                <div className="card mb-3" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'var(--warning)' }}>
                    <h3 style={{ color: 'var(--warning)', fontSize: '1.25rem', marginBottom: '1rem' }}>
                        ⚠️ Low Stock Alert
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {stats.lowStockProducts.map(product => (
                            <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                <span>{product.name}</span>
                                <span className="badge badge-warning">Only {product.quantity} left</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ledger History */}
            <div className="mt-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Ledger History</h3>
                    <input
                        type="text"
                        placeholder="Search ledger..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '300px', margin: 0 }}
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Operation</th>
                            <th>Change</th>
                            <th>Balance After</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLedger.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    {searchTerm ? 'No matching records found' : 'No ledger entries yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredLedger.map(entry => (
                                <tr key={entry.id}>
                                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                    <td>{entry.productId ? entry.productId.name : 'Deleted Product'}</td>
                                    <td>
                                        <span className={`badge badge-${entry.operationId?.type === 'receipt' ? 'success' :
                                                entry.operationId?.type === 'delivery' ? 'primary' :
                                                    entry.operationId?.type === 'adjustment' ? 'warning' :
                                                        'danger'
                                            }`}>
                                            {entry.operationId ? entry.operationId.type : 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ color: entry.change > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        {entry.change > 0 ? '+' : ''}{entry.change}
                                    </td>
                                    <td>{entry.balanceAfter}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
