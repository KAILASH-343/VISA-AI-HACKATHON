import React from 'react';

const EnterpriseStatCard = ({ title, value, status, icon }) => {
    let statusColor = '#27ae60'; // Green
    if (status === 'Critical' || status === 'High') statusColor = '#c0392b';
    if (status === 'Medium') statusColor = '#f39c12';

    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <div style={{
                fontSize: '2rem',
                background: '#f4f6f8',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50' }}>{value}</div>
                {status && <div style={{ fontSize: '0.8rem', color: statusColor, fontWeight: '600' }}>{status}</div>}
            </div>
        </div>
    );
};

export default EnterpriseStatCard;
