import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import Header from './Header';

function Dashboard({ user, onLogout, onUserUpdate }) {
  const [budgetForm, setBudgetForm] = useState({ monthlyBudget: '' });
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [recentGoals, setRecentGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, userRes, goalsRes, transactionsRes] = await Promise.all([
        axios.get('/transactions/summary'),
        axios.get('/auth/me'),
        axios.get('/goals?status=active'),
        axios.get('/transactions')
      ]);

      setSummary(summaryRes.data);
      onUserUpdate(userRes.data);
      setRecentGoals(goalsRes.data.slice(0, 3));
      setRecentTransactions(transactionsRes.data.slice(0, 5));
      setBudgetForm({ monthlyBudget: userRes.data.monthlyBudget || '' });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const monthlyBudget = parseFloat(budgetForm.monthlyBudget) || 0;
      await axios.put('/auth/profile', { monthlyBudget });
      
      const userRes = await axios.get('/auth/me');
      onUserUpdate(userRes.data);
      
      alert('Budget updated successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update budget:', error);
      alert('Failed to update budget');
    }
  };

  if (loading) {
    return (
      <div>
        <Header user={user} onLogout={onLogout} />
        <div style={{ padding: '40px', textAlign: 'center', color: '#e9f0ff' }}>Loading...</div>
      </div>
    );
  }

  const xpForNextLevel = user?.level ? Math.floor(1000 * Math.pow(1.5, user.level - 1)) : 1000;
  const xpProgress = user ? Math.min(100, (user.xp / xpForNextLevel) * 100) : 0;
  
  const budgetProgress = user?.monthlyBudget > 0 
    ? Math.min(100, (summary.totalExpenses / user.monthlyBudget) * 100) 
    : 0;
  
  let budgetClass = 'ok';
  if (budgetProgress > 100) budgetClass = 'bad';
  else if (budgetProgress > 80) budgetClass = 'warn';

  return (
    <div>
      <Header user={user} onLogout={onLogout} />

      <main className="layout">
        {/* Avatar/Hero Panel */}
        <section className="panel avatar-panel">
          <h2>Your Hero</h2>
          <div className="avatar" aria-label="avatar">
            <div className="avatar-face">😊</div>
          </div>
          <div className="level-row">
            <span id="levelLabel">Lvl {user?.level || 1}</span>
            <div className="bar xp-bar" aria-label="XP">
              <div className="bar-fill" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>
          <div className="hint" style={{ marginTop: '8px', textAlign: 'center' }}>
            {user?.xp || 0} / {xpForNextLevel} XP
          </div>
        </section>

        {/* Level Stats */}
        <section className="panel">
          <h2>Level</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--accent)' }}>
              {user?.level || 1}
            </div>
          </div>
          <div className="hint" style={{ textAlign: 'center' }}>Current Level</div>
        </section>

        {/* Coins */}
        <section className="panel">
          <h2>Coins</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--coin)' }}>
              🪙 {user?.coins || 0}
            </div>
          </div>
          <div className="hint" style={{ textAlign: 'center' }}>Total Coins</div>
        </section>

        {/* Streak */}
        <section className="panel">
          <h2>Streak</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--accent-2)' }}>
              🔥 {user?.streak?.count || 0}
            </div>
          </div>
          <div className="hint" style={{ textAlign: 'center' }}>Day Streak</div>
          <div className="streak-row" style={{ marginTop: '12px' }}>
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className={`streak-dot ${i < (user?.streak?.count || 0) ? 'on' : ''}`}
                title={`Day ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Account Info */}
        <section className="panel">
          <h2>Account</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="hint">Username:</span>
              <span style={{ fontWeight: '600' }}>{user?.username}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="hint">Email:</span>
              <span style={{ fontWeight: '600', fontSize: '13px', wordBreak: 'break-all' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="hint">Member:</span>
              <span style={{ fontWeight: '600' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* Expenses */}
        <section className="panel">
          <h2>Expenses</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--danger)' }}>
              ${summary.totalExpenses.toFixed(0)}
            </div>
          </div>
          <div className="hint" style={{ textAlign: 'center' }}>This Month</div>
        </section>

        {/* Balance */}
        <section className="panel">
          <h2>Balance</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', color: summary.balance >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
              ${summary.balance.toFixed(0)}
            </div>
          </div>
          <div className="hint" style={{ textAlign: 'center' }}>Current Balance</div>
        </section>

        {/* Income */}
        <section className="panel">
          <h2>Income</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--accent)' }}>
              ${summary.totalIncome.toFixed(0)}
            </div>
          </div>
          <div className="hint" style={{ textAlign: 'center' }}>This Month</div>
        </section>

        {/* Budget Settings - Spans 2 columns */}
        <section className="panel budget-panel" style={{ gridColumn: 'span 2' }}>
          <h2>Budget</h2>
          <form onSubmit={handleBudgetSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginTop: '16px' }}>
            <label style={{ flex: 1 }}>
              Monthly Budget ($)
              <input
                type="number"
                value={budgetForm.monthlyBudget}
                onChange={(e) => setBudgetForm({ monthlyBudget: e.target.value })}
                min="0"
                step="1"
                placeholder="2000"
                style={{ width: '100%' }}
              />
            </label>
            <button className="btn" type="submit">Update Budget</button>
          </form>
          {user?.monthlyBudget > 0 && (
            <>
              <div className="bar budget-bar" style={{ marginTop: '16px' }} aria-label="Budget">
                <div className={`bar-fill ${budgetClass}`} style={{ width: `${budgetProgress}%` }}></div>
              </div>
              <div className="hint" style={{ marginTop: '8px' }}>
                {Math.round(budgetProgress)}% used - ${summary.totalExpenses.toFixed(2)} / ${budgetForm.monthlyBudget}
              </div>
            </>
          )}
        </section>

        {/* Active Quests - Full Width */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Active Quests</h2>
            <a href="/goals" className="btn small">View All</a>
          </div>
          {recentGoals.length === 0 ? (
            <p className="hint" style={{ textAlign: 'center', padding: '20px' }}>
              No active quests. <a href="/goals" style={{ color: 'var(--accent)' }}>Create a goal!</a>
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {recentGoals.map(goal => (
                <div key={goal._id} style={{ padding: '16px', background: '#0c1330', borderRadius: '10px', border: '1px solid rgba(255,255,255,.08)' }}>
                  <div style={{ fontWeight: '800', marginBottom: '8px' }}>{goal.title}</div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}></div>
                  </div>
                  <div className="hint" style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>${goal.currentAmount.toFixed(0)} / ${goal.targetAmount.toFixed(0)}</span>
                    <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Transactions - Full Width */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Recent Transactions</h2>
            <a href="/transactions" className="btn small">View All</a>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="hint" style={{ textAlign: 'center', padding: '20px' }}>
              No transactions yet. <a href="/transactions" style={{ color: 'var(--accent)' }}>Start tracking!</a>
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {recentTransactions.map(transaction => {
                const isIncome = transaction.type === 'income';
                return (
                  <div key={transaction._id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: '#0c1330',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,.08)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px' }}>
                        {isIncome ? '💰' : '💸'} {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                      </div>
                      <div className="hint" style={{ fontSize: '11px' }}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '15px', 
                      fontWeight: '800', 
                      color: isIncome ? 'var(--accent)' : 'var(--danger)'
                    }}>
                      {isIncome ? '+' : '-'}${transaction.amount.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <small>Budget Quest - Level up your finances! 🎮💰</small>
      </footer>
    </div>
  );
}

export default Dashboard;
