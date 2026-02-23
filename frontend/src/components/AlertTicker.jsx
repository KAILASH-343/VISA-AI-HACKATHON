import React from 'react';

const AlertTicker = ({ alerts }) => {
    return (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                🚨 Real-time Alerts
            </h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {alerts.length === 0 && <div style={{ color: '#999', fontSize: '0.9rem' }}>No active alerts</div>}
                {alerts.map((alert, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '0.8rem',
                        paddingBottom: '0.8rem',
                        borderBottom: '1px solid #f9f9f9',
                        fontSize: '0.9rem'
                    }}>
                        <span style={{ color: '#c0392b', fontWeight: 'bold' }}>[{alert.risk_level}]</span>
                        <span style={{ flex: 1 }}>{alert.detected_fields.join(", ")} detected in TX #{alert.transaction_id}</span>
                        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{new Date(alert.created_at).toLocaleTimeString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertTicker;
