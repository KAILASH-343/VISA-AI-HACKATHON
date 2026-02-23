import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Compliance from './pages/Compliance';
import Login from './pages/Login';
import { simulateTraffic } from './services/api';

// Layout wrapper to conditionally show Navbar
const Layout = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    // Simple auth check
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated && !isLoginPage) {
        return <Navigate to="/login" replace />;
    }

    if (isLoginPage) {
        return <div className="app-container">{children}</div>;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#0056b3' }}>Agentic Compliance Platform</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ background: '#e0e0e0', padding: '8px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                            👤 Rajiv Medapati
                        </div>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
};

function App() {
    const [autoSimulate, setAutoSimulate] = useState(false);

    // Global Auto-Simulate Effect (Runs even when navigating)
    useEffect(() => {
        let interval;
        if (autoSimulate) {
            console.log("Global Stream Active: Generating traffic...");
            const runSim = async () => {
                try {
                    await simulateTraffic();
                } catch (e) {
                    console.error("Auto-stream error", e);
                }
            };

            // Run immediately on start
            runSim();

            interval = setInterval(runSim, 3000);
        }
        return () => clearInterval(interval);
    }, [autoSimulate]);

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route
                        path="/dashboard"
                        element={<Dashboard autoSimulate={autoSimulate} setAutoSimulate={setAutoSimulate} />}
                    />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/compliance" element={<Compliance />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
