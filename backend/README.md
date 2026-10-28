# Developer Arcade 4.0 — Backend Architecture & API Documentation

A production-conscious backend for **Developer Arcade** built with **Node.js**, **Express.js**, **MongoDB Atlas (Mongoose)**, and **Firebase Authentication (Firebase Admin SDK)**.

---

## 1. Architecture Overview

The backend is organized into clean, decoupled layers following enterprise separation-of-concerns:

```
backend/
├── config/
│   ├── env.js            # Environment variables parsing & defaults
│   ├── games.js          # Central game configuration & anti-cheat boundaries
│   ├── firebase.js       # Firebase Admin SDK init & token verification
│   └── database.js       # MongoDB Atlas Mongoose connection & resilience
├── models/
│   ├── User.js           # Player profile, XP, streak, aggregated game stats
│   ├── GameSession.js    # Individual game run telemetry with unique idempotencyKey
│   ├── PersonalBest.js   # Highest/fastest score per user and game with directionality
│   ├── Achievement.js    # Stable achievement definitions & reward criteria
│   ├── UserAchievement.js# Compound indexed user unlock records
│   └── DailyChallenge.js # Daily cognitive challenges with TTL automatic cleanup
├── middleware/
│   ├── auth.js           # Firebase ID token verification (requireAuth & optionalAuth)
│   ├── rateLimiter.js    # Global API & strict session submission rate limits
│   ├── errorHandler.js   # Safe JSON error responses preventing stack trace leakage
│   └── validator.js      # Zod request body & query schema validation
├── validators/
│   ├── sessionValidator.js
│   ├── userValidator.js
│   └── challengeValidator.js
├── services/
│   ├── userService.js        # User creation, level-up calculation, streak management
│   ├── sessionService.js     # Anti-cheat evaluation, idempotency check, trusted XP
│   ├── leaderboardService.js # High performance indexed queries for rank & tiers
│   ├── achievementService.js # Server-side rules engine for trophy unlocks
│   └── challengeService.js   # Daily challenge rotation & completion validation
├── controllers/
│   ├── userController.js
│   ├── gameController.js
│   ├── sessionController.js
│   ├── recordController.js
│   ├── achievementController.js
│   ├── challengeController.js
│   ├── leaderboardController.js
│   └── aiCoachController.js
├── routes/
│   ├── index.js          # Root API router mounting sub-resources
│   ├── userRoutes.js
│   ├── gameRoutes.js
│   ├── sessionRoutes.js
│   ├── recordRoutes.js
│   ├── achievementRoutes.js
│   ├── challengeRoutes.js
│   └── leaderboardRoutes.js
├── seed/
│   └── seedData.js       # Seeds default achievements and daily challenges
└── tests/
    ├── backend.test.js   # Comprehensive automated test suite
    └── runTests.js       # Executable test runner script
```

---

## 2. Security & Anti-Cheat Philosophy

1. **Never Trust Client Metrics**:
   - Clients submit raw telemetry (e.g. `score`, `durationSeconds`).
   - The server computes trusted XP via `calculateTrustedXP(score, difficulty, durationSeconds)`.
   - The server validates whether the score is physiologically and algorithmically plausible (e.g. human reaction time >= 80ms, duration >= minimum duration, score within game ceiling).
2. **Idempotency Protection**:
   - Every session submission must include a client-generated `idempotencyKey`.
   - If network retries or duplicate submissions hit the API, the server returns the previously processed session without re-awarding XP or duplicating achievements.
3. **Directional Scoring**:
   - Games with lower-is-better metrics (`reaction-test` in milliseconds, `memory` in moves) are checked with candidate < incumbent.
   - Games with higher-is-better metrics are checked with candidate > incumbent.
4. **Firebase Admin Token Verification**:
   - All protected routes verify client tokens using the Firebase Admin SDK (`admin.auth().verifyIdToken()`).
   - Guest play is supported without an account; guest sessions are clearly flagged as local records until synced.
5. **Defensive Hardening**:
   - `helmet` sets strict HTTP security headers.
   - `express.json({ limit: '100kb' })` prevents memory exhaustion payload attacks.
   - `express-rate-limit` caps standard requests at 300 / 15m and session submissions at 60 / minute.

---

## 3. Database Models & Indexing

- **`User`**:
  - `firebaseUid` (unique index)
  - `xp`, `level` (compound index `{ xp: -1, level: -1 }` for global rankings)
- **`GameSession`**:
  - `idempotencyKey` (unique index)
  - `{ userId: 1, createdAt: -1 }` (for paginated user history)
  - `{ gameId: 1, score: -1, createdAt: -1 }` (for game rankings)
- **`PersonalBest`**:
  - `{ userId: 1, gameId: 1, mode: 1, difficulty: 1 }` (compound unique index)
  - `{ gameId: 1, bestScore: -1 }` and `{ gameId: 1, bestScore: 1 }` (for directional leaderboards)
- **`UserAchievement`**:
  - `{ userId: 1, achievementId: 1 }` (compound unique index)
- **`DailyChallenge`**:
  - `date` (index)
  - `expiresAt` (TTL index for automatic MongoDB expiration)

---

## 4. API Endpoints

### User & Identity
- `GET /api/users/me` — Headers: `Authorization: Bearer <token>`
- `PATCH /api/users/me` — Body: `{ displayName?: string, avatar?: string, ringColor?: string, title?: string, preferences?: object }`

### Games & Rules
- `GET /api/games` — List of all 15 mini-games, scoring directions, valid score bounds, and supported modes.

### Game Sessions & Telemetry
- `POST /api/sessions` — Validates score, idempotencyKey, computes XP, unlocks achievements, updates PersonalBest.
- `GET /api/sessions?page=1&limit=20&gameId=snake` — Paginated history with filtering.

### Records & Personal Bests
- `GET /api/records` — All personal bests for user.
- `GET /api/records/:gameId` — Specific game's personal best.

### Achievements
- `GET /api/achievements` — Available achievements and user unlock status.

### Daily Challenges
- `GET /api/challenges/daily` — Current daily challenge gauntlet.
- `POST /api/challenges/:id/complete` — Validate challenge completion and award XP bounty.

### Leaderboards
- `GET /api/leaderboards/:gameId?page=1&limit=20` — Game rankings.
- `GET /api/leaderboards/global?page=1&limit=20` — Global rankings by verified XP.

---

## 5. Running Tests

```bash
npm test
```
