/**
 * Pikachu Game - Phaser 3 Renderer
 * Handles visual rendering and user interactions
 */

import Phaser from 'phaser';
import { PikachuGame } from '@/../games/pikachu/scripts/PikachuGame';

export class PikachuRenderer {
  private game: Phaser.Game;
  private pikachuGame!: PikachuGame;
  private config: any;
  private tileSize: number = 40;
  private selectedTile: { x: number; y: number } | null = null;
  private board: number[][] = [];

  constructor(containerSelector: string) {
    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerSelector,
      backgroundColor: '#222',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: {
        preload: () => this.preload(),
        create: () => this.create(),
        update: () => this.update(),
      },
    };

    this.game = new Phaser.Game(phaserConfig);
  }

  private preload() {
    // Load assets here
  }

  private create() {
    const scene = this.game.scene.scenes[0];

    // Create UI
    this.drawUI(scene);
  }

  private update() {
    // Update logic
  }

  private drawUI(scene: Phaser.Scene) {
    // Title
    scene.add.text(400, 30, 'Pikachu', {
      fontSize: '24px',
      color: '#fff',
    });

    // Game info
    scene.add.text(50, 80, `Score: 0`, {
      fontSize: '16px',
      color: '#fff',
    });

    scene.add.text(250, 80, `Time: 2:00`, {
      fontSize: '16px',
      color: '#fff',
    });

    scene.add.text(450, 80, `Shuffles: 5`, {
      fontSize: '16px',
      color: '#fff',
    });
  }

  private drawBoard(scene: Phaser.Scene) {
    // Draw game board tiles
    const startX = 50;
    const startY = 150;

    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        const tileType = this.board[y][x];
        if (tileType === -1) continue;

        const tx = startX + x * this.tileSize;
        const ty = startY + y * this.tileSize;

        // Draw tile rectangle
        const rect = scene.add.rectangle(
          tx,
          ty,
          this.tileSize - 2,
          this.tileSize - 2,
          this.getTileColor(tileType)
        );

        // Make interactive
        rect.setInteractive({ useHandCursor: true });
        rect.on('pointerdown', () => this.onTileClick(x, y));
      }
    }
  }

  private onTileClick(x: number, y: number) {
    if (!this.selectedTile) {
      this.selectedTile = { x, y };
      console.log(`Selected tile at ${x}, ${y}`);
    } else {
      if (this.pikachuGame.attemptMatch(this.selectedTile.x, this.selectedTile.y, x, y)) {
        console.log('Match found!');
        this.selectedTile = null;
        // Redraw board
      } else {
        console.log('No match');
        this.selectedTile = { x, y };
      }
    }
  }

  private getTileColor(tileType: number): number {
    const colors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080,
    ];
    return colors[tileType % colors.length];
  }

  async initialize(configName: string = 'default') {
    this.pikachuGame = new PikachuGame();
    await this.pikachuGame.init();

    this.config = this.pikachuGame.getConfig ? await (this.pikachuGame as any).getConfig(configName) : null;
    if (this.config) {
      this.tileSize = this.config.ui.tileSize;
      const scene = this.game.scene.scenes[0];
      this.board = this.pikachuGame.getBoard().getTiles();
      this.drawBoard(scene);
    }
  }

  destroy() {
    this.game.destroy(true);
  }
}
