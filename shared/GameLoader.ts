/**
 * Game Loader
 * Automatically discovers and loads games that implement IGame interface
 */

import { IGame } from '../shared/IGame';

export class GameLoader {
  private games: Map<string, IGame> = new Map();

  /**
   * Register a game
   */
  registerGame(gameId: string, game: IGame): void {
    this.games.set(gameId, game);
    console.log(`✓ Game registered: ${game.getMetadata().name}`);
  }

  /**
   * Get a game by ID
   */
  getGame(gameId: string): IGame | undefined {
    return this.games.get(gameId);
  }

  /**
   * Get all available games
   */
  getAllGames(): IGame[] {
    return Array.from(this.games.values());
  }

  /**
   * Get game metadata
   */
  getGameMetadata(gameId: string) {
    const game = this.games.get(gameId);
    return game ? game.getMetadata() : null;
  }

  /**
   * List all available games
   */
  listAvailableGames() {
    return this.getAllGames().map(game => game.getMetadata());
  }
}

// Singleton instance
export const gameLoader = new GameLoader();
