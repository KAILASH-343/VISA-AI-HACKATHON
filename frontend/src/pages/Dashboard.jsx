import React, { useEffect, useState } from 'react';
import EnterpriseStatCard from '../components/EnterpriseStatCard';
import RiskChart from '../components/RiskChart';
import AlertTicker from '../components/AlertTicker';
import { getTransactions, getComplianceEvents, simulateTraffic, getTransactionCount, resetData } from '../services/api';

const Dashboard = ({ autoSimulate, setAutoSimulate }) => {
    const [stats, setStats] = useState({
        totalTransactions: 0,
        riskyTransactions: 0,
        evidenceGenerated: 0,
        systemStatus: 'Secure',
        dynamicScore: 0
    });
    const [events, setEvents] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [simulating, setSimulating] = useState(false);

    // Removed local interval effect, now handled globally in App.jsx

    const handleSimulate = async () => {
        setSimulating(true);
        try {
            await simulateTraffic();
            setTimeout(fetchData, 800);
        } catch (err) {
            console.error(err);
        }
        setSimulating(false);
    };

    const fetchData = async () => {
        try {
            const countRes = await getTransactionCount();
            const eventsRes = await getComplianceEvents();

            const riskyEvents = eventsRes.data.filter(e => e.risk_level !== 'Safe');
            const hasCritical = eventsRes.data.some(e => e.risk_level === 'Critical' || e.risk_level === 'High Risk');

            setEvents(eventsRes.data);
            setRecentAlerts(riskyEvents.slice(0, 5)); // Top 5 recent risks

            // Dynamic Risk Score Calculation
            let riskScore = 0; // Default if no data
            if (countRes.data.count > 0) {
                const total = countRes.data.count;
                // Weights: PII Risk (5), High Risk (15), Critical (30)
                let riskPenalty = 0;
                riskyEvents.forEach(e => {
                    if (e.risk_level === 'Critical') riskPenalty += 30;
                    else if (e.risk_level === 'High Risk') riskPenalty += 15;
                    else riskPenalty += 5; // Medium/PII
                });

                // Score = 100 - (Avg Penalty).
                // Example: 10 transactions. 2 Critical (60 penalty). Avg Penalty = 6. Score = 94. 
                // This is too lenient.

                // Revised Approach: Ratio of Good vs Bad.
                const safeCount = total - riskyEvents.length;
                const safetyRatio = safeCount / total; // e.g. 0.8 (80% safe)

                // Base Score from Ratio (Scale 0-100)
                let calcScore = Math.round(safetyRatio * 100);

                // Apply modifiers for severity
                // If there are Critical items, cap the score at 60 max.
                const hasCritical = riskyEvents.some(e => e.risk_level === 'Critical');
                if (hasCritical && calcScore > 65) calcScore = 65;

                // If there are only Medium items, cap at 85.
                if (riskyEvents.length > 0 && calcScore > 90) calcScore = 88;

                riskScore = calcScore;

                // If reset (0 data but initialized), show 0/100 as requested for "Reset" state.
                // But strictly if total is 0.
                if (total === 0) riskScore = 0;
            } else {
                riskScore = 0;
            }

            // Correction based on user preference: High Risk Score = Bad? Or Good?
            // "Protected" -> Green -> High Score?
            // User requested: "72/100" is standard. "0/100" on reset.
            // Let's implement: 100 (Safe) -> 0 (Risky).
            // BUT User said "0/100 when we reset".
            // So: Empty = 0/100.
            // Active Safe = 100/100.
            // Active Risky = 72/100.

            if (countRes.data.count === 0) {
                riskScore = 0;
            } else if (riskyEvents.length === 0) {
                riskScore = 100;
            }

            setStats({
                totalTransactions: countRes.data.count,
                riskyTransactions: riskyEvents.length,
                evidenceGenerated: riskyEvents.length,
                systemStatus: hasCritical ? 'Action Required' : 'Protected',
                dynamicScore: riskScore
            });
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {/* Header Area */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Compliance Control Center</h2>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>Real-time PCI / PII Monitoring Dashboard</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={async () => {
                            if (window.confirm('Reset all demo data?')) {
                                await resetData();
                                fetchData();
                            }
                        }}
                        className={`btn-primary`}
                        style={{ background: '#95a5a6', padding: '0.6rem 1.2rem', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🗑️ Reset Demo
                    </button>
                    <button
                        onClick={() => setAutoSimulate(!autoSimulate)}
                        className={`btn-primary`}
                        style={{ background: autoSimulate ? '#c0392b' : '#34495e', padding: '0.6rem 1.2rem', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {autoSimulate ? '🛑 Stop Stream' : '🔄 Auto Stream'}
                    </button>
                    <button
                        onClick={handleSimulate}
                        disabled={simulating || autoSimulate}
                        className={`btn-primary`}
                        style={{ padding: '0.6rem 1.2rem', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {simulating ? 'Generating...' : '⚡ Simulate Once'}
                    </button>
                </div>
            </div>

            {/* Enterprise Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <EnterpriseStatCard
                    title="Compliance Status"
                    value={stats.systemStatus}
                    icon="🛡️"
                    status={stats.systemStatus === 'Protected' ? 'Safe' : 'Critical'}
                />
                <EnterpriseStatCard
                    title="Risk Level"
                    value={
                        stats.totalTransactions === 0 ? "No Data" :
                            stats.dynamicScore >= 90 ? "Low Risk" :
                                stats.dynamicScore >= 70 ? "Medium Risk" : "High Risk"
                    }
                    icon="📊"
                    status={
                        stats.totalTransactions === 0 ? "Safe" :
                            stats.dynamicScore >= 90 ? 'Safe' :
                                stats.dynamicScore >= 70 ? 'Medium' : 'Critical'
                    }
                />
                <EnterpriseStatCard
                    title="Real-time Alerts"
                    value={stats.riskyTransactions}
                    icon="🚨"
                />
                <EnterpriseStatCard
                    title="Audit Evidence"
                    value={stats.evidenceGenerated}
                    icon="📑"
                />
            </div>

            {/* Main Content Areas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Visual Analytics */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <RiskChart complianceEvents={events} />
                </div>

                {/* Real-time Alerts */}
                <AlertTicker alerts={recentAlerts} />

                {/* Agents Status */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#555' }}>🤖 Active Agents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '6px', border: '1px solid #bbdefb' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0d47a1', marginBottom: '5px' }}>🔍 Regulation Agent</div>
                            <div style={{ fontSize: '0.8rem', color: '#1565c0' }}>Status: Online (NLP)</div>
                            <div style={{ fontSize: '0.75rem', color: '#27ae60', marginTop: '5px' }}>✔ Running</div>
                        </div>
                        <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '6px', border: '1px solid #c8e6c9' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1b5e20', marginBottom: '5px' }}>📑 Monitoring Agent</div>
                            <div style={{ fontSize: '0.8rem', color: '#2e7d32' }}>Status: Scanning</div>
                            <div style={{ fontSize: '0.75rem', color: '#27ae60', marginTop: '5px' }}>✔ Scanning</div>
                        </div>
                        <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '6px', border: '1px solid #ffe0b2' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e65100', marginBottom: '5px' }}>🛡️ Evidence Agent</div>
                            <div style={{ fontSize: '0.8rem', color: '#ef6c00' }}>Status: Standing By</div>
                            <div style={{ fontSize: '0.75rem', color: '#f39c12', marginTop: '5px' }}>Standing</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
