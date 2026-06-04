/**
 * Level & mechanics config — source: games/pikachu/config/levels.json
 */

export type GravityDirection = 'bottom' | 'top' | 'left' | 'right';

export interface LevelDefaults {
  boardWidth: number;
  boardHeight: number;
  tileTypes: number;
  timeLimit: number;
  shuffleLimit: number;
}

export interface LevelOverride {
  level: number;
  boardWidth?: number;
  boardHeight?: number;
  tileTypes?: number;
  timeLimit?: number;
  shuffleLimit?: number;
}

export interface GravityMechanic {
  label?: string;
  levels: number[];
}

export interface PeriodicShuffleMechanic {
  label?: string;
  levels: number[];
  intervalSeconds: number;
}

export interface MechanicsConfig {
  gravityBottom?: GravityMechanic;
  gravityLeft?: GravityMechanic;
  gravityRight?: GravityMechanic;
  gravityTop?: GravityMechanic;
  periodicShuffle?: PeriodicShuffleMechanic;
}

export interface LevelsFileConfig {
  defaults: LevelDefaults;
  levelOverrides?: LevelOverride[];
  mechanics: MechanicsConfig;
}

export interface ResolvedLevelConfig {
  level: number;
  boardWidth: number;
  boardHeight: number;
  tileTypes: number;
  timeLimit: number;
  shuffleLimit: number;
  gravities: GravityDirection[];
  periodicShuffleSeconds: number | null;
}

function levelUses(mechanic: GravityMechanic | undefined, level: number): boolean {
  return mechanic?.levels?.includes(level) ?? false;
}

export function resolveLevelConfig(
  level: number,
  file: LevelsFileConfig
): ResolvedLevelConfig {
  const base = { ...file.defaults };
  const override = file.levelOverrides?.find((o) => o.level === level);
  const merged = { ...base, ...override, level };

  const gravities: GravityDirection[] = [];
  if (levelUses(file.mechanics.gravityBottom, level)) gravities.push('bottom');
  if (levelUses(file.mechanics.gravityLeft, level)) gravities.push('left');
  if (levelUses(file.mechanics.gravityRight, level)) gravities.push('right');
  if (levelUses(file.mechanics.gravityTop, level)) gravities.push('top');

  const periodic = file.mechanics.periodicShuffle;
  const periodicShuffleSeconds = levelUses(periodic, level)
    ? periodic!.intervalSeconds
    : null;

  return {
    level: merged.level,
    boardWidth: merged.boardWidth,
    boardHeight: merged.boardHeight,
    tileTypes: merged.tileTypes,
    timeLimit: merged.timeLimit,
    shuffleLimit: merged.shuffleLimit,
    gravities,
    periodicShuffleSeconds,
  };
}

/** Scale difficulty for levels without explicit override */
export function resolveLevelConfigWithScaling(
  level: number,
  file: LevelsFileConfig
): ResolvedLevelConfig {
  const explicit = file.levelOverrides?.find((o) => o.level === level);
  if (explicit) return resolveLevelConfig(level, file);

  const base = resolveLevelConfig(level, file);
  if (level <= 3) return base;

  const extra = level - 3;
  return {
    ...base,
    level,
    timeLimit: Math.max(60, base.timeLimit - extra * 5),
    tileTypes: Math.min(24, base.tileTypes + Math.floor(extra / 2)),
    shuffleLimit: Math.max(2, base.shuffleLimit - Math.floor(extra / 3)),
  };
}
