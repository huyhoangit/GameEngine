import { Request, Response } from 'express';

// In-memory storage (replace with database)
interface Score {
  gameId: string;
  playerName: string;
  score: number;
  date: string;
}

const scores: Score[] = [];

export const getLeaderboard = (req: Request, res: Response) => {
  const { gameId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;

  const gameScores = scores
    .filter((s) => s.gameId === gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  res.json(gameScores);
};

export const submitScore = (req: Request, res: Response) => {
  const { gameId, playerName, score } = req.body;

  if (!gameId || !playerName || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newScore: Score = {
    gameId,
    playerName,
    score,
    date: new Date().toISOString(),
  };

  scores.push(newScore);

  res.json({ success: true, score: newScore });
};

export const getTopScores = (req: Request, res: Response) => {
  const { gameId } = req.params;
  const limit = parseInt(req.query.limit as string) || 5;

  const topScores = scores
    .filter((s) => s.gameId === gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s, index) => ({
      rank: index + 1,
      ...s,
    }));

  res.json(topScores);
};
