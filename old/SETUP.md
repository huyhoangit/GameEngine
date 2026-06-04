# Development Setup Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Git

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install Pikachu game dependencies
cd ../games/pikachu
npm install

# Back to root
cd ../../..
```

### 2. Environment Setup

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend (.env)**
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Running Development Server

### Option 1: Start Both Frontend + Backend

```bash
# From root directory
npm run dev
```

This will run:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Accessing the Application

1. Open http://localhost:3000 in your browser
2. Click "Play Games"
3. Select Pikachu and start playing!

## Pikachu Game Controls

- **Click a tile**: Select matching tiles
- **💡 Hint**: Show a possible match
- **🔀 Shuffle**: Randomize the board
- **🔄 Restart**: Start a new game

## Building for Production

```bash
# Build all packages
npm run build

# Start backend (production)
cd backend
npm start

# In another terminal, build and start frontend
cd frontend
npm run build
npm start
```

## Project Structure

```
frontend/
  ├── app/                 # Next.js app directory
  │   ├── page.tsx        # Home page
  │   ├── games/          # Games listing
  │   ├── [gameId]/       # Game play page
  │   └── globals.css     # Global styles
  ├── components/         # React components
  │   ├── PikachuGame.tsx # Game component
  │   └── PikachuScene.ts # Phaser scene
  └── lib/                # Utilities
      ├── api.ts          # API calls
      └── gameLoader.ts   # Game discovery

backend/
  ├── src/
  │   ├── index.ts        # Express server
  │   ├── routes/         # API routes
  │   ├── controllers/    # Route logic
  │   └── middlewares/    # Middleware
  └── package.json

games/pikachu/
  ├── scripts/
  │   ├── Board.ts        # Game board
  │   ├── MatchChecker.ts # Match finding (BFS)
  │   ├── HintSystem.ts   # Hint system
  │   ├── ShuffleSystem.ts # Shuffle logic
  │   └── PikachuGame.ts  # Main game class
  ├── config/
  │   ├── default.json    # Default settings
  │   └── hard.json       # Hard mode
  └── assets/             # Game assets
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3001 (macOS/Linux)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### CORS Errors

Make sure `.env` in backend has:
```env
CORS_ORIGIN=http://localhost:3000
```

### Frontend Can't Connect to Backend

Check that:
1. Backend is running on http://localhost:3001
2. Frontend `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

## Next Steps

- Add more game configurations
- Implement database storage
- Add user authentication
- Create more games (Gold Miner, Bomberman, etc.)
- Add animations and sound effects
