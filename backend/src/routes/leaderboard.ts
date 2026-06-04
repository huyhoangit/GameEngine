import express from 'express';
import * as leaderboardController from '../controllers/leaderboardController';

const router = express.Router();

// Get leaderboard for a game
router.get('/:gameId', leaderboardController.getLeaderboard);

// Submit score
router.post('/submit', leaderboardController.submitScore);

// Get top scores
router.get('/:gameId/top', leaderboardController.getTopScores);

export default router;
