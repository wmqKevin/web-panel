/**
 * PanelManager 核心实现
 *
 * 基于 Unity QFramework UIMgr 模式设计的 Web 端面板管理器。
 * 管理面板的打开、关闭、层级排序和生命周期。
 *
 * 设计原则：
 * - 面板通过名称唯一标识
 * - 支持单例模式（默认）和多实例模式
 * - UILevel.AlwayTop 面板始终渲染在 UILevel.Common 面板之上
 * - 面板生命周期：init → show → hide → destroy
 */

import {
  UILevel,
  DEFAULT_ANIMATION,
  PanelOptions,
  PanelInstance,
  PanelManagerEventType,
  PanelManagerEvent,
  PanelManagerEventListener,
  IUIData,
} from '../types/panel';
import { PanelRegistry, getGlobalRegistry } from './PanelRegistry';

/**
 * 生成唯一实例 ID
 */
let instanceCounter = 0;
function generateInstanceId(): string {
  return `panel_${Date.now()}_${++instanceCounter}`;
}

/**
 * PanelManager 类
 *
 * 核心面板管理器，负责：
 * 1. 面板的打开/关闭
 * 2. 面板层级管理
 * 3. 面板生命周期调度
 * 4. 面板间通信
 * 5. 事件通知
 *
 * @example
 * ```typescript
 * const pm = new PanelManager(registry);
 *
 * // 打开面板
 * pm.openPanel('UITipPanel', {
 *   data: { message: 'Hello!' },
 * });
 *
 * // 关闭面板
 * pm.closePanel('UITipPanel');
 *
 * // 关闭所有面板
 * pm.closeAll();
 * ```
 */
export class PanelManager {
  /** 面板注册表 */
  private registry: PanelRegistry;

  /** 当前活跃的面板实例（按实例 ID 索引） */
  private instances: Map<string, PanelInstance> = new Map();

  /** 面板名称到实例 ID 的映射（用于单例面板快速查找） */
  private nameToInstanceId: Map<string, string> = new Map();

  /** 事件监听器 */
  private listeners: Map<PanelManagerEventType, Set<PanelManagerEventListener>> =
    new Map();

  /** 状态变更订阅者（供 React 组件订阅） */
  private stateSubscribers: Set<() => void> = new Set();

  /**
   * 创建 PanelManager 实例
   * @param registry 面板注册表
   */
  constructor(registry: PanelRegistry) {
    this.registry = registry;
  }

  // ==========================================================================
  // 面板打开 / 关闭
  // ==========================================================================

  /**
   * 打开面板
   *
   * 如果面板是单例模式（默认）且已存在，则复用现有实例并更新数据。
   * 如果面板是多实例模式，则创建新实例。
   *
   * @param name 面板注册名称
   * @param options 打开选项
   * @returns 面板实例 ID
   * @throws 如果面板未注册
   */
  openPanel(name: string, options?: PanelOptions): string {
    const registration = this.registry.get(name);
    if (!registration) {
      throw new Error(
        `[PanelManager] 面板 "${name}" 未注册。可用面板: ${this.registry.getNames().join(', ')}`,
      );
    }

    const isSingleton = registration.singleton !== false; // 默认 true
    const existingInstanceId = this.nameToInstanceId.get(name);

    // 单例模式 + 已存在 → 复用并刷新
    if (isSingleton && existingInstanceId) {
      const instance = this.instances.get(existingInstanceId);
      if (instance && !instance.closing) {
        // 更新数据
        instance.data = options?.data ?? instance.data;
        instance.visible = true;
        instance.followTarget =
          options?.followTarget ?? instance.followTarget;
        if (options?.onClose) {
          instance.onClose = options.onClose;
        }

        this.emitEvent({
          type: PanelManagerEventType.PanelShow,
          panelName: name,
          instanceId: instance.id,
          data: instance.data,
        });

        this.notifyStateChange();
        return instance.id;
      }
    }

    // 创建新实例
    const id = generateInstanceId();
    const instance: PanelInstance = {
      id,
      name,
      level: options?.level ?? registration.level ?? UILevel.Common,
      data: options?.data ?? {},
      visible: true,
      closing: false,
      registration,
      animation:
        options?.animation ??
        registration.defaultAnimation ?? { ...DEFAULT_ANIMATION },
      onClose: options?.onClose,
      followTarget: options?.followTarget,
    };

    this.instances.set(id, instance);
    this.nameToInstanceId.set(name, id);

    this.emitEvent({
      type: PanelManagerEventType.PanelOpened,
      panelName: name,
      instanceId: id,
      data: instance.data,
    });

    this.notifyStateChange();
    return id;
  }

