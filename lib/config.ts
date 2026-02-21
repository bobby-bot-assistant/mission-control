import path from 'path'

/**
 * Data directory configuration for Mission Control
 * Uses environment variable MC_DATA_ROOT if available, otherwise defaults to external data directory
 */
export const DATA_ROOT = process.env.MC_DATA_ROOT || '/Users/daisydukes/openclaw-projects/mission-control-data'

/**
 * Helper function to construct paths relative to the data root
 * @param segments Path segments to join
 * @returns Full path to the data file/directory
 */
export function dataPath(...segments: string[]): string {
  return path.join(DATA_ROOT, ...segments)
}