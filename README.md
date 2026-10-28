# 🎮 Noor Developer Arcade — Neon Edition

> **Level up your brain. Beat your records. Enter the neon arena.**

Noor Developer Arcade is an interactive, neon-themed gaming platform featuring 15 mini-games designed to challenge your memory, logic, reaction speed, problem-solving, and strategic thinking.

Built with React and modern web technologies, the platform combines arcade-style gameplay with player progression, personal records, leaderboards, achievements, daily challenges, and an AI-powered gaming coach.

## ✨ Features

- 🎮 **15 Interactive Mini-Games** — Explore puzzles, action games, memory challenges, logic games, and reflex tests.
- 🏆 **Leaderboards** — Compete for high scores and track your ranking.
- 📊 **Player Analytics** — Monitor gaming performance, statistics, and progress.
- 💾 **Score & Record Tracking** — Save game sessions, personal bests, and player progress.
- 🎖️ **Achievements & XP** — Earn experience points, unlock achievements, and level up.
- 🔥 **Daily Challenges** — Take on daily challenges and earn additional rewards.
- 🤖 **AI Gaming Coach** — Get AI-powered guidance and game-related insights.
- 👤 **Player Profile** — Customize your player identity and preferences.
- 🔊 **Arcade Sound Effects** — Enjoy immersive audio feedback.
- 📱 **Responsive Design** — Play across desktop and mobile devices.
- 🌌 **Neon Cyberpunk UI** — Experience glowing visuals, interactive cards, and a futuristic arcade atmosphere.

## 🕹️ Games Collection

| # | Game | Category |
|---|---|---|
| 01 | Neon Maze | Puzzle |
| 02 | Cyber Hacker | Logic |
| 03 | Memory Matrix | Memory |
| 04 | Gravity Flip | Action |
| 05 | Quantum Shift | Puzzle |
| 06 | Boss Rush | Action |
| 07 | Neon Snake | Action |
| 08 | Space Shooter | Action |
| 09 | Hyper Pong | Arcade |
| 10 | 2048 Neon | Strategy |
| 11 | Reaction Test | Reflex |
| 12 | Number Recall | Memory |
| 13 | Memory Match | Memory |
| 14 | Code Quiz | Programming |
| 15 | Brain Teasers | Logic |

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript (ES Modules)
- Vite
- Tailwind CSS
- Lucide React
- Motion for animations

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Firebase Admin SDK
- Zod for request validation

### AI & Integrations
- Google Gemini API
- Firebase Authentication

### Security & Reliability
- Helmet for HTTP security headers
- Express Rate Limit for API protection
- Request validation and authentication middleware
- Server-side score validation and duplicate-session protection

## 🏗️ Project Architecture

```text
noor-developer-arcade/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── seed/
│   └── tests/
├── src_javascript/
│   ├── components/
│   ├── games/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── data/
├── .env.example
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Firebase project for authentication
- Gemini API key for AI Coach functionality

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

Configure the required values for:

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=developer_arcade

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

GEMINI_API_KEY=your_gemini_api_key
```

Use your actual Firebase configuration and MongoDB connection string. Configure any additional variables required by the application.

**Important:** Never commit `.env` files, Firebase service-account JSON files, private keys, or API secrets to GitHub.

### 4. Start the Application

Start the development server:

```bash
npm run dev
```

The project's `dev` script starts `server.js`. Check the server output for the local URL and API status.

### 5. Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🔐 Authentication & Data Management

The backend is designed to support authenticated player profiles and game progress.

- Firebase Admin SDK verifies authentication tokens on protected routes.
- MongoDB stores player profiles, game sessions, personal bests, and achievement records.
- Server-side validation helps prevent invalid or manipulated score submissions.
- Idempotency protection helps prevent duplicate rewards when sessions are resubmitted.
- API rate limiting helps protect sensitive endpoints.

Guest gameplay may be available with local records, depending on the feature and synchronization flow.

## 🧪 Testing

Run the backend test suite with:

```bash
npm test
```

## 🎯 Project Goals

- Build an engaging browser-based arcade experience.
- Combine game development with full-stack engineering.
- Practice REST API design, authentication, database modeling, and validation.
- Explore AI-powered gaming assistance.
- Track player performance through persistent records and analytics.
- Develop a scalable foundation for future arcade features.

## 🔮 Future Enhancements

- Multiplayer challenges and real-time competitions.
- Seasonal tournaments and global rankings.
- Advanced player analytics and performance insights.
- More games, difficulty modes, and rewards.
- Improved accessibility and mobile gameplay.
- Additional AI-powered personalized training recommendations.

## 👨‍💻 Developer

**Noor Setia**

BCA Student | Full Stack Developer | MERN Stack

- GitHub: [@noorsetia](https://github.com/noorsetia)
- Portfolio: [Visit My Portfolio](https://noor-setia-portfolio.vercel.app/)

## 📄 License

Choose and add an appropriate open-source license before distributing this project. Until then, all rights remain with the copyright holder.

---

⭐ **Enjoy the arcade? Give the repository a star and challenge yourself to beat your personal best!**
