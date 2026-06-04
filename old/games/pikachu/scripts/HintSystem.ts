/**
 * Hint System for Pikachu
 * Finds possible matches on the board
 */

import { Board } from './Board';
import { MatchChecker } from './MatchChecker';

export interface Hint {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export class HintSystem {
  private board: Board;
  private matchChecker: MatchChecker;

  constructor(board: Board) {
    this.board = board;
    this.matchChecker = new MatchChecker(
      board.getTiles(),
      board.getWidth(),
      board.getHeight()
    );
  }

  syncBoard(board: Board): void {
    this.board = board;
    this.matchChecker.updateTiles(board.getTiles());
  }

  /**
   * Find a random valid match
   */
  findHint(): Hint | null {
    const hints = this.findAllHints();
    if (hints.length === 0) return null;
    return hints[Math.floor(Math.random() * hints.length)];
  }

  /**
   * Find all valid matches
   */
  findAllHints(): Hint[] {
    const hints: Hint[] = [];
    const tiles = this.board.getTiles();

    for (let y1 = 0; y1 < this.board.getHeight(); y1++) {
      for (let x1 = 0; x1 < this.board.getWidth(); x1++) {
        if (tiles[y1][x1] === -1) continue;

        for (let y2 = 0; y2 < this.board.getHeight(); y2++) {
          for (let x2 = 0; x2 < this.board.getWidth(); x2++) {
            if (x1 === x2 && y1 === y2) continue;
            if (tiles[y2][x2] === -1) continue;

            if (this.matchChecker.canConnect(x1, y1, x2, y2)) {
              hints.push({ x1, y1, x2, y2 });
            }
          }
        }
      }
    }

    return hints;
  }

  /**
   * Check if game is stuck (no moves available)
   */
  isGameStuck(): boolean {
    return this.findAllHints().length === 0;
  }
}
