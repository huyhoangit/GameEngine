# Game Portal Framework

A modular game platform built with **React/Next.js**, **Node.js**, and **Phaser 3**, allowing independent game development and seamless integration.

🎮 **Build once, extend forever** — Add new games without modifying existing ones.

## ✨ Features

- ✅ **Modular Architecture** - Each game is completely independent
- ✅ **Standard Game Interface** - All games implement `IGame` interface
- ✅ **Config-Driven** - Modify difficulty via JSON, no code changes needed
- ✅ **Auto-Discovery** - Portal automatically finds and loads new games
- ✅ **Phaser 3** - Powerful 2D game engine for HTML5 games
- ✅ **React/Next.js** - Modern frontend with SSR support
- ✅ **Node.js Backend** - API for save/load, leaderboard, achievements
- ✅ **TypeScript** - Full type safety across entire project

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone/setup project
cd GameFramework

# Install all dependencies (frontend, backend, games)
npm install

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Start development server
npm run dev
```

Open **http://localhost:3000** and start playing!

### Manual Setup
See [SETUP.md](SETUP.md) for detailed setup instructions.

## 🎮 Current Games

### Pikachu (✅ In Development)
Classic matching game with:
- **Board**: 14×10 grid (configurable)
- **Gameplay**: Match two identical tiles connected by max 3 line segments
- **Features**: Hint system, shuffle, timer, score tracking
- **Algorithm**: BFS pathfinding with turn counting

**Play**: http://localhost:3000/games/pikachu

#### Game Controls
- 🖱️ **Click tiles**: Select and match tiles
- 💡 **Hint**: Show a possible match
- 🔀 **Shuffle**: Randomize board
- 🔄 **Restart**: New game

#### Difficulty Modes
```json
// Default: 14×10 board, 24 tile types, 120s time limit
// Hard: 30×20 board, 100 tile types, 60s time limit
```

## 🏗️ Project Architecture

```
GameFramework/
│
├── 📄 Frontend (React/Next.js + TypeScript)
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Home page
│   │   ├── games/             # Game listing & gameplay
│   │   ├── achievements/      # Achievements page
│   │   ├── leaderboard/       # Leaderboard page
│   │   └── profile/           # User profile
│   │
│   ├── components/
│   │   ├── PikachuGame.tsx    # Pikachu game wrapper
│   │   └── PikachuScene.ts    # Phaser game scene
│   │
│   └── lib/
│       ├── api.ts             # API client (games, leaderboard, achievements)
│       └── gameLoader.ts      # Game discovery system
│
├── 🔧 Backend (Node.js + Express)
│   ├── src/
│   │   ├── index.ts          # Express server
│   │   ├── routes/           # API routes
│   │   │   ├── games.ts      # /api/games
│   │   │   ├── leaderboard.ts # /api/leaderboard
│   │   │   └── achievements.ts # /api/achievements
│   │   └── controllers/      # Business logic
│   │
│   └── .env                  # Environment variables
│
├── 🎮 Games (Modular)
│   └── pikachu/
│       ├── scripts/
│       │   ├── Board.ts              # Board management
│       │   ├── MatchChecker.ts       # BFS matching algorithm
│       │   ├── HintSystem.ts         # Hint & stuck detection
│       │   ├── ShuffleSystem.ts      # Shuffle logic
│       │   └── PikachuGame.ts        # Main game (implements IGame)
│       │
│       ├── config/
│       │   ├── default.json          # Default difficulty
│       │   └── hard.json             # Hard difficulty
│       │
│       └── assets/                   # Game sprites, sounds
│
├── 📦 Shared
│   ├── IGame.ts              # Standard game interface
│   ├── GameLoader.ts         # Game discovery system
│   └── GameUtils.ts          # Shared utilities
│
├── ARCHITECTURE.md           # Detailed design documentation
├── SETUP.md                  # Setup & troubleshooting guide
└── README.md                 # This file
```

## 🔌 Standard Game Interface

Every game implements `IGame`:

```typescript
interface IGame {
  init(): Promise<void>;           // Initialize game
  save(): Promise<any>;            // Save game state
  load(data: any): Promise<void>;  // Load game state
  restart(): Promise<void>;        // Restart game
  getMetadata(): GameMetadata;     // Game info
}
```

## 📝 Game Configuration System

All game parameters are **config-driven** — no hardcoding!

**Example: Pikachu Default**
```json
{
  "game": {
    "id": "pikachu",
    "name": "Pikachu",
    "version": "1.0.0"
  },
  "board": {
    "width": 14,
    "height": 10,
    "tileTypes": 24
  },
  "gameplay": {
    "timeLimit": 120,
    "shuffleLimit": 5
  }
}
```

**Create Hard Mode? Just override in JSON:**
```json
{
  "board": {
    "width": 30,
    "height": 20,
    "tileTypes": 100
  },
  "gameplay": {
    "timeLimit": 60,
    "shuffleLimit": 3
  }
}
```

**No code changes needed!** 🎉

## 🎮 Pikachu Algorithm Details

### Matching Logic
Two tiles can connect if:
1. Same tile type
2. Can reach each other with **max 3 line segments** (2 turns)
3. Path is clear

### BFS Pathfinding
State: `(x, y, direction, turnCount)`

**Example Valid Paths:**
```
A────B          (1 horizontal)

