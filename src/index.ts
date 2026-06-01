/**
 * PanelManager 框架 - 统一导出
 *
 * 使用方式：
 * ```typescript
 * import { PanelManager, PanelManagerProvider, usePanelManager } from './core';
 * import { usePanelLifecycle, usePanel } from './hooks';
 * import { UILevel, MockFollowTarget, PanelProps } from './types/panel';
 * ```
 */

// Core
export { PanelManager } from './core/PanelManager';
export {
  PanelRegistry,
  getGlobalRegistry,
  registerPanel,
} from './core/PanelRegistry';
export {
  PanelManagerProvider,
  usePanelManager,
} from './core/PanelManagerProvider';

// Components
export { PanelWrapper } from './components/PanelWrapper';

// Hooks
export {
  usePanelLifecycle,
  usePanelVisibility,
  usePanel,
} from './hooks/usePanelLifecycle';

// Types
export * from './types/panel';
