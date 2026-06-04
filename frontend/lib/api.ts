import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameAPI = {
  // Get all available games
  getGames: async () => {
    const response = await api.get('/games');
    return response.data;
  },

  // Get specific game
  getGame: async (gameId: string) => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  // Save game state
  saveGame: async (gameId: string, gameData: any) => {
    const response = await api.post(`/games/${gameId}/save`, gameData);
    return response.data;
  },

  // Load game state
  loadGame: async (gameId: string) => {
    const response = await api.get(`/games/${gameId}/load`);
    return response.data;
  },
};

export const leaderboardAPI = {
  // Get leaderboard for a game
  getLeaderboard: async (gameId: string, limit: number = 10) => {
    const response = await api.get(`/leaderboard/${gameId}?limit=${limit}`);
    return response.data;
  },

  // Submit score
  submitScore: async (gameId: string, playerName: string, score: number) => {
    const response = await api.post('/leaderboard/submit', {
      gameId,
      playerName,
      score,
    });
    return response.data;
  },
};

export const achievementAPI = {
  // Get achievements for user
  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },

  // Unlock achievement
  unlockAchievement: async (achievementId: string) => {
    const response = await api.post('/achievements/unlock', { achievementId });
    return response.data;
  },
};

export default api;
