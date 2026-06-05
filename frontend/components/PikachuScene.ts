/**
 * Pikachu Game Scene for Phaser 3
 */

import * as Phaser from 'phaser';
import { PikachuGame } from '@/../games/pikachu/scripts/PikachuGame';
import { HintSystem } from '@/../games/pikachu/scripts/HintSystem';
import { Point } from '@/../games/pikachu/scripts/MatchChecker';
import { LevelsFileConfig } from '@/../games/pikachu/scripts/LevelConfig';
import {
  getTileTextureKey,
  resolveTileUrl,
  TileManifest,
} from '@/lib/tileAssets';

interface TileSprite {
  x: number;
  y: number;
  graphics: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
  type: number;
}

export class PikachuScene extends Phaser.Scene {
  private pikachuGame!: PikachuGame;
  private hintSystem!: HintSystem;
  private config: any;
  private tiles: Map<string, TileSprite> = new Map();
  private selectedTile: { x: number; y: number } | null = null;
  private score: number = 0;
  private currentLevel: number = 1;
  private timeRemaining: number = 120;
  private maxTime: number = 120;
  private shuffleCount: number = 5;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private shuffleText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private tileSize: number = 48;
  /** Gap between tile cells (each side) */
  private readonly tileGap = 2;
  private boardStartX: number = 50;
  private boardStartY: number = 150;
  private timerInterval: NodeJS.Timeout | null = null;
  private timeBarBackground!: Phaser.GameObjects.Rectangle;
  private timeBar!: Phaser.GameObjects.Rectangle;
  private matchLine!: Phaser.GameObjects.Graphics;
  private tileManifest: TileManifest = { tiles: {} };
  private inputLocked = false;
  private gameEnded = false;
  private hintTiles: { x: number; y: number }[] = [];
  private hintClearTimer: Phaser.Time.TimerEvent | null = null;
  private periodicShuffleTimer: Phaser.Time.TimerEvent | null = null;
  private overlayPanel: Phaser.GameObjects.Container | null = null;
  private pausePanel: Phaser.GameObjects.Container | null = null;
  private isPaused = false;
  private escKey: Phaser.Input.Keyboard.Key | null = null;
  private readonly NO_MATCH_BORDER_MS = 1000;
  private readonly HINT_HIGHLIGHT_MS = 2500;
  private readonly MATCH_REMOVE_DELAY_MS = 120;

  constructor() {
    super({ key: 'PikachuScene' });
  }

  init(data?: { level?: number; score?: number }) {
    this.currentLevel = data?.level ?? 1;
    this.score = data?.score ?? 0;
    this.gameEnded = false;
    this.inputLocked = false;
  }

  preload() {
    this.load.json('tileManifest', '/tiles/manifest.json');
    this.load.json('levelsConfig', '/pikachu/levels.json');
  }

  async create() {
    this.pikachuGame = new PikachuGame();

    const levelsFile: LevelsFileConfig = this.cache.json.exists('levelsConfig')
      ? (this.cache.json.get('levelsConfig') as LevelsFileConfig)
      : {
          defaults: {
            boardWidth: 14,
            boardHeight: 10,
            tileTypes: 24,
            timeLimit: 120,
            shuffleLimit: 5,
          },
          mechanics: {
            gravityBottom: { levels: [4, 5] },
            gravityLeft: { levels: [6, 7] },
            gravityRight: { levels: [8, 9] },
            gravityTop: { levels: [10, 11] },
            periodicShuffle: { levels: [12, 13, 14, 15], intervalSeconds: 10 },
          },
        };

    await this.pikachuGame.init(levelsFile, this.currentLevel, this.score);
    this.score = this.pikachuGame.getScore();

    this.config = {
      board: { tileTypes: 24 },
      ui: { tileSize: 48, animationDuration: 300 },
    };

    this.tileSize = this.config.ui.tileSize;
    this.applyLevelSettings();

    this.hintSystem = new HintSystem(this.pikachuGame.getBoard());
    this.matchLine = this.add.graphics();
    this.matchLine.setDepth(10);

    this.tileManifest = this.cache.json.exists('tileManifest')
      ? (this.cache.json.get('tileManifest') as TileManifest)
      : { tiles: {} };

    this.drawUI();
    await this.loadTileTextures();
    this.rebuildBoard();
    this.syncHintSystem();
    this.checkAutoShuffleIfStuck();
    this.startTimer();
    this.startPeriodicShuffle();
    this.setupEscapeKey();
  }

