# Game Portal Framework

A modular game platform built with React, Node.js, and Phaser 3, allowing independent game development and seamless integration.

## Architecture

```
GamePortal
│
├── Frontend (React + TypeScript)
│   ├── Home Page
│   ├── Game List
│   ├── Achievement System
│   └── User Profile
│
├── Backend (Node.js)
│   ├── Save Data API
│   ├── Leaderboard API
│   └── Statistics API
│
└── Games (Independent Modules)
    ├── Pikachu (Classic matching game)
    ├── Gold Miner (Digging mechanic)
    ├── Bomberman (Strategy + Action)
    ├── Lines 98 (Match-3 variant)
    └── More games...
```

## Games

### Pikachu (In Development)
Classic matching game with:
- **Board Management**: 14x10 grid with configurable tiles
- **Match Algorithm**: BFS-based path finding (max 3 segments, 2 turns)
- **Core Systems**: 
  - Board Manager
  - Tile System
  - Match Checker
  - Hint System
  - Shuffle System
  - UI Components
- **Mod System**: Config-driven (no hard-coding)

Example configs:
- `config/default.json` - Standard difficulty
- `config/hard.json` - Hard mode with larger board

## Technology Stack

- **Frontend**: React 18, TypeScript, Phaser 3
- **Backend**: Node.js, Express
- **Game Engine**: Phaser 3 (2D HTML5)
- **Database**: SQLite (local) / MongoDB (cloud)
- **Package Manager**: npm workspaces

## Game Interface

All games must implement the `IGame` interface:

```typescript
interface IGame {
  init(): Promise<void>;
  save(): Promise<any>;
  load(data: any): Promise<void>;
  restart(): Promise<void>;
  getMetadata(): GameMetadata;
}
```

## Project Structure

```
games/
└── pikachu/
    ├── assets/          # Game assets (sprites, sounds, etc.)
    ├── scripts/         # Game logic
    │   ├── Board.ts
    │   ├── MatchChecker.ts
    │   ├── PikachuGame.ts
    │   └── ...
    ├── config/          # Game configurations
    │   ├── default.json
    │   └── hard.json
    └── mods/            # User modifications
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Development Roadmap

### Week 1
- [ ] Portal React setup
- [ ] Game loading system
- [ ] Core Portal UI

### Week 2
- [ ] Pikachu game completion
- [ ] Board UI rendering
- [ ] Match detection

### Week 3
- [ ] Gold Miner game
- [ ] Physics system
- [ ] Item system

### Week 4
- [ ] Save/Load system
- [ ] Achievement system
- [ ] Local leaderboard

## Mod System

Each game supports configuration-driven modifications:

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

Modify these values without touching game code!

## Adding New Games

1. Create a new folder under `games/`
2. Implement the `IGame` interface
3. Add config files in `config/`
4. Register in Portal

Portal will automatically discover and load new games.

## License

MIT
