import express from 'express';
import * as gamesController from '../controllers/gamesController';

const router = express.Router();

// Get all games
router.get('/', gamesController.getAllGames);

// Get specific game
router.get('/:gameId', gamesController.getGame);

// Save game state
router.post('/:gameId/save', gamesController.saveGameState);

// Load game state
router.get('/:gameId/load', gamesController.loadGameState);

// Get game config
router.get('/:gameId/config/:configName', gamesController.getGameConfig);

export default router;
