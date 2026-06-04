# Architecture Documentation

## Overview

This is a modular game portal where each game is completely independent and can be developed, deployed, and modified without affecting others.

## Core Principles

### 1. **Modularity**
Each game is a separate module under `games/` with its own:
- Configuration files (`config/`)
- Game logic (`scripts/`)
- Assets (`assets/`)
- Mod system (`mods/`)

### 2. **Standard Interface**
All games implement `IGame`:
```typescript
interface IGame {
  init(): Promise<void>;
  save(): Promise<any>;
  load(data: any): Promise<void>;
  restart(): Promise<void>;
  getMetadata(): GameMetadata;
}
```

This allows Portal to treat all games uniformly.

### 3. **Configuration-Driven**
No hardcoding! All game parameters are in config files:

**default.json**
```json
{
  "board": {"width": 14, "height": 10, "tileTypes": 24},
  "gameplay": {"timeLimit": 120, "shuffleLimit": 5}
}
```

**hard.json** (just override what you need)
```json
{
  "board": {"width": 30, "height": 20, "tileTypes": 100},
  "gameplay": {"timeLimit": 60, "shuffleLimit": 3}
}
```

### 4. **Portal Auto-Discovery**
Portal uses `GameLoader` to discover all games. Just create a new game folder and it's automatically available.

## Project Structure

```
GameFramework/
├── shared/              # Shared interfaces & utilities
│   ├── IGame.ts        # Standard game interface
│   ├── GameLoader.ts   # Auto-discovery system
│   └── GameUtils.ts    # Utility functions
│
├── frontend/           # React portal UI
│   ├── components/
│   ├── pages/
│   ├── services/       # GameLoader integration
│   └── package.json
│
├── backend/            # Node.js API
│   ├── routes/         # /api/games, /api/save, etc.
│   ├── controllers/
│   └── package.json
│
├── games/              # Individual game modules
│   ├── pikachu/
│   │   ├── scripts/
│   │   │   ├── Board.ts
│   │   │   ├── MatchChecker.ts (BFS algorithm)
│   │   │   ├── HintSystem.ts
│   │   │   ├── ShuffleSystem.ts
│   │   │   └── PikachuGame.ts (implements IGame)
│   │   ├── config/
│   │   │   ├── default.json
│   │   │   └── hard.json
│   │   ├── assets/     # Sprites, sounds
│   │   ├── mods/       # User modifications
│   │   └── package.json
│   │
│   ├── goldminer/      # (Future)
│   ├── bomberman/      # (Future)
│   └── ...
│
├── package.json        # Root (npm workspaces)
├── tsconfig.json
├── README.md
└── ARCHITECTURE.md
```

## Game Lifecycle

### 1. Portal Startup
```
Portal Loads
  ↓
GameLoader discovers all games
  ↓
Lists all available games (IGame.getMetadata())
  ↓
User selects a game
```

### 2. Game Initialization
```
User clicks "Play"
  ↓
Portal calls game.init()
  ↓
Game loads config
  ↓
Game initializes systems (Board, MatchChecker, etc.)
  ↓
Game renders UI
```

### 3. Game Session
```
Player interacts
  ↓
Game updates state
  ↓
Player can save: game.save() → Backend
  ↓
Game ends
  ↓
Portal calls game.restart() or unloads game
```

## Pikachu Game Architecture

### Core Components

**Board**
- Manages grid state
- Tile access/removal
- Board validation

**MatchChecker**
- BFS algorithm for pathfinding
- State: (x, y, direction, turnCount)
- Max 3 line segments (2 turns)

**HintSystem**
- Finds valid matches
- Detects stuck situations

**ShuffleSystem**
- Fisher-Yates shuffle
- Tracks shuffle count
- Validates shuffle availability

**PikachuGame**
- Implements `IGame`
- Orchestrates all systems
- Handles game state
- Exposes game-specific methods

### Pikachu Match Logic

Two tiles can connect if:
1. Same type
2. Can reach each other with max 3 line segments (2 turns)
3. Path is clear (no blocking tiles)

Example valid paths:
```
┌─────┐
│     │
A     B    ✓ 1 turn

A           ✓ 0 turns (adjacent horizontal)
B

A           ✓ 2 turns
│
└────B
```

Invalid:
```
A
│
│
│
B          ✗ Path too long (needs 3 turns)
```

## Adding a New Game

### Step 1: Create Structure
```bash
mkdir -p games/mygame/{scripts,config,assets,mods}
touch games/mygame/package.json
```

### Step 2: Implement IGame
```typescript
export class MyGame implements IGame {
  async init() { /* ... */ }
  async save() { /* ... */ }
  async load(data) { /* ... */ }
  async restart() { /* ... */ }
  getMetadata() { /* ... */ }
}
```

### Step 3: Add Config
```json
{
  "game": {
    "id": "mygame",
    "name": "My Game",
    "version": "1.0.0"
  },
  "/* other settings */": ""
}
```

### Step 4: Register in Portal
```typescript
const myGame = new MyGame();
await myGame.init();
gameLoader.registerGame('mygame', myGame);
```

**Portal will auto-discover it!**

## Mod System Example

### Before (Hard-coded)
```typescript
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 10;
const TILE_TYPES = 24;
```

### After (Config-driven)
```json
{
  "board": {
    "width": 14,
    "height": 10,
    "tileTypes": 24
  }
}
```

Users can create `config/extreme.json`:
```json
{
  "board": {
    "width": 50,
    "height": 40,
    "tileTypes": 500
  }
}
```

No code changes needed!

## Development Timeline

### Week 1: Foundation
- [x] Portal structure
- [ ] Frontend homepage
- [ ] Game listing UI
- [ ] GameLoader integration

### Week 2: Pikachu Core
- [ ] Board rendering (Phaser)
- [ ] Match detection
- [ ] UI (score, timer, shuffle)
- [ ] Basic animations

### Week 3: Pikachu Polish
- [ ] Hint system UI
- [ ] Shuffle animation
- [ ] Game over screen
- [ ] Sound effects

### Week 4: Backend + Systems
- [ ] Save/Load API
- [ ] Leaderboard API
- [ ] Achievement system
- [ ] Statistics tracking

### Future: More Games
- Gold Miner (physics-based)
- Bomberman (turn-based)
- Lines 98 (match-3 variant)
- etc.

## Best Practices

### Do ✓
- Put all magic numbers in config files
- Implement the IGame interface
- Keep games completely isolated
- Use TypeScript for type safety
- Write modular, reusable components

### Don't ✗
- Hard-code values
- Break the IGame contract
- Share state between games
- Use global variables
- Skip configuration files

## Performance Considerations

- **Board Size**: Currently tested up to 30x20
- **Tile Types**: Config allows up to 100+
- **Match Finding**: BFS is efficient for small boards
- **Rendering**: Phaser handles optimization

For larger boards (50x40+), consider:
- Spatial partitioning
- WebWorkers for pathfinding
- Lazy loading
