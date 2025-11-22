import React, { useState, useEffect } from 'react';
import api from '../api';

const MoveHistory = () => {
    const [moves, setMoves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMoves();
    }, []);

    const fetchMoves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/move-history');
            setMoves(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch move history');
        } finally {
            setLoading(false);
        }
    };

    const filteredMoves = moves.filter(move => {
        const searchLower = searchTerm.toLowerCase();
        return (
            move.reference.toLowerCase().includes(searchLower) ||
            move.contact?.toLowerCase().includes(searchLower) ||
            move.fromLocation?.name.toLowerCase().includes(searchLower) ||
            move.toLocation?.name.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="container">
            <h2>📋 Move History</h2>

            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="🔍 Search by reference, contact, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ margin: 0 }}
                />
            </div>

            {loading ? (
                <div className="spinner"></div>
            ) : filteredMoves.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {searchTerm ? '🔍 No moves found matching your search' : '📋 No move history yet'}
                    </p>
                </div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Reference</th>
                            <th>Date</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Contact</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMoves.map(move => (
                            <tr key={move.id}>
                                <td>{move.reference}</td>
                                <td>{new Date(move.date).toLocaleString()}</td>
                                <td>
                                    {move.fromLocation?.name}
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {move.fromLocation?.Warehouse?.name}
                                    </div>
                                </td>
                                <td>
                                    {move.toLocation?.name}
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {move.toLocation?.Warehouse?.name}
                                    </div>
                                </td>
                                <td>{move.contact || '-'}</td>
                                <td>
                                    <span className={`badge badge-${move.status === 'Ready' ? 'success' : 'warning'}`}>
                                        {move.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MoveHistory;
