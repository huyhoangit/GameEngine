import { Request, Response } from 'express';

// In-memory storage for games (replace with database)
const games = [
  {
    id: 'pikachu',
    name: 'Pikachu',
    version: '1.0.0',
    description: 'Classic Pikachu matching game',
    thumbnail: '/pikachu.png',
  },
];

const gameSaveData: Map<string, any> = new Map();

export const getAllGames = (req: Request, res: Response) => {
  res.json(games);
};

export const getGame = (req: Request, res: Response) => {
  const { gameId } = req.params;
  const game = games.find((g) => g.id === gameId);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json(game);
};

export const saveGameState = (req: Request, res: Response) => {
  const { gameId } = req.params;
  const gameState = req.body;

  if (!games.find((g) => g.id === gameId)) {
    return res.status(404).json({ error: 'Game not found' });
  }

  gameSaveData.set(gameId, {
    savedAt: new Date().toISOString(),
    state: gameState,
  });

  res.json({ success: true, message: 'Game saved successfully' });
};

export const loadGameState = (req: Request, res: Response) => {
  const { gameId } = req.params;

  if (!games.find((g) => g.id === gameId)) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const saveData = gameSaveData.get(gameId);

  if (!saveData) {
    return res.status(404).json({ error: 'No save data found' });
  }

  res.json(saveData.state);
};

export const getGameConfig = (req: Request, res: Response) => {
  const { gameId, configName } = req.params;

  if (!games.find((g) => g.id === gameId)) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Return default config based on game
  if (gameId === 'pikachu') {
    if (configName === 'hard') {
      return res.json({
        board: { width: 15, height: 15, tileTypes: 100 },
        gameplay: { timeLimit: 90, shuffleLimit: 3 },
      });
    }
    return res.json({
      board: { width: 10, height: 10, tileTypes: 24 },
      gameplay: { timeLimit: 150, shuffleLimit: 5 },                                                                                 
    });
  }

  res.status(404).json({ error: 'Config not found' });
};
