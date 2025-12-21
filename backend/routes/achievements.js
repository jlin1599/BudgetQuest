const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all achievements for user
router.get('/', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId }).sort({ unlockedAt: -1 });
    
    // Get all possible achievements
    const allAchievements = Object.keys(Achievement.ACHIEVEMENTS).map(key => ({
      type: key,
      ...Achievement.ACHIEVEMENTS[key],
      unlocked: achievements.some(a => a.type === key)
    }));

    res.json({
      unlocked: achievements,
      all: allAchievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check and award level-based achievements
router.post('/check-level', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const newAchievements = [];

    // Check level 5
    if (user.level >= 5) {
      const existing = await Achievement.findOne({ userId: req.userId, type: 'level_5' });
      if (!existing) {
        const achievementData = Achievement.ACHIEVEMENTS.level_5;
        const achievement = new Achievement({
          userId: req.userId,
          type: 'level_5',
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Check level 10
    if (user.level >= 10) {
      const existing = await Achievement.findOne({ userId: req.userId, type: 'level_10' });
      if (!existing) {
        const achievementData = Achievement.ACHIEVEMENTS.level_10;
        const achievement = new Achievement({
          userId: req.userId,
          type: 'level_10',
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    res.json({ newAchievements });
  } catch (error) {
    console.error('Check level achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check and award streak-based achievements
router.post('/check-streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const newAchievements = [];

    // Check 7-day streak
    if (user.streak.count >= 7) {
      const existing = await Achievement.findOne({ userId: req.userId, type: 'streak_7' });
      if (!existing) {
        const achievementData = Achievement.ACHIEVEMENTS.streak_7;
        const achievement = new Achievement({
          userId: req.userId,
          type: 'streak_7',
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Check 30-day streak
    if (user.streak.count >= 30) {
      const existing = await Achievement.findOne({ userId: req.userId, type: 'streak_30' });
      if (!existing) {
        const achievementData = Achievement.ACHIEVEMENTS.streak_30;
        const achievement = new Achievement({
          userId: req.userId,
          type: 'streak_30',
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    res.json({ newAchievements });
  } catch (error) {
    console.error('Check streak achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
