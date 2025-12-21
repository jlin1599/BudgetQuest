const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');

// Get all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.userId };
    
    if (status) query.status = status;

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new goal
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, targetAmount, deadline } = req.body;

    // Validation
    if (!title || !targetAmount) {
      return res.status(400).json({ message: 'Please provide title and target amount' });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ message: 'Target amount must be greater than 0' });
    }

    // Calculate rewards based on target amount
    const xpReward = Math.floor(targetAmount / 10); // $10 = 1 XP for goal completion
    const coinReward = Math.floor(targetAmount / 5); // $5 = 1 coin

    const goal = new Goal({
      userId: req.userId,
      title,
      description,
      targetAmount,
      deadline,
      xpReward,
      coinReward
    });

    await goal.save();

    // Award XP for creating a goal
    const user = await User.findById(req.userId);
    const leveledUp = user.addXP(50); // 50 XP for setting a goal
    await user.save();

    res.status(201).json({
      goal,
      xpGained: 50,
      leveledUp,
      user: {
        xp: user.xp,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goal progress
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'Please provide a valid amount' });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.status !== 'active') {
      return res.status(400).json({ message: 'Cannot update inactive goal' });
    }

    // Update current amount
    goal.currentAmount = Math.min(amount, goal.targetAmount);
    
    // Check if goal is completed
    const wasCompleted = goal.checkCompletion();
    await goal.save();

    let response = { goal };

    // If goal completed, award rewards
    if (wasCompleted) {
      const user = await User.findById(req.userId);
      
      // Award XP and coins
      const leveledUp = user.addXP(goal.xpReward);
      user.coins += goal.coinReward;
      await user.save();

      // Check for achievements
      const completedGoals = await Goal.countDocuments({
        userId: req.userId,
        status: 'completed'
      });

      // First goal achievement
      if (completedGoals === 1) {
        const achievementData = Achievement.ACHIEVEMENTS.first_goal;
        const achievement = new Achievement({
          userId: req.userId,
          type: 'first_goal',
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon
        });
        await achievement.save();
        response.newAchievement = achievement;
      }

      // Quest master achievement (5 goals)
      if (completedGoals === 5) {
        const achievementData = Achievement.ACHIEVEMENTS.quest_master;
        const achievement = new Achievement({
          userId: req.userId,
          type: 'quest_master',
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon
        });
        await achievement.save();
        response.newAchievement = achievement;
      }

      // Check total savings achievements
      const allCompletedGoals = await Goal.find({
        userId: req.userId,
        status: 'completed'
      });
      
      const totalSaved = allCompletedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
      
      if (totalSaved >= 100 && totalSaved < 1000) {
        try {
          const achievementData = Achievement.ACHIEVEMENTS.saver_100;
          const achievement = new Achievement({
            userId: req.userId,
            type: 'saver_100',
            title: achievementData.title,
            description: achievementData.description,
            icon: achievementData.icon
          });
          await achievement.save();
          response.newAchievement = achievement;
        } catch (err) {
          // Achievement already exists, ignore
        }
      } else if (totalSaved >= 1000) {
        try {
          const achievementData = Achievement.ACHIEVEMENTS.saver_1000;
          const achievement = new Achievement({
            userId: req.userId,
            type: 'saver_1000',
            title: achievementData.title,
            description: achievementData.description,
            icon: achievementData.icon
          });
          await achievement.save();
          response.newAchievement = achievement;
        } catch (err) {
          // Achievement already exists, ignore
        }
      }

      response.completed = true;
      response.xpGained = goal.xpReward;
      response.coinsGained = goal.coinReward;
      response.leveledUp = leveledUp;
      response.user = {
        xp: user.xp,
        level: user.level,
        coins: user.coins
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goal details
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, targetAmount, deadline, status } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (deadline !== undefined) goal.deadline = deadline;
    if (status) goal.status = status;

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
