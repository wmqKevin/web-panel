/**
 * PanelManager 核心类型定义
 *
 * 基于 Unity QFramework UIMgr 模式设计的 Web 端面板管理系统类型
 */

import type { ComponentType } from 'react';

// ============================================================================
// UI 层级
// ============================================================================

/**
 * 面板层级枚举
 * - Common: 普通面板，按打开顺序叠加
 * - AlwayTop: 始终置顶面板（如 UIFunctionPanel），渲染在所有 Common 面板之上
 */
export enum UILevel {
  Common = 0,
  AlwayTop = 1,
}

// ============================================================================
// 面板数据与通信
// ============================================================================

/**
 * 面板数据基础接口
 * 所有面板间传递的数据都需要实现此接口
 */
export interface IUIData {
  [key: string]: unknown;
}

/**
 * 面板回调映射
 * 用于面板操作结果通知
 */
export interface IPanelCallbacks {
  /** 确认回调 */
  onConfirm?: (...args: unknown[]) => void;
  /** 取消回调 */
  onCancel?: (...args: unknown[]) => void;
  /** 自定义回调 */
  [callbackName: string]: ((...args: unknown[]) => void) | undefined;
}

// ============================================================================
// 动画
// ============================================================================

/**
 * 面板动画类型
 */
export type AnimationType = 'none' | 'fade' | 'slide';

/**
 * 滑动方向
 */
export type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

/**
 * 面板动画配置
 */
export interface PanelAnimation {
  /** 动画类型 */
  type: AnimationType;
  /** 动画时长（毫秒），默认 300 */
  duration?: number;
  /** 滑动方向（仅 type=slide 时生效），默认 'bottom' */
  direction?: SlideDirection;
  /** 缓动函数，默认 'ease-out' */
  easing?: string;
}

/**
 * 默认动画配置
 */
export const DEFAULT_ANIMATION: PanelAnimation = {
  type: 'fade',
  duration: 300,
  easing: 'ease-out',
};

// ============================================================================
// 3D 跟随目标接口（预留）
// ============================================================================

/**
 * 3D 物体跟随目标接口
 * 预留给未来 3D 场景中的 UI 跟随功能
 *
 * Web 端纯 UI 模式下使用 MockFollowTarget 实现
 */
export interface IFollowTarget {
  /** 获取 3D 世界坐标 */
  getPosition(): { x: number; y: number; z: number };
  /** 获取屏幕空间坐标 */
  getScreenPosition(): { x: number; y: number };
  /** 获取目标是否仍然有效（3D 物体可能被销毁） */
  isValid(): boolean;
}

/**
 * Mock 跟随目标实现（纯 UI 模式）
 * 提供固定的屏幕坐标位置
 */
export class MockFollowTarget implements IFollowTarget {
  private screenPos: { x: number; y: number };
  private valid: boolean;

  constructor(x: number = 0, y: number = 0) {
    this.screenPos = { x, y };
    this.valid = true;
  }

  getPosition(): { x: number; y: number; z: number } {
    return { x: this.screenPos.x, y: this.screenPos.y, z: 0 };
  }

  getScreenPosition(): { x: number; y: number } {
    return { ...this.screenPos };
  }

  isValid(): boolean {
    return this.valid;
  }

  /** 更新位置（测试用） */
  updatePosition(x: number, y: number): void {
    this.screenPos = { x, y };
  }

  /** 标记为无效（模拟 3D 物体销毁） */
  destroy(): void {
    this.valid = false;
  }
}

// ============================================================================
// 面板注册
// ============================================================================

/**
 * 面板组件 Props
 * 所有面板组件都需要接受此 Props 类型
 */
export interface PanelProps {
  /** 面板名称 */
  panelName: string;
  /** 面板数据 */
  data: IUIData;
  /** 是否可见 */
  visible: boolean;
  /** 关闭面板回调 */
  onClose: () => void;
  /** 跟随目标（可选） */
  followTarget?: IFollowTarget;
}

/**
 * 面板注册信息
 * 描述一个可被 PanelManager 管理的面板
 */
export interface PanelRegistration {
  /** 面板名称（唯一标识） */
  name: string;
  /** 面板 React 组件 */
  component: ComponentType<PanelProps>;
  /** 面板层级，默认 UILevel.Common */
  level?: UILevel;
  /** 是否单例（同一时间只允许一个实例），默认 true */
  singleton?: boolean;
  /** 默认动画配置 */
  defaultAnimation?: PanelAnimation;
}

// ============================================================================
// 面板实例（PanelManager 内部使用）
// ============================================================================

/**
 * 打开面板的选项
 */
export interface PanelOptions {
  /** 传递给面板的数据 */
  data?: IUIData;
  /** 面板层级（覆盖注册时的层级） */
  level?: UILevel;
  /** 本次打开使用的动画（覆盖默认动画） */
  animation?: PanelAnimation;
  /** 关闭回调 */
  onClose?: () => void;
  /** 跟随目标 */
  followTarget?: IFollowTarget;
}

/**
 * 面板实例信息（PanelManager 内部管理）
 */
export interface PanelInstance {
  /** 唯一实例 ID */
  id: string;
  /** 面板注册名称 */
  name: string;
  /** 面板层级 */
  level: UILevel;
  /** 面板数据 */
  data: IUIData;
  /** 是否可见 */
  visible: boolean;
  /** 是否正在关闭（播放关闭动画中） */
  closing: boolean;
  /** 面板注册信息 */
  registration: PanelRegistration;
  /** 动画配置 */
  animation: PanelAnimation;
  /** 关闭回调 */
  onClose?: () => void;
  /** 跟随目标 */
  followTarget?: IFollowTarget;
}

// ============================================================================
// 生命周期
// ============================================================================

/**
 * 面板生命周期阶段
 */
export type LifecyclePhase = 'init' | 'show' | 'hide' | 'destroy';

/**
 * 面板生命周期回调
 */
export interface PanelLifecycleCallbacks {
  /** 初始化时调用（面板首次创建） */
  onInit?: () => void | (() => void);
  /** 面板显示时调用 */
  onShow?: (data: IUIData) => void;
  /** 面板隐藏时调用 */
  onHide?: () => void;
  /** 面板销毁前调用 */
  onDestroy?: () => void;
}

// ============================================================================
// PanelManager 事件
// ============================================================================

/**
 * PanelManager 事件类型
 */
export enum PanelManagerEventType {
  PanelOpened = 'panel:opened',
  PanelClosed = 'panel:closed',
  PanelShow = 'panel:show',
  PanelHide = 'panel:hide',
  AllClosed = 'all:closed',
}

/**
 * PanelManager 事件载荷
 */
export interface PanelManagerEvent {
  type: PanelManagerEventType;
  panelName: string;
  instanceId?: string;
  data?: IUIData;
}

/**
 * 事件监听器
 */
export type PanelManagerEventListener = (event: PanelManagerEvent) => void;
