/**
 * Tile asset keys — drop images in public/tiles/
 *
 * Naming (first match wins):
 * 1. manifest.json entry: { "tiles": { "0": "apple.png" } }
 * 2. /tiles/{key}.png  where key is tile type number as string
 * 3. /tiles/{key}.webp
 *
 * Phaser texture key: tile_{type}
 */

export interface TileManifest {
  basePath?: string;
  tiles?: Record<string, string>;
}

export const DEFAULT_TILE_BASE = '/tiles';

export function getTileTextureKey(tileType: number): string {
  return `tile_${tileType}`;
}

export function resolveTileFileName(
  tileType: number,
  manifest: TileManifest | null
): string {
  const key = String(tileType);
  if (manifest?.tiles?.[key]) {
    return manifest.tiles[key];
  }
  return `${key}.png`;
}

export function resolveTileUrl(
  tileType: number,
  manifest: TileManifest | null,
  basePath: string = DEFAULT_TILE_BASE
): string {
  const file = resolveTileFileName(tileType, manifest);
  const normalized = file.startsWith('/') ? file : `${basePath}/${file}`;
  return normalized;
}
