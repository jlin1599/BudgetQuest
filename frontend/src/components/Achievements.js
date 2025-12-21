import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import Header from './Header';

function Achievements({ user, onLogout }) {
  const [achievements, setAchievements] = useState({ unlocked: [], all: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get('/achievements');
      setAchievements(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      setLoading(false);
    }
  };

  const unlockedCount = achievements.all.filter(a => a.unlocked).length;
  const totalCount = achievements.all.length;
  const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div>
      <Header user={user} onLogout={onLogout} />

      <main className="layout">
        {/* Progress Panel */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <h2>Achievement Progress</h2>
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                {unlockedCount} of {totalCount} unlocked
              </span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent)' }}>
                {progress}%
              </span>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </section>

        {/* Unlocked Achievements */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <h2>🏆 Unlocked Achievements</h2>
          {loading ? (
            <p className="hint" style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
          ) : achievements.all.filter(a => a.unlocked).length === 0 ? (
            <p className="hint" style={{ textAlign: 'center', padding: '40px' }}>
              No achievements unlocked yet. Complete quests and maintain streaks to earn them!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {achievements.all.filter(a => a.unlocked).map(achievement => (
                <AchievementCard key={achievement.type} achievement={achievement} unlocked={true} />
              ))}
            </div>
          )}
        </section>

        {/* Locked Achievements */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <h2>🔒 Locked Achievements</h2>
          {loading ? (
            <p className="hint" style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
          ) : achievements.all.filter(a => !a.unlocked).length === 0 ? (
            <p className="hint" style={{ textAlign: 'center', padding: '40px' }}>
              🎉 Congratulations! You've unlocked all achievements!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {achievements.all.filter(a => !a.unlocked).map(achievement => (
                <AchievementCard key={achievement.type} achievement={achievement} unlocked={false} />
              ))}
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

function AchievementCard({ achievement, unlocked }) {
  return (
    <div style={{
      padding: '20px',
      background: unlocked ? 'rgba(93, 214, 164, 0.1)' : 'rgba(155, 176, 224, 0.05)',
      border: unlocked ? '1px solid rgba(93, 214, 164, 0.3)' : '1px solid rgba(255,255,255,.08)',
      borderRadius: '12px',
      opacity: unlocked ? 1 : 0.6,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {!unlocked && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          fontSize: '20px'
        }}>
          🔒
        </div>
      )}
      <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>
        {achievement.icon}
      </div>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: '800', 
        marginBottom: '6px',
        textAlign: 'center',
        color: unlocked ? 'var(--accent)' : 'var(--text)'
      }}>
        {achievement.title}
      </div>
      <div style={{ 
        fontSize: '13px', 
        color: 'var(--muted)', 
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        {achievement.description}
      </div>
    </div>
  );
}

export default Achievements;
