import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import Header from './Header';

const EXPENSE_CATEGORIES = ['food', 'transportation', 'entertainment', 'utilities', 'shopping', 'health', 'education', 'other'];
const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'other'];

function Transactions({ user, onLogout, onUserUpdate }) {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: 'food',
    description: ''
  });
  const [filter, setFilter] = useState({ type: 'all', category: 'all' });
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/transactions/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await axios.post('/transactions', {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });

      setTransactions([response.data.transaction, ...transactions]);
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: newTransaction.type === 'expense' ? 'food' : 'salary',
        description: ''
      });

      // Update user XP
      if (response.data.user) {
        onUserUpdate({ ...user, xp: response.data.user.xp, level: response.data.user.level });
      }

      if (response.data.leveledUp) {
        alert(`⬆️ Level up! You're now level ${response.data.user.level}!`);
      }

      if (response.data.xpGained > 0) {
        alert(`+${response.data.xpGained} XP earned!`);
      }

      fetchSummary();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await axios.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
      fetchSummary();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter.type !== 'all' && t.type !== filter.type) return false;
    if (filter.category !== 'all' && t.category !== filter.category) return false;
    return true;
  });

  const categories = newTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div>
      <Header user={user} onLogout={onLogout} />

      <main className="layout">
        {/* Summary Panel */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <h2>Monthly Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(93, 214, 164, 0.1)', borderRadius: '10px', border: '1px solid rgba(93, 214, 164, 0.3)' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Income</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>
                ${summary.totalIncome.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255, 117, 117, 0.1)', borderRadius: '10px', border: '1px solid rgba(255, 117, 117, 0.3)' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Expenses</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--danger)' }}>
                ${summary.totalExpenses.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(122, 162, 255, 0.1)', borderRadius: '10px', border: '1px solid rgba(122, 162, 255, 0.3)' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Balance</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: summary.balance >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                ${summary.balance.toFixed(2)}
              </div>
            </div>
          </div>
        </section>

        {/* Add Transaction Panel */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <h2>Add Transaction</h2>
          <form onSubmit={handleSubmit} className="row" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <label>
              Type
              <select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ 
                  ...newTransaction, 
                  type: e.target.value,
                  category: e.target.value === 'expense' ? 'food' : 'salary'
                })}
                style={{ background: '#0c1330', border: '1px solid rgba(255,255,255,.1)', color: 'var(--text)', padding: '12px 14px', borderRadius: '10px', minWidth: '150px' }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label>
              Amount ($)
              <input
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
              />
            </label>

            <label>
              Category
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                style={{ background: '#0c1330', border: '1px solid rgba(255,255,255,.1)', color: 'var(--text)', padding: '12px 14px', borderRadius: '10px', minWidth: '150px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </label>

            <label>
              Description
              <input
                type="text"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                placeholder="Optional description"
              />
            </label>

            <button className="btn" type="submit" style={{ alignSelf: 'flex-end' }}>
              Add Transaction
            </button>
          </form>
        </section>

        {/* Transactions List */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Transaction History</h2>
            <div className="row" style={{ gap: '8px' }}>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                style={{ background: '#0c1330', border: '1px solid rgba(255,255,255,.1)', color: 'var(--text)', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredTransactions.length === 0 ? (
              <p className="hint" style={{ textAlign: 'center', padding: '40px' }}>
                No transactions yet. Start tracking your finances!
              </p>
            ) : (
              <ul className="list">
                {filteredTransactions.map(transaction => (
                  <TransactionItem 
                    key={transaction._id} 
                    transaction={transaction} 
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <small>Budget Quest - Level up your finances! 🎮💰</small>
      </footer>
    </div>
  );
}

function TransactionItem({ transaction, onDelete }) {
  const date = new Date(transaction.date).toLocaleDateString();
  const isIncome = transaction.type === 'income';

  return (
    <li className="quest-item" style={{ gridTemplateColumns: 'auto 1fr auto auto' }}>
      <div style={{ fontSize: '24px', marginRight: '12px' }}>
        {isIncome ? '💰' : '💸'}
      </div>
      <div className="quest-top">
        <span className="quest-name">
          {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
          {transaction.description && ` - ${transaction.description}`}
        </span>
        <span className="hint">{date}</span>
      </div>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '800', 
        color: isIncome ? 'var(--accent)' : 'var(--danger)',
        marginRight: '12px'
      }}>
        {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
      </div>
      <button 
        onClick={() => onDelete(transaction._id)}
        className="btn small"
        style={{ background: 'var(--danger)', padding: '8px 10px' }}
      >
        ×
      </button>
    </li>
  );
}

export default Transactions;
