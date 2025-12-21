const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // Gamification fields
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  coins: {
    type: Number,
    default: 0
  },
  avatarColor: {
    type: String,
    default: '#3B82F6'
  },
  avatarAccessories: {
    type: [String],
    default: []
  },
  badges: {
    type: [String],
    default: []
  },
  streak: {
    count: {
      type: Number,
      default: 0
    },
    lastLoginDate: {
      type: Date,
      default: Date.now
    }
  },
  // Budget settings
  monthlyBudget: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate XP needed for next level (exponential growth)
userSchema.methods.getXPForNextLevel = function() {
  return Math.floor(1000 * Math.pow(1.5, this.level - 1));
};

// Check if user leveled up
userSchema.methods.checkLevelUp = function() {
  const xpNeeded = this.getXPForNextLevel();
  if (this.xp >= xpNeeded) {
    this.level += 1;
    this.xp -= xpNeeded;
    return true;
  }
  return false;
};

// Add XP and handle level ups
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  const leveledUp = this.checkLevelUp();
  return leveledUp;
};

// Update streak on login
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastLogin = new Date(this.streak.lastLoginDate);
  lastLogin.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastLogin;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays === 1) {
    // Consecutive day
    this.streak.count += 1;
    this.streak.lastLoginDate = new Date();
    return { streakContinued: true, currentStreak: this.streak.count };
  } else if (diffDays > 1) {
    // Streak broken
    const oldStreak = this.streak.count;
    this.streak.count = 1;
    this.streak.lastLoginDate = new Date();
    return { streakContinued: false, currentStreak: this.streak.count, oldStreak };
  } else {
    // Same day login
    return { streakContinued: false, currentStreak: this.streak.count, sameDay: true };
  }
};

module.exports = mongoose.model('User', userSchema);
