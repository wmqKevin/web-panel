/**
 * PanelManager React Context Provider
 *
 * 将 PanelManager 实例注入 React 组件树，
 * 并自动渲染所有活跃面板。
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useCallback,
  useSyncExternalStore,
} from 'react';
import type { PanelOptions, PanelInstance, IUIData } from '../types/panel';
import { PanelManager } from '../core/PanelManager';
import { PanelRegistry } from '../core/PanelRegistry';
import { PanelWrapper } from '../components/PanelWrapper';

// ============================================================================
// Context
// ============================================================================

/**
 * PanelManager Context
 */
interface PanelManagerContextValue {
  /** PanelManager 实例 */
  manager: PanelManager;
  /** 打开面板 */
  openPanel: (name: string, options?: PanelOptions) => string;
  /** 关闭面板 */
  closePanel: (name: string) => void;
  /** 关闭所有面板 */
  closeAll: () => void;
  /** 获取面板实例 */
  getPanel: <T extends IUIData = IUIData>(
    name: string,
  ) => (PanelInstance & { data: T }) | null;
  /** 检查面板是否已打开 */
  isPanelOpen: (name: string) => boolean;
}

const PanelManagerContext = createContext<PanelManagerContextValue | null>(null);

/**
 * 获取 PanelManager Context
 * @throws 如果不在 PanelManagerProvider 内
 */
export function usePanelManager(): PanelManagerContextValue {
  const ctx = useContext(PanelManagerContext);
  if (!ctx) {
    throw new Error(
      '[usePanelManager] 必须在 <PanelManagerProvider> 内使用',
    );
  }
  return ctx;
}

// ============================================================================
// Active Panels Hook（使用 useSyncExternalStore 确保响应式）
// ============================================================================

/**
 * 订阅 PanelManager 活跃面板列表
 */
function useActivePanels(manager: PanelManager): PanelInstance[] {
  const managerRef = useRef(manager);
  managerRef.current = manager;

  const getSnapshotString = useCallback(() => {
    const panels = managerRef.current.getActivePanels();
    return JSON.stringify(
      panels.map((p) => ({
        id: p.id,
        name: p.name,
        visible: p.visible,
        closing: p.closing,
        level: p.level,
      })),
    );
  }, []);

  const snapshotRef = useRef<PanelInstance[]>([]);
  const stringRef = useRef<string>('');

  const subscribeStable = useCallback(
    (onStoreChange: () => void) => {
      return managerRef.current.subscribe(() => {
        const newString = getSnapshotString();
        if (newString !== stringRef.current) {
          stringRef.current = newString;
          snapshotRef.current = managerRef.current.getActivePanels();
          onStoreChange();
        }
      });
    },
    [getSnapshotString],
  );

  const getSnapshotStable = useCallback(() => snapshotRef.current, []);

  // 初始化
  if (snapshotRef.current.length === 0 && stringRef.current === '') {
    snapshotRef.current = manager.getActivePanels();
    stringRef.current = JSON.stringify(
      snapshotRef.current.map((p) => ({
        id: p.id,
        name: p.name,
        visible: p.visible,
        closing: p.closing,
        level: p.level,
      })),
    );
  }

  return useSyncExternalStore(
    subscribeStable,
    getSnapshotStable,
    getSnapshotStable,
  );
}

// ============================================================================
// Provider
// ============================================================================

interface PanelManagerProviderProps {
  /** 面板注册表 */
  registry: PanelRegistry;
  /** 子组件 */
  children: React.ReactNode;
}

/**
 * PanelManager Provider
 *
 * 将 PanelManager 注入 React 组件树，并渲染所有活跃面板。
 *
 * @example
 * ```tsx
 * const registry = new PanelRegistry();
 * registry.register({ name: 'MyPanel', component: MyPanelComponent });
 *
 * <PanelManagerProvider registry={registry}>
 *   <App />
 * </PanelManagerProvider>
 * ```
 */
export function PanelManagerProvider({
  registry,
  children,
}: PanelManagerProviderProps) {
  // 创建 PanelManager 实例（只创建一次）
  const managerRef = useRef<PanelManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new PanelManager(registry);
  }
  const manager = managerRef.current;

  // 获取活跃面板列表
  const activePanels = useActivePanels(manager);

  // 稳定的 Context value
  const contextValue = useMemo<PanelManagerContextValue>(
    () => ({
      manager,
      openPanel: (name: string, options?: PanelOptions) =>
        manager.openPanel(name, options),
      closePanel: (name: string) => manager.closePanel(name),
      closeAll: () => manager.closeAll(),
      getPanel: <T extends IUIData = IUIData>(name: string) =>
        manager.getPanel<T>(name),
      isPanelOpen: (name: string) => manager.isPanelOpen(name),
    }),
    [manager],
  );

  return (
    <PanelManagerContext.Provider value={contextValue}>
      {children}
      {/* 渲染所有活跃面板 */}
      <PanelLayerRenderer panels={activePanels} manager={manager} />
    </PanelManagerContext.Provider>
  );
}

// ============================================================================
// 面板层级渲染器
// ============================================================================

interface PanelLayerRendererProps {
  panels: PanelInstance[];
  manager: PanelManager;
}

/**
 * 面板层级渲染器
 * 将面板按 UILevel 分层渲染
 */
function PanelLayerRenderer({ panels, manager }: PanelLayerRendererProps) {
  if (panels.length === 0) return null;

  // 按 UILevel 分组
  const commonPanels = panels.filter((p) => p.level === 0);
  const topPanels = panels.filter((p) => p.level === 1);

  return (
    <>
      {/* Common 面板层 */}
      {commonPanels.length > 0 && (
        <div
          className="panel-layer panel-layer--common"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {commonPanels.map((panel) => (
            <PanelWrapper key={panel.id} instance={panel} manager={manager} />
          ))}
        </div>
      )}

      {/* AlwayTop 面板层 */}
      {topPanels.length > 0 && (
        <div
          className="panel-layer panel-layer--always-top"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 2000,
          }}
        >
          {topPanels.map((panel) => (
            <PanelWrapper key={panel.id} instance={panel} manager={manager} />
          ))}
        </div>
      )}
    </>
  );
}
