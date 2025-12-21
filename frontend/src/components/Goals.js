import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import Header from './Header';

function Goals({ user, onLogout, onUserUpdate }) {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', description: '', deadline: '' });
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`/goals?status=${filter}`);
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) {
      alert('Please provide title and target amount');
      return;
    }

    try {
      const response = await axios.post('/goals', {
        title: newGoal.title,
        targetAmount: parseFloat(newGoal.targetAmount),
        description: newGoal.description,
        deadline: newGoal.deadline || undefined
      });

      setGoals([response.data.goal, ...goals]);
      setNewGoal({ title: '', targetAmount: '', description: '', deadline: '' });
      
      // Update user XP
      if (response.data.user) {
        onUserUpdate({ ...user, xp: response.data.user.xp, level: response.data.user.level });
      }

      alert(`Quest created! +${response.data.xpGained} XP earned!`);

      if (response.data.leveledUp) {
        alert(`⬆️ Level up! You're now level ${response.data.user.level}!`);
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create quest');
    }
  };

  const handleUpdateGoalProgress = async (goalId, addAmount) => {
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return;

    const newProgress = goal.currentAmount + addAmount;

    try {
      const response = await axios.put(`/goals/${goalId}/progress`, {
        amount: newProgress
      });

      setGoals(goals.map(g => g._id === goalId ? response.data.goal : g));

      if (response.data.completed) {
        alert(`🎉 Quest completed! +${response.data.xpGained} XP, +${response.data.coinsGained} coins!`);
        if (response.data.user) {
          onUserUpdate({ 
            ...user, 
            xp: response.data.user.xp, 
            level: response.data.user.level,
            coins: response.data.user.coins
          });
        }
        if (response.data.leveledUp) {
          alert(`⬆️ Level up! You're now level ${response.data.user.level}!`);
        }
        if (response.data.newAchievement) {
          alert(`🏆 New achievement unlocked: ${response.data.newAchievement.title}!`);
        }
        // Refresh to show updated status
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update quest progress');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Delete this quest?')) return;

    try {
      await axios.delete(`/goals/${goalId}`);
      setGoals(goals.filter(g => g._id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete quest');
    }
  };

  return (
    <div>
      <Header user={user} onLogout={onLogout} />

      <main className="layout">
        {/* Create Quest Panel */}
        <section className="panel quests-panel" style={{ gridColumn: '1 / -1' }}>
          <h2>Create New Quest</h2>
          <form onSubmit={handleCreateGoal} style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <div className="row" style={{ gap: '16px' }}>
              <label style={{ flex: 2 }}>
                Quest Name *
                <input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Emergency Fund"
                  required
                  style={{ width: '100%' }}
                />
              </label>
              <label style={{ flex: 1 }}>
                Target Amount ($) *
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  min="1"
                  step="0.01"
                  placeholder="1000"
                  required
                  style={{ width: '100%' }}
                />
              </label>
              <label style={{ flex: 1 }}>
                Deadline (Optional)
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  style={{ width: '100%' }}
                />
              </label>
            </div>
            <label>
              Description (Optional)
              <input
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Save for unexpected expenses"
                style={{ width: '100%' }}
              />
            </label>
            <button className="btn" type="submit" style={{ width: 'fit-content' }}>
              Create Quest (+50 XP)
            </button>
          </form>
        </section>

        {/* Quest List */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Your Quests</h2>
            <div className="row" style={{ gap: '8px' }}>
              <button 
                className={`btn small ${filter === 'active' ? '' : ''}`}
                onClick={() => setFilter('active')}
                style={{ 
                  background: filter === 'active' ? 'linear-gradient(180deg,var(--accent),#3bbd8f)' : '#0c1330',
                  color: filter === 'active' ? '#00130c' : 'var(--text)'
                }}
              >
                Active
              </button>
              <button 
                className={`btn small ${filter === 'completed' ? '' : ''}`}
                onClick={() => setFilter('completed')}
                style={{ 
                  background: filter === 'completed' ? 'linear-gradient(180deg,var(--accent),#3bbd8f)' : '#0c1330',
                  color: filter === 'completed' ? '#00130c' : 'var(--text)'
                }}
              >
                Completed
              </button>
            </div>
          </div>

          {loading ? (
            <p className="hint" style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
          ) : goals.length === 0 ? (
            <p className="hint" style={{ textAlign: 'center', padding: '40px' }}>
              {filter === 'active' 
                ? 'No active quests. Create your first quest above!' 
                : 'No completed quests yet. Keep working on your goals!'}
            </p>
          ) : (
            <ul className="list">
              {goals.map(goal => (
                <GoalItem 
                  key={goal._id} 
                  goal={goal} 
                  onUpdateProgress={handleUpdateGoalProgress}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <small>Budget Quest - Level up your finances! 🎮💰</small>
      </footer>
    </div>
  );
}

// GoalItem component
function GoalItem({ goal, onUpdateProgress, onDelete }) {
  const [addAmount, setAddAmount] = useState('');

  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const isCompleted = goal.status === 'completed';

  const handleAddProgress = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      onUpdateProgress(goal._id, amount);
      setAddAmount('');
    }
  };

  return (
    <li className="quest-item" style={{ gridTemplateColumns: '1fr auto' }}>
      <div className="quest-top">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="quest-name">{goal.title}</span>
          {goal.deadline && (
            <span className="hint" style={{ fontSize: '12px' }}>
              📅 {new Date(goal.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        {goal.description && (
          <div className="hint" style={{ marginBottom: '8px', fontSize: '13px' }}>
            {goal.description}
          </div>
        )}
        <div className="bar">
          <div className="bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span className="hint">
            ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)} ({Math.round(progress)}%)
          </span>
          <span className="hint">
            🎁 {Math.floor(goal.targetAmount / 10)} XP, {Math.floor(goal.targetAmount / 5)} coins
          </span>
        </div>
      </div>
      <div className="quest-controls" style={{ flexDirection: 'column', gap: '8px' }}>
        {isCompleted ? (
          <span className="quest-badge">Completed ✓</span>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="+$"
                style={{ width: '110px' }}
              />
              <button className="btn small" onClick={handleAddProgress}>
                Add
              </button>
            </div>
            <button 
              className="btn small" 
              onClick={() => onDelete(goal._id)}
              style={{ background: 'var(--danger)', width: '100%' }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default Goals;
