import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/main.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">Agentic Compliance Platform</div>
            <div className="navbar-links" style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/">Dashboard</Link>
                <Link to="/transactions">Transactions</Link>
                <Link to="/compliance">Compliance</Link>
                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: '1.5rem',
                        background: 'transparent',
                        border: '1px solid #c0392b',
                        color: '#c0392b',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
