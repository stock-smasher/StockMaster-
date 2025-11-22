import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!token) return null;

    return (
        <nav className="navbar">
            <h1>StockMaster</h1>
            <ul>
                <li><Link to="/">📊 Dashboard</Link></li>
                <li><Link to="/products">📦 Products</Link></li>
                <li><Link to="/operations">🔄 Operations</Link></li>
                <li><Link to="/warehouses">🏭 Warehouses</Link></li>
                <li><Link to="/locations">📍 Locations</Link></li>
                <li><Link to="/deliveries">🚚 Deliveries</Link></li>
                <li><Link to="/move-history">📋 Move History</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
        </nav>
    );
};

export default Navbar;
