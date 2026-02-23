import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RiskChart = ({ complianceEvents }) => {
    // Process data for the chart
    const dataDisplay = [
        { name: 'Safe', value: 0, color: '#27ae60' },
        { name: 'PII Risk', value: 0, color: '#f1c40f' },
        { name: 'Medium Risk', value: 0, color: '#e67e22' },
        { name: 'High/Critical', value: 0, color: '#c0392b' },
    ];

    complianceEvents.forEach(ev => {
        if (ev.risk_level === 'Safe') dataDisplay[0].value++;
        else if (ev.risk_level === 'PII Detected') dataDisplay[1].value++;
        else if (ev.risk_level === 'Medium Risk') dataDisplay[2].value++;
        else dataDisplay[3].value++;
    });

    // Filter out zero values for cleaner chart
    const data = dataDisplay.filter(d => d.value > 0);

    if (complianceEvents.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No data to visualize</div>;
    }

    return (
        <div style={{ height: '220px', width: '100%', background: 'white', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#555' }}>Risk Distribution</h3>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskChart;