  update() {
    // Phaser update loop
  }

  private setupEscapeKey() {
    if (!this.input.keyboard) return;
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => this.togglePause());
  }

  private applyLevelSettings() {
    const lc = this.pikachuGame.getLevelConfig();

    const horizontalPadding = 20;
    const topUIHeight = 150;
    const bottomUIHeight = 60;
    const availableWidth =
    this.scale.width - horizontalPadding * 2;

    const availableHeight =
      this.scale.height -
      topUIHeight -
      bottomUIHeight;

    const tileSizeByWidth =
      Math.floor(availableWidth / lc.boardWidth);

    const tileSizeByHeight =
      Math.floor(availableHeight / lc.boardHeight);

    this.tileSize = Math.min(
      tileSizeByWidth,
      tileSizeByHeight
    );

    this.tileSize = Math.min(
      tileSizeByWidth,
      tileSizeByHeight
    );
    
    this.tileSize = Phaser.Math.Clamp(
      this.tileSize,
      16, // tối thiểu
      48  // tối đa
    );

    this.currentLevel = lc.level;
    this.timeRemaining = lc.timeLimit;
    this.maxTime = lc.timeLimit;
    this.shuffleCount = this.pikachuGame.getShuffleCount();
    this.config.board.tileTypes = Math.max(
      this.config.board.tileTypes,
      lc.tileTypes
    );

    if (this.levelText?.active) {
      this.levelText.setText(`Màn ${this.currentLevel}`);
    }
    if (this.timerText?.active) {
      this.timerText.setText(`⏱️ ${this.formatTime(this.timeRemaining)}`);
    }
    if (this.shuffleText?.active) {
      this.shuffleText.setText(`Shuffles: ${this.shuffleCount}`);
    }
    if (this.scoreText?.active) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
    this.updateTimeBar();
    this.updateMechanicMessage();
  }

  private updateMechanicMessage() {
    const lc = this.pikachuGame.getLevelConfig();
    const parts: string[] = [];
    if (lc.gravities.length > 0) {
      parts.push(`Trọng lực: ${lc.gravities.join(', ')}`);
    }
    if (lc.periodicShuffleSeconds) {
      parts.push(`Xáo mỗi ${lc.periodicShuffleSeconds}s`);
    }
    const msg =
      parts.length > 0
        ? parts.join(' · ')
        : 'Chọn 2 ô giống nhau để ghép';
    this.setMessage(msg);
  }

  private isGameActive(): boolean {
    return this.pikachuGame.isPlaying() && !this.gameEnded && !this.isPaused;
  }

  private drawUI() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    this.add
      .text(width / 2, 30, 'Pikachu', {
        fontSize: '32px',
        color: '#fff',
        align: 'center',
      })
      .setOrigin(0.5);

    const pauseBtn = this.add
      .text(50, 22, '⏸', {
        fontSize: '22px',
        color: '#fff',
        backgroundColor: '#444466',
        padding: { x: 8, y: 4 },
      })
      .setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.togglePause());

    this.levelText = this.add.text(50, 58, `Màn ${this.currentLevel}`, {
      fontSize: '16px',
      color: '#88ccff',
      fontStyle: 'bold',
    });

    this.scoreText = this.add.text(50, 80, `Score: ${this.score}`, {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold',
    });

    this.timerText = this.add
      .text(width / 2, 80, `⏱️ ${this.formatTime(this.timeRemaining)}`, {
        fontSize: '18px',
        color: '#ffff00',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5);

    this.timeBarBackground = this.add.rectangle(width / 2, 105, 200, 15, 0x333333);
    this.timeBarBackground.setStrokeStyle(2, 0xffff00);
    this.timeBarBackground.setOrigin(0.5);

    this.timeBar = this.add.rectangle(width / 2 - 100, 105, 200, 11, 0x00ff00);
    this.timeBar.setOrigin(0, 0.5);
    this.updateTimeBar();

    this.shuffleText = this.add.text(width - 50, 80, `Shuffles: ${this.shuffleCount}`, {
      fontSize: '18px',
      color: '#ff00ff',
      fontStyle: 'bold',
      align: 'right',
    }).setOrigin(1, 0);

    this.messageText = this.add
      .text(width / 2, 120, 'Chọn 2 ô giống nhau để ghép', {
        fontSize: '14px',
        color: '#aaa',
        align: 'center',
      })
      .setOrigin(0.5);

    const buttonY = height - 40;
    const hintButton = this.add.rectangle(100, buttonY, 100, 40, 0x667eea);
    hintButton.setInteractive({ useHandCursor: true });
    hintButton.on('pointerdown', () => {
      if (this.isGameActive() && !this.inputLocked) this.showHint();
    });
    this.add.text(100, buttonY, '💡 Hint', {
      fontSize: '16px',
      color: '#fff',
      align: 'center',
    }).setOrigin(0.5);

    const shuffleButton = this.add.rectangle(220, buttonY, 100, 40, 0x764ba2);
    shuffleButton.setInteractive({ useHandCursor: true });
    shuffleButton.on('pointerdown', () => {
      if (this.isGameActive() && !this.inputLocked) this.shuffle();
    });
    this.add.text(220, buttonY, '🔀 Shuffle', {
      fontSize: '16px',
      color: '#fff',
      align: 'center',
    }).setOrigin(0.5);

    const restartButton = this.add.rectangle(340, buttonY, 100, 40, 0xf77f00);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => this.restartFromLevel1());
    this.add.text(340, buttonY, '🔄 Restart', {
      fontSize: '16px',
      color: '#fff',
      align: 'center',
    }).setOrigin(0.5);
  }

  private drawBoard() {
    const board = this.pikachuGame.getBoard();
    const boardTiles = board.getTiles();
    const lc = this.pikachuGame.getLevelConfig();

    const boardPixelW = lc.boardWidth * this.tileSize;
    const boardPixelH = lc.boardHeight * this.tileSize;
    this.boardStartX = Math.max(20, (this.scale.width - boardPixelW) / 2 + this.tileSize / 2);
    this.boardStartY = 150 + this.tileSize / 2;

    for (let y = 0; y < board.getHeight(); y++) {
      for (let x = 0; x < board.getWidth(); x++) {
        const tileType = boardTiles[y][x];
        if (tileType === -1) continue;

        const tx = this.boardStartX + x * this.tileSize;
        const ty = this.boardStartY + y * this.tileSize;

        const cell = this.getTileCellSize();
        const rect = this.add.rectangle(
          tx,
          ty,
          cell,
          cell,
          this.getTileColor(tileType)
        );

        rect.setStrokeStyle(2, 0xffffff);
        rect.setInteractive({ useHandCursor: true });
        rect.setDepth(1);

        const key = `${x},${y}`;

        rect.on('pointerdown', () => this.onTileClick(x, y));
        rect.on('pointerover', () => {
          if (!this.isGameActive() || this.inputLocked || this.isHintTile(x, y)) return;
          if (this.selectedTile?.x === x && this.selectedTile?.y === y) return;
          rect.setStrokeStyle(3, 0xffff00);
        });
        rect.on('pointerout', () => {
          if (!this.isGameActive() || this.inputLocked || this.isHintTile(x, y)) return;
          if (this.selectedTile?.x === x && this.selectedTile?.y === y) return;
          this.clearTileBorder(x, y);
        });

        const icon = this.createTileIcon(tileType, tx, ty);
        this.tiles.set(key, { x, y, graphics: rect, icon, type: tileType });
      }
    }
  }

  private async loadTileTextures(): Promise<void> {
    const tileTypes = this.pikachuGame.getLevelConfig().tileTypes;
    const basePath = this.tileManifest.basePath ?? '/tiles';
    const toLoad: { key: string; url: string }[] = [];

    for (let t = 0; t < tileTypes; t++) {
      const key = getTileTextureKey(t);
      if (this.textures.exists(key)) continue;
      toLoad.push({ key, url: resolveTileUrl(t, this.tileManifest, basePath) });
    }

    if (toLoad.length === 0) return;

    return new Promise((resolve) => {
      let pending = toLoad.length;
      const done = () => {
        pending--;
        if (pending <= 0) resolve();
      };

      this.load.on('loaderror', (file: Phaser.Loader.File) => {
        if (file.key.startsWith('tile_')) done();
      });

      for (const { key, url } of toLoad) {
        this.load.image(key, url);
        this.load.once(`filecomplete-image-${key}`, done);
      }
      this.load.start();
    });
  }

  /** Visible tile width/height (texture fills 100% of this) */
  private getTileCellSize(): number {
    return this.tileSize - this.tileGap * 2;
  }

  private createTileIcon(
    tileType: number,
    x: number,
    y: number
  ): Phaser.GameObjects.Image | Phaser.GameObjects.Text {
    const texKey = getTileTextureKey(tileType);
    const cell = this.getTileCellSize();

    if (this.textures.exists(texKey)) {
      const img = this.add.image(x, y, texKey);
      img.setDisplaySize(cell, cell);
      img.setDepth(2);
      return img;
    }

    const fontSize = Math.max(12, Math.floor(cell * 0.4));
    return this.add
      .text(x, y, `${tileType}`, {
        fontSize: `${fontSize}px`,
        color: '#fff',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(2);
  }

  private onTileClick(x: number, y: number) {
    if (!this.isGameActive() || this.inputLocked) return;

    if (this.selectedTile === null) {
      this.clearHintHighlight();
      this.selectedTile = { x, y };
      this.setTileBorder(x, y, 0xffff00, 4);
      return;
    }

    if (this.selectedTile.x === x && this.selectedTile.y === y) {
      this.clearTileBorder(x, y);
      this.selectedTile = null;
      return;
    }

    const x1 = this.selectedTile.x;
    const y1 = this.selectedTile.y;
    this.selectedTile = null;
    this.clearTileBorder(x1, y1);
    this.clearTileBorder(x, y);
    this.inputLocked = true;

    const path = this.pikachuGame.getConnectionPath(x1, y1, x, y);
    const matched = this.pikachuGame.attemptMatch(x1, y1, x, y);

    if (matched) {
      this.score = this.pikachuGame.getScore();
      this.setTileBorder(x1, y1, 0x00ff00, 4);
      this.setTileBorder(x, y, 0x00ff00, 4);
      if (path) this.drawMatchLinePath(path);
      this.scoreText.setText(`Score: ${this.score}`);

      const duration = this.config.ui.animationDuration;
      this.time.delayedCall(this.MATCH_REMOVE_DELAY_MS, () => {
        this.matchLine?.clear();
        this.animateMatchedTilesRemoval(
          [
            { x: x1, y: y1 },
            { x, y },
          ],
          duration,
          () => {
            this.pikachuGame.applyGravityAfterMatch();
            this.rebuildBoard();
            this.syncHintSystem();
            this.inputLocked = false;

            if (this.pikachuGame.getBoard().isEmpty()) {
              this.onLevelComplete();
            } else {
              this.checkAutoShuffleIfStuck();
            }
          }
        );
      });
    } else {
      this.setTileBorder(x1, y1, 0xff0000, 4);
      this.setTileBorder(x, y, 0xff0000, 4);

      this.time.delayedCall(this.NO_MATCH_BORDER_MS, () => {
        this.clearTileBorder(x1, y1);
        this.clearTileBorder(x, y);
        this.inputLocked = false;
      });
    }
  }

  private gridToPixel(gridX: number, gridY: number): { cx: number; cy: number } {
    return {
      cx: this.boardStartX + gridX * this.tileSize,
      cy: this.boardStartY + gridY * this.tileSize,
    };
  }

  private simplifyPath(path: Point[]): Point[] {
    if (path.length <= 2) return path;
    const out: Point[] = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const a = path[i - 1];
      const b = path[i];
      const c = path[i + 1];
      const d1x = b.x - a.x;
      const d1y = b.y - a.y;
      const d2x = c.x - b.x;
      const d2y = c.y - b.y;
      if (d1x !== d2x || d1y !== d2y) out.push(b);
    }
    out.push(path[path.length - 1]);
    return out;
  }

  private drawMatchLinePath(path: Point[]) {
    const corners = this.simplifyPath(path);
    this.matchLine.clear();
    this.matchLine.lineStyle(4, 0xff8800, 1);
    this.matchLine.beginPath();
    const start = this.gridToPixel(corners[0].x, corners[0].y);
    this.matchLine.moveTo(start.cx, start.cy);
    for (let i = 1; i < corners.length; i++) {
      const p = this.gridToPixel(corners[i].x, corners[i].y);
      this.matchLine.lineTo(p.cx, p.cy);
    }
    this.matchLine.strokePath();
  }

  private setTileBorder(gridX: number, gridY: number, color: number, width: number = 2) {
    const tile = this.tiles.get(`${gridX},${gridY}`);
    if (tile) tile.graphics.setStrokeStyle(width, color);
  }

  private clearTileBorder(gridX: number, gridY: number) {
    this.setTileBorder(gridX, gridY, 0xffffff, 2);
  }

  private isHintTile(gridX: number, gridY: number): boolean {
    return this.hintTiles.some((t) => t.x === gridX && t.y === gridY);
  }

  private syncHintSystem() {
    this.hintSystem.syncBoard(this.pikachuGame.getBoard());
  }

  private destroyAllTileSprites() {
    this.tiles.forEach((tile) => {
      this.tweens.killTweensOf([tile.graphics, tile.icon]);
      if (tile.graphics.active) tile.graphics.destroy();
      if (tile.icon.active) tile.icon.destroy();
    });
    this.tiles.clear();
  }

  private rebuildBoard() {
    this.matchLine?.clear();
    this.selectedTile = null;
    this.clearHintHighlight();
    this.destroyAllTileSprites();
    this.drawBoard();
    this.syncHintSystem();
  }

  /** Fade + phóng to rồi mới áp trọng lực / vẽ lại — tránh ô ma sau màn 4+ */
  private animateMatchedTilesRemoval(
    coords: { x: number; y: number }[],
    duration: number,
    onComplete: () => void
  ) {
    let pending = 0;
    const done = () => {
      pending--;
      if (pending <= 0) onComplete();
    };

    for (const { x, y } of coords) {
      const key = `${x},${y}`;
      const tile = this.tiles.get(key);
      if (!tile) continue;

      this.tiles.delete(key);
      pending++;

      this.tweens.killTweensOf([tile.graphics, tile.icon]);
      tile.graphics.setDepth(20);
      tile.icon.setDepth(21);

      const iconScaleX = tile.icon.scaleX;
      const iconScaleY = tile.icon.scaleY;
      let parts = 2;
      const partDone = () => {
        parts--;
        if (parts > 0) return;
        if (tile.graphics.active) tile.graphics.destroy();
        if (tile.icon.active) tile.icon.destroy();
        done();
      };

      this.tweens.add({
        targets: tile.graphics,
        alpha: 0,
        scaleX: 1.35,
        scaleY: 1.35,
        duration,
        ease: 'Cubic.easeOut',
        onComplete: partDone,
      });

      this.tweens.add({
        targets: tile.icon,
        alpha: 0,
        scaleX: iconScaleX * 1.35,
        scaleY: iconScaleY * 1.35,
        duration,
        ease: 'Cubic.easeOut',
        onComplete: partDone,
      });
    }

    if (pending === 0) onComplete();
  }

  private checkAutoShuffleIfStuck() {
    if (!this.isGameActive() || this.pikachuGame.getBoard().isEmpty()) return;

    if (this.pikachuGame.validateBoardParity()) {
      this.rebuildBoard();
    }

    let safety = 0;
    while (!this.pikachuGame.hasAvailableMatches() && safety < 10) {
      if (!this.pikachuGame.autoShuffleIfStuck()) break;
      this.rebuildBoard();
      this.setMessage('🔀 Tự động xáo trộn — không còn nước đi');
      safety++;
    }
  }

  private updateTimeBar() {
    if (!this.timeBar?.active || !this.timeBarBackground?.active) return;
    const ratio = Math.max(0, this.timeRemaining / this.maxTime);
    const maxWidth = 200;
    this.timeBar.width = maxWidth * ratio;
    this.timeBar.x = this.scale.width / 2 - maxWidth / 2;
    const fillColor = ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000;
    this.timeBar.setFillStyle(fillColor);
  }

  private showHint() {
    if (!this.isGameActive() || this.inputLocked) return;
    this.syncHintSystem();
    const hint = this.hintSystem.findHint();
    if (!hint) {
      this.checkAutoShuffleIfStuck();
      return;
    }
    this.highlightHintTiles(hint.x1, hint.y1, hint.x2, hint.y2);
  }

  private highlightHintTiles(x1: number, y1: number, x2: number, y2: number) {
    this.clearHintHighlight();
    this.hintTiles = [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
    for (const t of this.hintTiles) {
      this.setTileBorder(t.x, t.y, 0x00ffff, 4);
    }

    if (this.hintClearTimer) this.hintClearTimer.remove(false);
    this.hintClearTimer = this.time.delayedCall(this.HINT_HIGHLIGHT_MS, () => {
      this.clearHintHighlight();
      this.hintClearTimer = null;
    });
  }

  private clearHintHighlight() {
    if (this.hintClearTimer) {
      this.hintClearTimer.remove(false);
      this.hintClearTimer = null;
    }
    for (const t of this.hintTiles) {
      if (!this.tiles.has(`${t.x},${t.y}`)) continue;
      if (this.selectedTile?.x === t.x && this.selectedTile?.y === t.y) {
        this.setTileBorder(t.x, t.y, 0xffff00, 4);
      } else {
        this.clearTileBorder(t.x, t.y);
      }
    }
    this.hintTiles = [];
  }

  private shuffle() {
    if (!this.isGameActive() || this.inputLocked) return;
    if (this.shuffleCount <= 0) {
      this.setMessage('Hết lượt xáo trộn!');
      return;
    }

    if (this.pikachuGame.shuffle(true)) {
      this.shuffleCount = this.pikachuGame.getShuffleCount();
      this.shuffleText.setText(`Shuffles: ${this.shuffleCount}`);
      this.rebuildBoard();
      this.setMessage('🔀 Đã xáo trộn!');
      this.checkAutoShuffleIfStuck();
    }
  }

  private startPeriodicShuffle() {
    this.stopPeriodicShuffle();
    const intervalSec = this.pikachuGame.getPeriodicShuffleInterval();
    if (!intervalSec || !this.isGameActive()) return;

    this.periodicShuffleTimer = this.time.addEvent({
      delay: intervalSec * 1000,
      loop: true,
      callback: () => {
        if (!this.isGameActive() || this.inputLocked) return;
        if (this.pikachuGame.periodicShuffle()) {
          this.rebuildBoard();
          this.setMessage(`🔀 Xáo trộn định kỳ (${intervalSec}s)`);
          this.checkAutoShuffleIfStuck();
        }
      },
    });
  }

  private stopPeriodicShuffle() {
    if (this.periodicShuffleTimer) {
      this.periodicShuffleTimer.remove(false);
      this.periodicShuffleTimer = null;
    }
  }

  private startTimer() {
    this.stopTimer();
    this.updateTimeBar();
    this.timerInterval = setInterval(() => {
      if (!this.isGameActive()) return;

      this.timeRemaining--;
      this.setTimerText(`⏱️ ${this.formatTime(this.timeRemaining)}`);
      this.updateTimeBar();

      if (this.timeRemaining <= 0) {
        this.onGameOver();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private setTimerText(text: string) {
    try {
      if (this.timerText?.active) this.timerText.setText(text);
    } catch {
      /* scene shutting down */
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private hideOverlay() {
    if (this.overlayPanel) {
      this.overlayPanel.destroy(true);
      this.overlayPanel = null;
    }
  }

  private hidePausePanel() {
    if (this.pausePanel) {
      this.pausePanel.destroy(true);
      this.pausePanel = null;
    }
  }

  private togglePause() {
    if (this.gameEnded) return;
    if (this.isPaused) this.resumeGame();
    else this.pauseGame();
  }

  private pauseGame() {
    if (this.gameEnded || this.isPaused) return;
    this.isPaused = true;
    this.selectedTile = null;
    this.clearHintHighlight();
    this.stopTimer();
    if (this.periodicShuffleTimer) this.periodicShuffleTimer.paused = true;
    this.showPausePanel();
  }

  private resumeGame() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.hidePausePanel();
    if (!this.gameEnded) {
      this.startTimer();
      if (this.periodicShuffleTimer) this.periodicShuffleTimer.paused = false;
    }
  }

  private showPausePanel() {
    this.hidePausePanel();
    const w = this.scale.width;
    const h = this.scale.height;
    const container = this.add.container(0, 0).setDepth(90);

    const dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45);
    dim.setInteractive();

    const panel = this.add.rectangle(w / 2, h / 2, 280, 160, 0x16213e);
    panel.setStrokeStyle(2, 0x667eea);

    const title = this.add
      .text(w / 2, h / 2 - 28, '⏸ Tạm dừng', {
        fontSize: '22px',
        color: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(w / 2, h / 2 + 18, 'Nhấn ESC để chơi tiếp', {
        fontSize: '15px',
        color: '#aaa',
      })
      .setOrigin(0.5);

      const resumeBtn = this.add
    .text(w / 2, h / 2 + 45, '▶ Tiếp tục', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#28a745',
      padding: { x: 14, y: 8 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  resumeBtn.on('pointerdown', () => {
    this.togglePause(); // hoặc logic resume của bạn
  });

  resumeBtn.on('pointerover', () => {
    resumeBtn.setScale(1.05);
  });

  resumeBtn.on('pointerout', () => {
    resumeBtn.setScale(1);
  });

    container.add([dim, panel, title, hint, resumeBtn]);
    this.pausePanel = container;
  }

  private showOverlay(options: {
    title: string;
    subtitle?: string;
    buttons: { label: string; color: number; onClick: () => void }[];
  }) {
    this.hideOverlay();
    const w = this.scale.width;
    const h = this.scale.height;

    const container = this.add.container(0, 0).setDepth(100);

    const dim = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.65);
    dim.setInteractive();

    const panelW = 320;
    const panelH = 220;
    const panel = this.add.rectangle(w / 2, h / 2, panelW, panelH, 0x16213e);
    panel.setStrokeStyle(3, 0x667eea);

    const title = this.add
      .text(w / 2, h / 2 - 55, options.title, {
        fontSize: '22px',
        color: '#fff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: panelW - 24 },
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(
        w / 2,
        h / 2 - 10,
        options.subtitle ?? `Điểm: ${this.score}`,
        {
          fontSize: '18px',
          color: '#ccc',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    container.add([dim, panel, title, subtitle]);

    const btnY = h / 2 + 55;
    const btnSpacing = 130;
    const startX = w / 2 - ((options.buttons.length - 1) * btnSpacing) / 2;

    options.buttons.forEach((btn, i) => {
      const bx = startX + i * btnSpacing;
      const rect = this.add.rectangle(bx, btnY, 120, 40, btn.color);
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerdown', btn.onClick);
      const label = this.add
        .text(bx, btnY, btn.label, {
          fontSize: '15px',
          color: '#fff',
          align: 'center',
        })
        .setOrigin(0.5);
      container.add([rect, label]);
    });

    this.overlayPanel = container;
  }

  private onGameOver() {
    if (this.gameEnded) return;
    this.isPaused = false;
    this.hidePausePanel();
    this.pikachuGame.setGameOver();
    this.gameEnded = true;
    this.inputLocked = true;
    this.selectedTile = null;
    this.stopTimer();
    this.stopPeriodicShuffle();

    this.showOverlay({
      title: '⏰ Hết giờ!',
      subtitle: `Màn ${this.currentLevel} · Điểm: ${this.score}`,
      buttons: [
        {
          label: '🔄 Chơi lại',
          color: 0xf77f00,
          onClick: () => this.restartFromLevel1(),
        },
      ],
    });
  }

  private onLevelComplete() {
    if (this.gameEnded) return;
    this.isPaused = false;
    this.hidePausePanel();
    this.pikachuGame.setLevelComplete();
    this.gameEnded = true;
    this.inputLocked = true;
    this.selectedTile = null;
    this.stopTimer();
    this.stopPeriodicShuffle();

    this.showOverlay({
      title: `🎉 Hoàn thành màn ${this.currentLevel}!`,
      subtitle: `Điểm: ${this.score}`,
      buttons: [
        {
          label: '▶ Màn tiếp',
          color: 0x00b894,
          onClick: () => this.goToNextLevel(),
        },
        {
          label: '🔄 Từ đầu',
          color: 0xf77f00,
          onClick: () => this.restartFromLevel1(),
        },
      ],
    });
  }

  private async goToNextLevel() {
    this.hideOverlay();
    this.stopTimer();
    this.stopPeriodicShuffle();
    this.gameEnded = false;
    this.inputLocked = true;

    this.pikachuGame.nextLevel();
    this.score = this.pikachuGame.getScore();
    this.applyLevelSettings();
    await this.loadTileTextures();
    this.rebuildBoard();
    this.checkAutoShuffleIfStuck();
    this.inputLocked = false;
    this.startTimer();
    this.startPeriodicShuffle();
  }

  private restartFromLevel1() {
    this.hideOverlay();
    this.stopTimer();
    this.stopPeriodicShuffle();
    this.scene.restart({ level: 1, score: 0 });
  }

  shutdown() {
    this.stopTimer();
    this.stopPeriodicShuffle();
    this.hideOverlay();
    this.hidePausePanel();
    if (this.escKey) this.escKey.removeAllListeners();
  }

  private getTileColor(tileType: number): number {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xffa502, 0xff6348, 0x38ada9, 0xd4a5a5,
      0x6c5ce7, 0x00b894, 0xfdcb6e, 0x6c757d, 0xe84393, 0x30336b, 0xc44569,
    ];
    return colors[tileType % colors.length];
  }

  private setMessage(text: string): void {
    if (this.messageText?.active) {
      try {
        this.messageText.setText(text);
      } catch {
        /* ignore */
      }
    }
  }
}
