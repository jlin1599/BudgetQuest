const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['first_goal', 'level_5', 'level_10', 'streak_7', 'streak_30', 'saver_100', 'saver_1000', 'budget_keeper', 'quest_master']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

// Achievement definitions
achievementSchema.statics.ACHIEVEMENTS = {
  first_goal: {
    title: 'Quest Beginner',
    description: 'Complete your first savings goal',
    icon: '🎯'
  },
  level_5: {
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐'
  },
  level_10: {
    title: 'Budget Master',
    description: 'Reach level 10',
    icon: '👑'
  },
  streak_7: {
    title: 'Week Warrior',
    description: 'Maintain a 7-day login streak',
    icon: '🔥'
  },
  streak_30: {
    title: 'Month Champion',
    description: 'Maintain a 30-day login streak',
    icon: '💪'
  },
  saver_100: {
    title: 'Penny Pincher',
    description: 'Save $100 total',
    icon: '💰'
  },
  saver_1000: {
    title: 'Treasure Hunter',
    description: 'Save $1000 total',
    icon: '💎'
  },
  budget_keeper: {
    title: 'Budget Guardian',
    description: 'Stay under budget for a full month',
    icon: '🛡️'
  },
  quest_master: {
    title: 'Quest Master',
    description: 'Complete 5 savings goals',
    icon: '🏅'
  }
};

achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
