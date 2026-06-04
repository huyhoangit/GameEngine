/**
 * Match Checker — Pikachu rules with virtual outer border.
 * Playable grid: x ∈ [0, width-1], y ∈ [0, height-1].
 * Path may use virtual border cells x ∈ {-1, width}, y ∈ {-1, height} (always passable).
 * Max 3 segments (2 turns). Path must not pass through other tiles.
 */

export interface Point {
  x: number;
  y: number;
}

interface SearchState {
  x: number;
  y: number;
  direction: number;
  turnCount: number;
}

interface ParentEntry {
  px: number;
  py: number;
  pdir: number;
  pturn: number;
}

export class MatchChecker {
  private tiles: number[][];
  private width: number;
  private height: number;

  constructor(tiles: number[][], width: number, height: number) {
    this.tiles = tiles;
    this.width = width;
    this.height = height;
  }

  updateTiles(tiles: number[][]): void {
    this.tiles = tiles;
  }

  canConnect(x1: number, y1: number, x2: number, y2: number): boolean {
    return this.findPath(x1, y1, x2, y2) !== null;
  }

  /**
   * Returns grid path from tile1 to tile2 (inclusive), including virtual border cells.
   */
  findPath(x1: number, y1: number, x2: number, y2: number): Point[] | null {
    if (!this.isValidTile(x1, y1) || !this.isValidTile(x2, y2)) {
      return null;
    }
    if (this.tiles[y1][x1] !== this.tiles[y2][x2]) {
      return null;
    }
    if (x1 === x2 && y1 === y2) {
      return null;
    }

    const queue: SearchState[] = [];
    const visited = new Set<string>();
    const parent = new Map<string, ParentEntry>();

    const stateKey = (s: SearchState) =>
      `${s.x},${s.y},${s.direction},${s.turnCount}`;

    const tryEnqueue = (
      nx: number,
      ny: number,
      dir: number,
      turns: number,
      from: SearchState | null
    ) => {
      if (!this.isPassable(nx, ny, x1, y1, x2, y2)) return;
      const next: SearchState = { x: nx, y: ny, direction: dir, turnCount: turns };
      const key = stateKey(next);
      if (visited.has(key)) return;
      visited.add(key);
      if (from) {
        parent.set(key, {
          px: from.x,
          py: from.y,
          pdir: from.direction,
          pturn: from.turnCount,
        });
      }
      queue.push(next);
    };

    for (let dir = 0; dir < 4; dir++) {
      const [dx, dy] = this.getDirection(dir);
      tryEnqueue(x1 + dx, y1 + dy, dir, 0, null);
    }

    let goalKey: string | null = null;

    while (queue.length > 0) {
      const state = queue.shift()!;
      const key = stateKey(state);

      if (state.x === x2 && state.y === y2) {
        goalKey = key;
        break;
      }

      const [dx, dy] = this.getDirection(state.direction);
      const nx = state.x + dx;
      const ny = state.y + dy;
      tryEnqueue(nx, ny, state.direction, state.turnCount, state);

      if (state.turnCount < 2) {
        for (let newDir = 0; newDir < 4; newDir++) {
          if (newDir === state.direction) continue;
          const [ndx, ndy] = this.getDirection(newDir);
          tryEnqueue(
            state.x + ndx,
            state.y + ndy,
            newDir,
            state.turnCount + 1,
            state
          );
        }
      }
    }

    if (!goalKey) return null;

    const path: Point[] = [];
    let curKey: string | null = goalKey;
    let curState: SearchState | null = null;

    while (curKey) {
      const parts = curKey.split(',');
      const cx = parseInt(parts[0], 10);
      const cy = parseInt(parts[1], 10);
      path.unshift({ x: cx, y: cy });
      const p = parent.get(curKey);
      if (!p) break;
      curKey = `${p.px},${p.py},${p.pdir},${p.pturn}`;
    }

    path.unshift({ x: x1, y: y1 });
    return path;
  }

  private getDirection(dir: number): [number, number] {
    const directions: [number, number][] = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    return directions[dir];
  }

  /** Virtual border ring around the W×H playable area */
  private isInPathBounds(x: number, y: number): boolean {
    return x >= -1 && x <= this.width && y >= -1 && y <= this.height;
  }

  private isOnVirtualBorder(x: number, y: number): boolean {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  }

  private isValidTile(x: number, y: number): boolean {
    return (
      x >= 0 &&
      x < this.width &&
      y >= 0 &&
      y < this.height &&
      this.tiles[y][x] !== -1
    );
  }

  private isPassable(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): boolean {
    if (!this.isInPathBounds(x, y)) return false;
    if (this.isOnVirtualBorder(x, y)) return true;
    if (x === x2 && y === y2) return true;
    return this.tiles[y][x] === -1;
  }
}
