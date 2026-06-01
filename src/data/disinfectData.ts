/**
 * UIDisinfectPanel - Disinfect wiping panel configuration
 */

export interface DisinfectConfig {
  /** Eraser shape */
  shape: 'circle' | 'square';
  /** Eraser radius in pixels */
  radius: number;
  /** Eraser intensity (0-1) */
  intensity: number;
  /** Background image URL or color */
  backgroundImage?: string;
  /** Overlay image that needs to be wiped away */
  overlayColor?: string;
  /** Completion threshold (percentage 0-1) */
  completionThreshold: number;
  /** Width of the canvas */
  width: number;
  /** Height of the canvas */
  height: number;
}

export const defaultDisinfectConfig: DisinfectConfig = {
  shape: 'circle',
  radius: 30,
  intensity: 1,
  overlayColor: 'rgba(180, 120, 60, 0.9)',
  completionThreshold: 0.8,
  width: 600,
  height: 400,
};
