import React, { useState } from 'react';

const ComplianceTable = ({ events }) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
        }
    };

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Risk Level</th>
                        <th>Detected Issues</th>
                        <th>Checked At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map(ev => (
                        <React.Fragment key={ev.transaction_id}>
                            <tr style={{ background: expandedId === ev.transaction_id ? '#f8f9fa' : 'white' }}>
                                <td>{ev.transaction_id}</td>
                                <td>
                                    <span className={`tag ${ev.risk_level === 'Safe' ? 'tag-safe' : 'tag-risk'}`}>
                                        {ev.risk_level}
                                    </span>
                                </td>
                                <td>{ev.detected_fields.slice(0, 2).join(', ') || 'None'} {ev.detected_fields.length > 2 && '...'}</td>
                                <td>{new Date(ev.created_at).toLocaleString()}</td>
                                <td>
                                    <button
                                        onClick={() => toggleExpand(ev.transaction_id)}
                                        style={{
                                            border: '1px solid #ddd',
                                            background: 'white',
                                            cursor: 'pointer',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {expandedId === ev.transaction_id ? 'Hide Report' : 'View Report'}
                                    </button>
                                </td>
                            </tr>
                            {expandedId === ev.transaction_id && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '0', borderBottom: '2px solid #e0e0e0' }}>
                                        <div style={{ padding: '1.5rem', background: '#fcfcfc', borderLeft: '4px solid #0056b3' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>🛡️ Remediation Agent Report</h4>

                                            <div style={{ marginBottom: '1rem' }}>
                                                <strong>Violation Details:</strong>
                                                <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                                                    {ev.detected_fields.map((field, idx) => (
                                                        <li key={idx} style={{ color: '#c0392b' }}>{field}</li>
                                                    ))}
                                                    {ev.detected_fields.length === 0 && <li style={{ color: '#27ae60' }}>No violations detected.</li>}
                                                </ul>
                                            </div>

                                            <div style={{ background: '#e8f4f8', padding: '1rem', borderRadius: '4px' }}>
                                                <strong>Recommended Action:</strong>
                                                <p style={{ margin: '0.5rem 0 0 0', color: '#2980b9', fontWeight: '500' }}>
                                                    {ev.remediation_plan}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    {events.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No compliance events found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ComplianceTable;
