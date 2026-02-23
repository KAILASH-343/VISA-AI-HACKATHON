import React from 'react';

const TransactionTable = ({ transactions }) => {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Transaction</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Card</th>
                        <th>User Info</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.transaction_id}>
                            <td style={{ fontSize: '0.9rem', color: '#666' }}>{tx.transaction_id}</td>
                            <td>
                                <div>{tx.description}</div>
                            </td>
                            <td style={{ fontWeight: 'bold' }}>${tx.amount.toFixed(2)}</td>
                            <td>
                                {tx.card_last4 ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        💳 **** {tx.card_last4}
                                    </span>
                                ) : '-'}
                            </td>
                            <td>
                                <div style={{ fontSize: '0.85rem' }}>
                                    {tx.email && <div>✉️ {tx.email}</div>}
                                    {tx.phone && <div>📞 {tx.phone}</div>}
                                    {!tx.email && !tx.phone && <span style={{ color: '#ccc' }}>Anonymous</span>}
                                </div>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: '#888' }}>
                                {new Date(tx.timestamp).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No transactions found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
