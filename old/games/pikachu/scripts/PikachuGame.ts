import { IGame, GameMetadata } from '../../../shared/IGame';
import { Board } from './Board';
import { MatchChecker, Point } from './MatchChecker';
import { HintSystem } from './HintSystem';
import {
  LevelsFileConfig,
  ResolvedLevelConfig,
  resolveLevelConfigWithScaling,
} from './LevelConfig';
import { applyAllGravities } from './Gravity';

export type GameState = 'idle' | 'playing' | 'gameover' | 'levelcomplete';

export class PikachuGame implements IGame {
  private board!: Board;
  private matchChecker!: MatchChecker;
  private score: number = 0;
  private shuffleCount: number = 0;
  private config: any;
  private levelsFile!: LevelsFileConfig;
  private levelConfig!: ResolvedLevelConfig;
  private currentLevel: number = 1;
  private gameState: GameState = 'idle';

  async init(
    levelsFile?: LevelsFileConfig,
    startLevel = 1,
    initialScore = 0
  ): Promise<void> {
    this.config = await this.loadConfig('default');
    this.levelsFile = levelsFile ?? this.getDefaultLevelsFile();
    this.score = initialScore;
    this.startLevel(startLevel);
  }

  startLevel(level: number): void {
    this.currentLevel = level;
    this.levelConfig = resolveLevelConfigWithScaling(level, this.levelsFile);

    this.board = new Board(
      this.levelConfig.boardWidth,
      this.levelConfig.boardHeight,
      this.levelConfig.tileTypes
    );

    this.matchChecker = new MatchChecker(
      this.board.getTiles(),
      this.levelConfig.boardWidth,
      this.levelConfig.boardHeight
    );

    this.shuffleCount = this.levelConfig.shuffleLimit;
    this.gameState = 'playing';
    this.ensurePlayable();
  }

  nextLevel(): void {
    this.startLevel(this.currentLevel + 1);
  }

  getLevelConfig(): ResolvedLevelConfig {
    return this.levelConfig;
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  isPlaying(): boolean {
    return this.gameState === 'playing';
  }

  setGameOver(): void {
    this.gameState = 'gameover';
  }

  setLevelComplete(): void {
    this.gameState = 'levelcomplete';
  }

  applyGravityAfterMatch(): void {
    if (this.levelConfig.gravities.length === 0) return;
    applyAllGravities(this.board, this.levelConfig.gravities);
    this.matchChecker.updateTiles(this.board.getTiles());
    this.ensurePlayable();
  }

  getPeriodicShuffleInterval(): number | null {
    return this.levelConfig.periodicShuffleSeconds;
  }

  periodicShuffle(): boolean {
    if (!this.isPlaying()) return false;
    return this.shuffle(false);
  }

  async save(): Promise<any> {
    return {
      boardTiles: this.board.clone(),
      score: this.score,
      shuffleCount: this.shuffleCount,
      gameState: this.gameState,
      currentLevel: this.currentLevel,
    };
  }

  async load(data: any): Promise<void> {
    this.score = data.score;
    this.shuffleCount = data.shuffleCount;
    this.gameState = data.gameState;
    this.currentLevel = data.currentLevel ?? 1;
  }

  async restart(): Promise<void> {
    this.score = 0;
    this.startLevel(1);
  }

  getMetadata(): GameMetadata {
    return {
      id: this.config.game.id,
      name: this.config.game.name,
      version: this.config.game.version,
      description: this.config.game.description,
    };
  }

  attemptMatch(x1: number, y1: number, x2: number, y2: number): boolean {
    if (!this.isPlaying()) return false;

    if (this.matchChecker.canConnect(x1, y1, x2, y2)) {
      this.board.removeTile(x1, y1);
      this.board.removeTile(x2, y2);
      this.matchChecker.updateTiles(this.board.getTiles());
      this.validateBoardParity();
      this.score += 10;
      return true;
    }

    return false;
  }

  getConnectionPath(x1: number, y1: number, x2: number, y2: number): Point[] | null {
    return this.matchChecker.findPath(x1, y1, x2, y2);
  }

  shuffle(consumeCount = true): boolean {
    if (!this.isPlaying()) return false;
    if (consumeCount && this.shuffleCount <= 0) return false;
    if (!this.board.shuffleTiles()) return false;

    const maxAttempts = 50;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      this.matchChecker.updateTiles(this.board.getTiles());
      const hints = new HintSystem(this.board).findAllHints();
      if (hints.length > 0) {
        if (consumeCount) this.shuffleCount--;
        return true;
      }
      if (attempt < maxAttempts - 1) {
        this.board.shuffleTiles();
      }
    }

    if (consumeCount) this.shuffleCount--;
    return true;
  }

  autoShuffleIfStuck(): boolean {
    if (!this.isPlaying()) return false;
    const hints = new HintSystem(this.board).findAllHints();
    if (hints.length > 0 || this.board.isEmpty()) return false;
    return this.shuffle(false);
  }

  hasAvailableMatches(): boolean {
    return new HintSystem(this.board).findAllHints().length > 0;
  }

  private ensurePlayable(): void {
    if (!this.board.hasEvenTileParity()) {
      this.board.repairTileParity();
      this.matchChecker.updateTiles(this.board.getTiles());
    }

    let safety = 0;
    while (!this.hasAvailableMatches() && !this.board.isEmpty() && safety < 15) {
      this.board.shuffleTiles();
      this.matchChecker.updateTiles(this.board.getTiles());
      safety++;
    }
  }

  /** Fix orphan tiles; returns true if board data changed */
  validateBoardParity(): boolean {
    if (this.board.hasEvenTileParity()) return false;
    this.board.repairTileParity();
    this.matchChecker.updateTiles(this.board.getTiles());
    return true;
  }

  getScore(): number {
    return this.score;
  }

  getShuffleCount(): number {
    return this.shuffleCount;
  }

  getBoard(): Board {
    return this.board;
  }

  private getDefaultLevelsFile(): LevelsFileConfig {
    return {
      defaults: {
        boardWidth: 14,
        boardHeight: 10,
        tileTypes: 24,
        timeLimit: 120,
        shuffleLimit: 5,
      },
      levelOverrides: [
        { level: 1, boardWidth: 8, boardHeight: 6, tileTypes: 6, timeLimit: 200, shuffleLimit: 8 },
        { level: 2, boardWidth: 10, boardHeight: 7, tileTypes: 8, timeLimit: 180, shuffleLimit: 7 },
        { level: 3, boardWidth: 12, boardHeight: 8, tileTypes: 12, timeLimit: 150, shuffleLimit: 6 },
      ],
      mechanics: {
        gravityBottom: { levels: [4, 5] },
        gravityLeft: { levels: [6, 7] },
        gravityRight: { levels: [8, 9] },
        gravityTop: { levels: [10, 11] },
        periodicShuffle: { levels: [12, 13, 14, 15], intervalSeconds: 10 },
      },
    };
  }

  private async loadConfig(configName: string): Promise<any> {
    return {
      game: {
        id: 'pikachu',
        name: 'Pikachu',
        version: '1.0.0',
        description: 'Classic Pikachu matching game',
      },
      board: {
        width: 14,
        height: 10,
        tileTypes: 24,
        initialShuffleCount: 5,
      },
      gameplay: {
        maxConnectDistance: 3,
        maxTurns: 2,
        timeLimit: 120,
        shuffleLimit: 5,
      },
      ui: {
        tileSize: 48,
        animationDuration: 300,
      },
    };
  }
}
