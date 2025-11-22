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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M9.5 19C5.35786 19 2 15.6421 2 11.5C2 7.35786 5.35786 4 9.5 4C12.3827 4 14.8855 5.62634 16.141 8.01153C16.2597 8.00388 16.3794 8 16.5 8C19.5376 8 22 10.4624 22 13.5C22 16.5376 19.5376 19 16.5 19C13.9485 19 12.1224 19 9.5 19Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <h1>StockMaster</h1>
            </div>
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/operations">Operations</Link></li>
                <li><Link to="/warehouses">Warehouses</Link></li>
                <li><Link to="/locations">Locations</Link></li>
                <li><Link to="/deliveries">Deliveries</Link></li>
                <li><Link to="/move-history">Move History</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
        </nav>
    );
};

export default Navbar;
