/**
 * Shuffle System for Pikachu
 * Implements board shuffling for stuck situations
 */

import { Board } from './Board';

export class ShuffleSystem {
  private board: Board;
  private shuffleCount: number;
  private maxShuffles: number;

  constructor(board: Board, initialShuffles: number, maxShuffles: number) {
    this.board = board;
    this.shuffleCount = initialShuffles;
    this.maxShuffles = maxShuffles;
  }

  /**
   * Perform a shuffle
   */
  shuffle(): boolean {
    if (this.shuffleCount <= 0) {
      return false;
    }

    const tiles = this.board.getTiles();
    const width = this.board.getWidth();
    const height = this.board.getHeight();

    // Fisher-Yates shuffle
    const flatTiles: number[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        flatTiles.push(tiles[y][x]);
      }
    }

    for (let i = flatTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flatTiles[i], flatTiles[j]] = [flatTiles[j], flatTiles[i]];
    }

    // Put back into board
    let idx = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        tiles[y][x] = flatTiles[idx++];
      }
    }

    this.shuffleCount--;
    return true;
  }

  getShuffleCount(): number {
    return this.shuffleCount;
  }

  setShuffleCount(count: number): void {
    this.shuffleCount = Math.min(count, this.maxShuffles);
  }

  canShuffle(): boolean {
    return this.shuffleCount > 0;
  }
}
