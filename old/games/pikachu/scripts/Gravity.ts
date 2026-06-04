import { Board } from './Board';
import { GravityDirection } from './LevelConfig';

export function applyGravity(board: Board, direction: GravityDirection): boolean {
  const tiles = board.getTiles();
  const width = board.getWidth();
  const height = board.getHeight();
  let changed = false;

  if (direction === 'bottom') {
    for (let x = 0; x < width; x++) {
      const vals: number[] = [];
      for (let y = height - 1; y >= 0; y--) {
        if (tiles[y][x] !== -1) vals.push(tiles[y][x]);
      }
      for (let y = height - 1; y >= 0; y--) {
        const v = height - 1 - y < vals.length ? vals[height - 1 - y] : -1;
        if (tiles[y][x] !== v) changed = true;
        tiles[y][x] = v;
      }
    }
  } else if (direction === 'top') {
    for (let x = 0; x < width; x++) {
      const vals: number[] = [];
      for (let y = 0; y < height; y++) {
        if (tiles[y][x] !== -1) vals.push(tiles[y][x]);
      }
      for (let y = 0; y < height; y++) {
        const v = y < vals.length ? vals[y] : -1;
        if (tiles[y][x] !== v) changed = true;
        tiles[y][x] = v;
      }
    }
  } else if (direction === 'left') {
    for (let y = 0; y < height; y++) {
      const vals: number[] = [];
      for (let x = 0; x < width; x++) {
        if (tiles[y][x] !== -1) vals.push(tiles[y][x]);
      }
      for (let x = 0; x < width; x++) {
        const v = x < vals.length ? vals[x] : -1;
        if (tiles[y][x] !== v) changed = true;
        tiles[y][x] = v;
      }
    }
  } else if (direction === 'right') {
    for (let y = 0; y < height; y++) {
      const vals: number[] = [];
      for (let x = width - 1; x >= 0; x--) {
        if (tiles[y][x] !== -1) vals.push(tiles[y][x]);
      }
      for (let x = width - 1; x >= 0; x--) {
        const v = width - 1 - x < vals.length ? vals[width - 1 - x] : -1;
        if (tiles[y][x] !== v) changed = true;
        tiles[y][x] = v;
      }
    }
  }

  return changed;
}

export function applyAllGravities(
  board: Board,
  directions: GravityDirection[]
): void {
  for (const d of directions) {
    applyGravity(board, d);
  }
}
