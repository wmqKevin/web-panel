/**
 * UITopOptTip - Ring-shaped operation buttons config
 */

export interface RingButtonConfig {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  enabled: boolean;
}

export interface TopOptTipData {
  /** Center position */
  centerX: number;
  centerY: number;
  /** Ring radius in pixels */
  radius: number;
  /** Starting angle in degrees */
  startAngle: number;
  /** Rotation offset in degrees */
  rotationOffset: number;
  /** Button configs */
  buttons: RingButtonConfig[];
  /** Whether to follow a 3D target */
  followTarget?: boolean;
  /** Target ID for following */
  targetId?: string;
}

export const sampleTopOptTipData: TopOptTipData = {
  centerX: 400,
  centerY: 300,
  radius: 80,
  startAngle: 0,
  rotationOffset: 0,
  buttons: [
    { id: 'btn_wash', label: '洗手', icon: '🧴', action: () => console.log('洗手'), enabled: true },
    { id: 'btn_glove', label: '戴手套', icon: '🧤', action: () => console.log('戴手套'), enabled: true },
    { id: 'btn_mask', label: '戴口罩', icon: '😷', action: () => console.log('戴口罩'), enabled: true },
    { id: 'btn_check', label: '检查', icon: '🔍', action: () => console.log('检查'), enabled: false },
    { id: 'btn_record', label: '记录', icon: '📝', action: () => console.log('记录'), enabled: true },
  ],
};
