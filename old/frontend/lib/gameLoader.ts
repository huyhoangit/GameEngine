/**
 * Game Loader for Frontend
 * Manages game discovery and loading
 */

import { gameAPI } from './api';
import type { GameMetadata } from '@/../shared/IGame';

export class FrontendGameLoader {
  private games: Map<string, GameMetadata> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const gamesData = await gameAPI.getGames();
      this.games.clear();
      
      gamesData.forEach((game: GameMetadata) => {
        this.games.set(game.id, game);
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize game loader:', error);
      throw error;
    }
  }

  getGame(gameId: string): GameMetadata | undefined {
    return this.games.get(gameId);
  }

  getAllGames(): GameMetadata[] {
    return Array.from(this.games.values());
  }

  async loadGameData(gameId: string): Promise<any> {
    try {
      const game = this.getGame(gameId);
      if (!game) {
        throw new Error(`Game ${gameId} not found`);
      }
      return game;
    } catch (error) {
      console.error(`Failed to load game ${gameId}:`, error);
      throw error;
    }
  }
}

export const frontendGameLoader = new FrontendGameLoader();