A                (2 segments, 1 turn)
│
└────B

A
│
├────┐
     │
     B          (3 segments, 2 turns)
```

## 🔄 API Endpoints

### Games
- `GET /api/games` - List all available games
- `GET /api/games/:gameId` - Get game info
- `GET /api/games/:gameId/config/:configName` - Get game config
- `POST /api/games/:gameId/save` - Save game state
- `GET /api/games/:gameId/load` - Load game state

### Leaderboard
- `GET /api/leaderboard/:gameId` - Get leaderboard
- `POST /api/leaderboard/submit` - Submit score
- `GET /api/leaderboard/:gameId/top` - Top scores

### Achievements
- `GET /api/achievements` - List all achievements
- `GET /api/achievements/user/:userId` - User achievements
- `POST /api/achievements/unlock` - Unlock achievement

## 📦 Adding a New Game

### 1. Create Structure
```bash
mkdir -p games/mygame/{scripts,config,assets,mods}
touch games/mygame/package.json
```

### 2. Implement IGame
```typescript
export class MyGame implements IGame {
  async init() { /* ... */ }
  async save() { /* ... */ }
  async load(data) { /* ... */ }
  async restart() { /* ... */ }
  getMetadata() { /* ... */ }
}
```

### 3. Add Config
```json
{
  "game": {"id": "mygame", "name": "My Game", "version": "1.0.0"},
  "/* other settings */": ""
}
```

### 4. Register in Backend
```typescript
const myGame = new MyGame();
gameLoader.registerGame('mygame', myGame);
```

**Portal will auto-discover it!** ✨

## 📅 Development Roadmap

### Week 1 ✅
- [x] Project structure
- [x] Next.js frontend
- [x] Express backend
- [x] Game loader system
- [x] Pikachu game logic

### Week 2 (Next)
- [ ] Phaser 3 rendering
- [ ] Board UI
- [ ] Tile interactions
- [ ] Score/timer UI
- [ ] Animations

### Week 3
- [ ] Hint system UI
- [ ] Shuffle animation
- [ ] Game over screen
- [ ] Sound effects
- [ ] Polish & bug fixes

### Week 4
- [ ] Database integration
- [ ] Save/Load persistence
- [ ] Leaderboard UI
- [ ] Achievement system
- [ ] User profiles

### Future Games
- [ ] Gold Miner (physics-based)
- [ ] Bomberman (turn-based)
- [ ] Lines 98 (match-3)
- [ ] And more!

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start frontend + backend (concurrent)
npm run dev

# Build for production
npm run build

# Run production
npm start

# Run tests
npm run test

# Clean all node_modules
npm run clean
```

## 🌐 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18+ |
| Frontend Framework | Next.js | 14+ |
| Language | TypeScript | 5+ |
| Game Engine | Phaser | 3.55+ |
| Styling | CSS | 3 |
| Backend | Node.js | 18+ |
| Framework | Express | 4+ |
| Database | SQLite/MongoDB | - |
| Package Manager | npm | 9+ |

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed architecture & design decisions
- **[SETUP.md](SETUP.md)** - Development setup & troubleshooting
- **[PIKACHU_DOCS.md](PIKACHU_DOCS.md)** - Pikachu game documentation (coming soon)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3001   # Windows
```

### CORS Errors
Check `backend/.env`: `CORS_ORIGIN=http://localhost:3000`

### Frontend Can't Connect Backend
Check `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

### Dependencies Not Installed
```bash
npm install
npm install -w games/pikachu
```

## 📄 License

MIT

## 👤 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-game`)
3. Commit changes (`git commit -am 'Add amazing game'`)
4. Push to branch (`git push origin feature/amazing-game`)
5. Create Pull Request

## 🎉 Status

**Current Version:** 1.0.0 (Pikachu Preview)

- ✅ Project structure complete
- ✅ Backend API ready
- ✅ Frontend portal ready
- ✅ Pikachu game logic complete
- ⏳ Pikachu UI rendering (in progress)

Next: Complete Pikachu Phaser rendering and interactions!
