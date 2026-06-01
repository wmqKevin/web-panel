/**
 * 面板注册表
 * 管理所有可用的面板类型注册信息
 */

import type { ComponentType } from 'react';
import type { PanelRegistration, PanelProps } from '../types/panel';

/**
 * 面板注册表
 * 负责管理面板组件的注册与查找
 */
export class PanelRegistry {
  private registrations: Map<string, PanelRegistration> = new Map();

  /**
   * 注册一个面板
   * @param registration 面板注册信息
   * @throws 如果同名面板已注册
   */
  register(registration: PanelRegistration): void {
    if (this.registrations.has(registration.name)) {
      console.warn(
        `[PanelRegistry] 面板 "${registration.name}" 已注册，将覆盖旧注册`,
      );
    }
    this.registrations.set(registration.name, registration);
  }

  /**
   * 批量注册面板
   */
  registerAll(registrations: PanelRegistration[]): void {
    for (const reg of registrations) {
      this.register(reg);
    }
  }

  /**
   * 注销面板
   */
  unregister(name: string): boolean {
    return this.registrations.delete(name);
  }

  /**
   * 获取面板注册信息
   */
  get(name: string): PanelRegistration | undefined {
    return this.registrations.get(name);
  }

  /**
   * 检查面板是否已注册
   */
  has(name: string): boolean {
    return this.registrations.has(name);
  }

  /**
   * 获取所有已注册的面板名称
   */
  getNames(): string[] {
    return Array.from(this.registrations.keys());
  }

  /**
   * 获取所有注册信息
   */
  getAll(): PanelRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.registrations.clear();
  }
}

/**
 * 全局单例注册表
 */
let globalRegistry: PanelRegistry | null = null;

/**
 * 获取全局面板注册表
 */
export function getGlobalRegistry(): PanelRegistry {
  if (!globalRegistry) {
    globalRegistry = new PanelRegistry();
  }
  return globalRegistry;
}

/**
 * 快捷注册函数
 * @param name 面板名称
 * @param component 面板组件
 * @param options 注册选项
 */
export function registerPanel(
  name: string,
  component: ComponentType<PanelProps>,
  options?: Omit<PanelRegistration, 'name' | 'component'>,
): void {
  getGlobalRegistry().register({
    name,
    component,
    ...options,
  });
}
