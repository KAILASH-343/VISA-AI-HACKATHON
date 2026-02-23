import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/main.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                🛡️ Agentic AI
            </div>

            <nav className="sidebar-menu">
                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    📊 Dashboard
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    💳 Transactions
                </NavLink>
                <NavLink to="/compliance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    ⚖️ Compliance
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn-sidebar">
                    ⭕ Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