  /**
   * 关闭面板
   *
   * 如果面板正在显示，先触发 hide 生命周期，播放关闭动画后销毁。
   * 如果面板已经是关闭状态，直接销毁。
   *
   * @param name 面板注册名称
   */
  closePanel(name: string): void {
    const instanceId = this.nameToInstanceId.get(name);
    if (!instanceId) {
      return;
    }

    const instance = this.instances.get(instanceId);
    if (!instance || instance.closing) {
      return;
    }

    // 标记为正在关闭（等待动画完成）
    instance.closing = true;
    instance.visible = false;

    this.emitEvent({
      type: PanelManagerEventType.PanelHide,
      panelName: name,
      instanceId: instance.id,
    });

    this.notifyStateChange();

    // 如果没有动画或动画类型为 none，立即销毁
    if (instance.animation.type === 'none') {
      this.destroyInstance(instanceId);
    }
    // 否则由 PanelWrapper 动画完成后调用 confirmClose
  }

  /**
   * 确认关闭（由 PanelWrapper 在动画完成后调用）
   * @internal
   */
  confirmClose(instanceId: string): void {
    this.destroyInstance(instanceId);
  }

  /**
   * 销毁面板实例
   */
  private destroyInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    // 触发关闭回调
    instance.onClose?.();

    this.emitEvent({
      type: PanelManagerEventType.PanelClosed,
      panelName: instance.name,
      instanceId: instance.id,
    });

    // 清理映射
    const mappedId = this.nameToInstanceId.get(instance.name);
    if (mappedId === instanceId) {
      this.nameToInstanceId.delete(instance.name);
    }
    this.instances.delete(instanceId);

    this.notifyStateChange();
  }

  /**
   * 关闭所有面板
   */
  closeAll(): void {
    const instanceIds = Array.from(this.instances.keys());
    for (const id of instanceIds) {
      const instance = this.instances.get(id);
      if (instance) {
        instance.closing = true;
        instance.visible = false;
        this.destroyInstance(id);
      }
    }

    this.emitEvent({
      type: PanelManagerEventType.AllClosed,
      panelName: '',
    });
  }

  // ==========================================================================
  // 面板查询
  // ==========================================================================

  /**
   * 获取面板实例
   * @param name 面板注册名称
   * @returns 面板实例，如果不存在则返回 null
   */
  getPanel<T extends IUIData = IUIData>(
    name: string,
  ): (PanelInstance & { data: T }) | null {
    const instanceId = this.nameToInstanceId.get(name);
    if (!instanceId) return null;

    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    return instance as PanelInstance & { data: T };
  }

  /**
   * 获取所有活跃的面板实例（按层级和打开顺序排序）
   * 用于渲染
   */
  getActivePanels(): PanelInstance[] {
    const panels = Array.from(this.instances.values()).filter(
      (p) => !p.closing,
    );

    // 先按层级排序，再按实例 ID（即打开顺序）排序
    return panels.sort((a, b) => {
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      return a.id.localeCompare(b.id);
    });
  }

  /**
   * 获取所有面板实例（包括正在关闭的）
   */
  getAllPanels(): PanelInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * 检查面板是否已打开
   */
  isPanelOpen(name: string): boolean {
    const instanceId = this.nameToInstanceId.get(name);
    if (!instanceId) return false;
    const instance = this.instances.get(instanceId);
    return !!instance && !instance.closing;
  }

  /**
   * 获取打开的面板数量
   */
  getOpenCount(): number {
    return this.getActivePanels().length;
  }

  // ==========================================================================
  // 事件系统
  // ==========================================================================

  /**
   * 添加事件监听器
   */
  addEventListener(
    type: PanelManagerEventType,
    listener: PanelManagerEventListener,
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(
    type: PanelManagerEventType,
    listener: PanelManagerEventListener,
  ): void {
    this.listeners.get(type)?.delete(listener);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: PanelManagerEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (err) {
          console.error('[PanelManager] Event listener error:', err);
        }
      }
    }
  }

  // ==========================================================================
  // React 状态订阅
  // ==========================================================================

  /**
   * 订阅状态变更（供 React Context 使用）
   * @returns 取消订阅函数
   */
  subscribe(listener: () => void): () => void {
    this.stateSubscribers.add(listener);
    return () => {
      this.stateSubscribers.delete(listener);
    };
  }

  /**
   * 通知状态变更
   */
  private notifyStateChange(): void {
    for (const subscriber of this.stateSubscribers) {
      try {
        subscriber();
      } catch (err) {
        console.error('[PanelManager] State subscriber error:', err);
      }
    }
  }

  // ==========================================================================
  // 面板注册表代理
  // ==========================================================================

  /**
   * 获取面板注册表（只读）
   */
  getRegistry(): PanelRegistry {
    return this.registry;
  }

  // ==========================================================================
  // 静态代理方法（使用默认单例实例）
  // ==========================================================================

  static openPanel(name: string, options?: PanelOptions): string {
    return defaultInstance.openPanel(name, options);
  }

  static closePanel(name: string): void {
    defaultInstance.closePanel(name);
  }

  static closeAll(): void {
    defaultInstance.closeAll();
  }

  static getPanel<T extends IUIData = IUIData>(name: string): (PanelInstance & { data: T }) | null {
    return defaultInstance.getPanel<T>(name);
  }

  static isPanelOpen(name: string): boolean {
    return defaultInstance.isPanelOpen(name);
  }
}

// 默认单例实例
const defaultInstance = new PanelManager(getGlobalRegistry());

export const panelManager = defaultInstance;
