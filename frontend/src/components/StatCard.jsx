import React from 'react';

const StatCard = ({ title, value, subtext }) => {
    return (
        <div className="stat-card">
            <h3>{title}</h3>
            <div className="stat-value">{value}</div>
            {subtext && <div className="stat-subtext">{subtext}</div>}
        </div>
    );
};

export default StatCard;
