/**
 * Standard Game Interface
 * All games must implement this interface for Portal compatibility
 */
export interface IGame {
  /**
   * Initialize the game
   */
  init(): Promise<void>;

  /**
   * Save game state
   */
  save(): Promise<any>;

  /**
   * Load game state
   */
  load(data: any): Promise<void>;

  /**
   * Restart the game
   */
  restart(): Promise<void>;

  /**
   * Get game metadata
   */
  getMetadata(): GameMetadata;
}

export interface GameMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  thumbnail?: string;
}
