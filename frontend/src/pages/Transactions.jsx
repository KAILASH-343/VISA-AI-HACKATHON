import React, { useEffect, useState } from 'react';
import TransactionTable from '../components/TransactionTable';
import { getTransactions } from '../services/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        getTransactions()
            .then(res => setTransactions(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <div className="page-header">
                <h2>Transactions</h2>
            </div>
            <TransactionTable transactions={transactions} />
        </div>
    );
};

export default Transactions;
