/**
 * Board Manager for Pikachu Game
 * Every tile type always appears an even number of times (valid pairs).
 */

export class Board {
  private width: number;
  private height: number;
  private tileTypes: number;
  private tiles: number[][] = [];

  constructor(width: number, height: number, tileTypes: number) {
    this.width = width;
    this.height = height;
    this.tileTypes = Math.max(1, tileTypes);
    this.initializeBoard();
  }

  private initializeBoard(): void {
    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = -1;
      }
    }

    const positions: { x: number; y: number }[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        positions.push({ x, y });
      }
    }

    const cellCount = positions.length;
    const usable = cellCount % 2 === 0 ? cellCount : cellCount - 1;
    const values = this.buildPairedValues(usable);

    this.shuffleArray(values);
    for (let i = 0; i < usable; i++) {
      const { x, y } = positions[i];
      this.tiles[y][x] = values[i];
    }
  }

  /** Build N values (N even) as N/2 identical pairs */
  private buildPairedValues(count: number): number[] {
    const pairCount = count / 2;
    const values: number[] = [];
    for (let i = 0; i < pairCount; i++) {
      const type = Math.floor(Math.random() * this.tileTypes);
      values.push(type, type);
    }
    return values;
  }

  private shuffleArray<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /** True if every remaining tile type has an even count */
  hasEvenTileParity(): boolean {
    const counts = new Map<number, number>();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const v = this.tiles[y][x];
        if (v === -1) continue;
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
    for (const c of counts.values()) {
      if (c % 2 !== 0) return false;
    }
    return true;
  }

  getTile(x: number, y: number): number {
    if (this.isValid(x, y)) {
      return this.tiles[y][x];
    }
    return -1;
  }

  removeTile(x: number, y: number): boolean {
    if (this.isValid(x, y)) {
      this.tiles[y][x] = -1;
      return true;
    }
    return false;
  }

  private isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getTiles(): number[][] {
    return this.tiles;
  }

  isEmpty(): boolean {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x] !== -1) {
          return false;
        }
      }
    }
    return true;
  }

  clone(): number[][] {
    return this.tiles.map((row) => [...row]);
  }

  /**
   * Shuffle remaining tiles — always keeps even count per type.
   */
  shuffleTiles(): boolean {
    const positions: { x: number; y: number }[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x] === -1) continue;
        positions.push({ x, y });
      }
    }

    const n = positions.length;
    if (n < 2) return false;

    let usablePositions = positions;
    if (n % 2 !== 0) {
      const orphan = positions.pop()!;
      this.tiles[orphan.y][orphan.x] = -1;
      usablePositions = positions;
    }

    const values = this.buildPairedValues(usablePositions.length);
    this.shuffleArray(values);

    for (let i = 0; i < usablePositions.length; i++) {
      const { x, y } = usablePositions[i];
      this.tiles[y][x] = values[i];
    }

    return true;
  }

  /** Fix orphan tiles by rebuilding remaining cells as valid pairs */
  repairTileParity(): boolean {
    if (this.hasEvenTileParity()) return false;
    return this.shuffleTiles();
  }
}
