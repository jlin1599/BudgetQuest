# Budget Quest 🎮💰

A gamified budgeting web application that turns financial management into an RPG adventure. Level up your avatar, complete quests (savings goals), earn XP and coins, and unlock achievements as you master your finances!

## Features

### 🎯 Gamification
- **XP & Leveling System**: Earn experience points for financial actions, level up your avatar
- **Coins**: Earn in-game currency by completing savings goals
- **Achievements**: Unlock 9 different achievements (Quest Master, Budget Guardian, etc.)
- **Streak Tracking**: Maintain daily login streaks for bonus rewards
- **Avatar Customization**: Customize your avatar with coins (coming soon)

### 💰 Financial Management
- **Budget Tracking**: Set monthly budgets and track spending with visual progress bars
- **Transaction Management**: Log income and expenses with categories
- **Savings Goals (Quests)**: Create and track savings goals with progress visualization
- **Monthly Summary**: View income, expenses, and balance at a glance

### 🎨 User Experience
- **Modern UI**: Game-themed dark interface with smooth animations
- **Toast Notifications**: Beautiful success/error notifications instead of browser alerts
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback on all actions

## Tech Stack

- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS3 with CSS Variables

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jlin1599/BudgetQuest.git
   cd BudgetQuest
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/budgetquest
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/budgetquest
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5001
   NODE_ENV=development
   ```
   
   Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   
   Start the frontend development server:
   ```bash
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Project Structure

```
BudgetQuest/
├── backend/              # Node.js/Express API
│   ├── models/          # MongoDB schemas (User, Goal, Transaction, Achievement)
│   ├── routes/          # API endpoints (auth, goals, transactions, achievements)
│   ├── middleware/      # JWT authentication middleware
│   └── server.js        # Main server file
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── Goals.js
│   │   │   ├── Transactions.js
│   │   │   ├── Achievements.js
│   │   │   ├── Header.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Toast.js
│   │   ├── App.js
│   │   └── App.css
│   └── public/
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id/progress` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/summary` - Get monthly summary
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Achievements
- `GET /api/achievements` - Get all achievements

## Gamification System

### XP Sources
- Create goal: +50 XP
- Log expense: +10 XP
- Log income: +20 XP
- Complete goal: Variable (targetAmount / 10)
- Daily login streak: +50 XP × streak count

### Leveling
- Exponential XP requirement: 1000 × 1.5^(level-1)
- Automatic level-up when XP threshold is reached

### Achievements
1. 🎯 Quest Beginner - Complete your first savings goal
2. ⭐ Rising Star - Reach level 5
3. 👑 Budget Master - Reach level 10
4. 🔥 Week Warrior - Maintain a 7-day login streak
5. 💪 Month Champion - Maintain a 30-day login streak
6. 💰 Penny Pincher - Save $100 total
7. 💎 Treasure Hunter - Save $1000 total
8. 🛡️ Budget Guardian - Stay under budget for a full month
9. 🏅 Quest Master - Complete 5 savings goals

## Team

- Anna Merkulova
- Jackie Lin
- Katherine Apupalo

## License

This project is created for educational purposes.

---

**Level up your finances! 🎮💰**
