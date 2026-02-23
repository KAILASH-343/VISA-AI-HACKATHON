import React, { useEffect, useState } from 'react';
import ComplianceTable from '../components/ComplianceTable';
import { getComplianceEvents, checkCompliance, getRegulations, ingestPolicy, deleteRegulation, uploadPolicyFile, saveAuditReport, getAuditHistory } from '../services/api';

const Compliance = () => {
    const [events, setEvents] = useState([]);
    const [regulations, setRegulations] = useState([]);
    const [policyText, setPolicyText] = useState("");
    const [loading, setLoading] = useState(false);
    const [agentStatus, setAgentStatus] = useState("Idle");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyReports, setHistoryReports] = useState([]);

    const fetchAll = () => {
        getComplianceEvents().then(res => setEvents(res.data)).catch(console.error);
        getRegulations().then(res => setRegulations(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleRunCheck = async () => {
        setLoading(true);
        try {
            await checkCompliance();
            fetchAll();
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleAgentIngest = async (e) => {
        e.preventDefault();
        setAgentStatus("Reading Policy...");
        try {
            await ingestPolicy(policyText);
            setAgentStatus("Updating Rules Engine...");
            setTimeout(() => {
                setAgentStatus("Rules Deployed ✅");
                setPolicyText("");
                fetchAll();
                setTimeout(() => setAgentStatus("Idle"), 3000);
            }, 1000);
        } catch (err) {
            setAgentStatus("❌ Failed to parse");
        }
    };

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Compliance Audit</h2>
                <button
                    onClick={handleRunCheck}
                    disabled={loading}
                    className="btn-primary"
                    style={{
                        padding: '0.6rem 1.2rem',
                        background: loading ? '#90caf9' : '#0056b3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}
                >
                    {loading ? 'Running Checks...' : 'Run Compliance Check'}
                </button>
            </div>

            {/* Regulation Agent Panel */}
            <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🤖 Regulation & Policy Mapping Agent
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Paste a new regulatory requirement below. The agent will parse it and update the compliance rules automatically.
                    </p>
                    <form onSubmit={handleAgentIngest}>
                        <div style={{ marginBottom: '10px' }}>
                            <textarea
                                value={policyText}
                                onChange={(e) => setPolicyText(e.target.value)}
                                placeholder="Ex: 'Flag all transactions with amount over 1000'"
                                style={{ width: '100%', height: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#555' }}>Or Upload Policy File (JSON):</div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setAgentStatus("Uploading File...");
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                        await uploadPolicyFile(formData);
                                        setAgentStatus("File Processed ✅");
                                        fetchAll();
                                        setTimeout(() => setAgentStatus("Idle"), 3000);
                                    } catch (err) {
                                        console.error(err);
                                        setAgentStatus("❌ Upload Failed");
                                    }
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: '#555' }}>Status: <strong>{agentStatus}</strong></span>
                            <button type="submit" style={{ padding: '0.4rem 1rem', background: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Process Policy
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', overflowY: 'auto', maxHeight: '250px' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Active Rules Knowledge Base</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {regulations.map(rule => (
                            <li key={rule.rule_id} style={{ padding: '0.8rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{rule.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{rule.description}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span className={`tag ${rule.is_active ? 'tag-safe' : 'tag-risk'}`}>Active</span>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(`Delete rule "${rule.name}"?`)) {
                                                try {
                                                    await deleteRegulation(rule.rule_id);
                                                    fetchAll();
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                                        title="Remove Rule"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* History Modal */}
            {showHistoryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>📜 Audit Report History</h3>
                            <button onClick={() => setShowHistoryModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
                        </div>
                        {historyReports.length === 0 ? (
                            <p style={{ color: '#777' }}>No history found.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f5f6fa', textAlign: 'left' }}>
                                        <th style={{ padding: '8px' }}>Date</th>
                                        <th style={{ padding: '8px' }}>Status</th>
                                        <th style={{ padding: '8px' }}>Auditor</th>
                                        <th style={{ padding: '8px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyReports.map(r => (
                                        <tr key={r.report_id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px' }}>{new Date(r.generated_at).toLocaleString()}</td>
                                            <td style={{ padding: '8px' }}>
                                                <span className={`tag ${r.compliance_score === 'Safe' ? 'tag-safe' : 'tag-risk'}`}>
                                                    {r.compliance_score} ({r.total_alerts})
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px' }}>{r.auditor_name}</td>
                                            <td style={{ padding: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        const win = window.open('', '_blank');
                                                        const content = `
                                                            <html>
                                                                <head>
                                                                    <title>Audit Report - ${r.report_id}</title>
                                                                    <style>
                                                                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                                                                        .header { border-bottom: 2px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                                                                        .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
                                                                        .meta { color: #7f8c8d; font-size: 14px; }
                                                                        .status-box { background: ${r.compliance_score === 'Safe' ? '#e8f5e9' : '#ffebee'}; border: 1px solid ${r.compliance_score === 'Safe' ? '#c8e6c9' : '#ffcdd2'}; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
                                                                        .status-title { font-size: 22px; font-weight: bold; margin-bottom: 10px; color: ${r.compliance_score === 'Safe' ? '#2e7d32' : '#c62828'}; }
                                                                        .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                                                        .details-table th, .details-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                                                        .details-table th { background-color: #f8f9fa; }
                                                                        .footer { margin-top: 50px; font-size: 12px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                                                                    </style>
                                                                </head>
                                                                <body>
                                                                    <div class="header">
                                                                        <div class="logo">🛡️ Agentic Compliance Platform</div>
                                                                        <div class="meta">REF: ${r.report_id}</div>
                                                                    </div>
                                                                    
                                                                    <h1>Official Compliance Audit Report</h1>
                                                                    <p>Generated on: <strong>${new Date(r.generated_at).toLocaleString()}</strong></p>
                                                                    <p>Authorized Auditor: <strong>${r.auditor_name}</strong></p>

                                                                    <div class="status-box">
                                                                        <div class="status-title">${r.compliance_score.toUpperCase()}</div>
                                                                        <div>Total Risks/Alerts Detected: <strong>${r.total_alerts}</strong></div>
                                                                    </div>

                                                                    <h3>Session Assessment Details</h3>
                                                                    <table class="details-table">
                                                                        <tr>
                                                                            <th>Metric</th>
                                                                            <th>Value</th>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Report ID</td>
                                                                            <td>${r.report_id}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Risk Level</td>
                                                                            <td>${r.total_alerts > 0 ? "High / Critical Compliance Violation" : "Low / Compliant"}</td>
                                                                        </tr>
                                                                         <tr>
                                                                            <td>Auditor Action</td>
                                                                            <td>${r.total_alerts > 0 ? "Flagged for manual review and remediation." : "Certified Safe."}</td>
                                                                        </tr>
                                                                    </table>
                                                                    
                                                                    <br/>
                                                                    <h3>Detailed Transaction Logs</h3>
                                                                    <table class="details-table" style="font-size: 12px;">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Transaction ID / Time</th>
                                                                                <th>Risk Level</th>
                                                                                <th>Flagged Issue</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            ${(r.events_summary || []).length > 0 ? (r.events_summary || []).map(e => `
                                                                                <tr>
                                                                                    <td>${e.transaction_id}<br/><span style="color:#888">${new Date(e.timestamp).toLocaleTimeString()}</span></td>
                                                                                    <td style="color: ${e.risk_level === 'Critical' ? 'red' : 'orange'}"><strong>${e.risk_level}</strong></td>
                                                                                    <td>${e.issue_type}</td>
                                                                                </tr>
                                                                            `).join('') : '<tr><td colspan="3">No critical violations logged in this snapshot.</td></tr>'}
                                                                        </tbody>
                                                                    </table>

                                                                    <div class="footer">
                                                                        This document is electronically generated by the Agentic AI Compliance Engine.<br/>
                                                                        Confidential - Internal Use Only.
                                                                    </div>
                                                                    <script>
                                                                        window.onload = function() { window.print(); }
                                                                    </script>
                                                                </body>
                                                            </html>
                                                        `;
                                                        win.document.write(content);
                                                        win.document.close();
                                                    }}
                                                    style={{
                                                        padding: '0.3rem 0.6rem',
                                                        background: '#0056b3',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    ⬇️ Download PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button onClick={() => setShowHistoryModal(false)} style={{ padding: '0.5rem 1rem', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compliance Table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Audit Trail Evidence</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const res = await getAuditHistory();
                                setHistoryReports(res.data);
                                setShowHistoryModal(true);
                            } catch (e) {
                                console.error(e);
                                alert("Failed to fetch history");
                            }
                            setLoading(false);
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#7f8c8d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        🕒 View History
                    </button>
                    <button
                        onClick={async () => {
                            // 1. Save to DB
                            const reportData = {
                                report_id: "rep_" + Date.now().toString(),
                                generated_at: new Date().toISOString(),
                                compliance_score: events.length > 0 ? "Action Required" : "Safe",
                                total_alerts: events.length,
                                auditor_name: "Rajiv Medapati",
                                pdf_url: "stored_in_s3_bucket_mock.pdf",
                                events_summary: events.map(e => ({
                                    transaction_id: e.transaction_id,
                                    timestamp: e.detected_at,
                                    risk_level: e.risk_level,
                                    issue_type: e.issue_type
                                }))
                            };
                            try {
                                await saveAuditReport(reportData);
                                // 2. Trigger Print
                                setTimeout(() => window.print(), 500);
                            } catch (e) {
                                console.error(e);
                                alert("Failed to save report to DB, but printing local copy.");
                                window.print();
                            }
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        📑 Save & Export (PDF)
                    </button>
                </div>
            </div>
            <ComplianceTable events={events} />
        </div>
    );
};

export default Compliance;
