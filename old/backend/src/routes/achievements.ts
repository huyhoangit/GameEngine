import express from 'express';
import * as achievementsController from '../controllers/achievementsController';

const router = express.Router();

// Get all achievements
router.get('/', achievementsController.getAchievements);

// Get user achievements
router.get('/user/:userId', achievementsController.getUserAchievements);

// Unlock achievement
router.post('/unlock', achievementsController.unlockAchievement);

export default router;
