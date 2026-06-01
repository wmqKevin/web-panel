import { useMemo } from 'react';
import { PanelManagerProvider, PanelRegistry, usePanelManager, usePanel, UILevel } from './index';
import type { PanelProps, IUIData } from './index';

// ============================================================================
// 示例面板组件
// ============================================================================

interface TipPanelData extends IUIData {
  title?: string;
  message: string;
}

function UITipPanel({ data, visible, onClose }: PanelProps) {
  const panelData = data as TipPanelData;

  usePanel({
    visible,
    data: panelData,
    onInit() {
      console.log('[UITipPanel] 初始化');
    },
    onShow(d) {
      console.log('[UITipPanel] 显示，消息:', (d as TipPanelData).message);
    },
    onHide() {
      console.log('[UITipPanel] 隐藏');
    },
    onDestroy() {
      console.log('[UITipPanel] 销毁');
    },
  });

  if (!visible) return null;

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '24px',
        borderRadius: '12px',
        minWidth: '300px',
        textAlign: 'center',
        color: '#fff',
      }}
    >
      {panelData.title && <h3>{panelData.title}</h3>}
      <p>{panelData.message}</p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={onClose}>确定</button>
      </div>
    </div>
  );
}

function UIFunctionPanel({ data, visible, onClose }: PanelProps) {
  usePanel({
    visible,
    data,
    onInit() {
      console.log('[UIFunctionPanel] 初始化（AlwayTop）');
    },
    onShow() {
      console.log('[UIFunctionPanel] 显示');
    },
    onDestroy() {
      console.log('[UIFunctionPanel] 销毁');
    },
  });

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#333',
        padding: '12px',
        borderRadius: '8px',
        color: '#fff',
        display: 'flex',
        gap: '8px',
      }}
    >
      <button onClick={() => console.log('暂停')}>⏸ 暂停</button>
      <button onClick={() => console.log('全屏')}>⛶ 全屏</button>
      <button onClick={onClose}>✕ 关闭</button>
    </div>
  );
}

// ============================================================================
// 注册表配置
// ============================================================================

function createRegistry(): PanelRegistry {
  const registry = new PanelRegistry();

  registry.register({
    name: 'UITipPanel',
    component: UITipPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: {
      type: 'fade',
      duration: 300,
    },
  });

  registry.register({
    name: 'UIFunctionPanel',
    component: UIFunctionPanel,
    level: UILevel.AlwayTop,
    singleton: true,
    defaultAnimation: {
      type: 'slide',
      duration: 300,
      direction: 'right',
    },
  });

  return registry;
}

// ============================================================================
// 应用入口
// ============================================================================

function AppContent() {
  const { openPanel, closePanel, closeAll, isPanelOpen } = usePanelManager();

  return (
    <div className="app" style={{ padding: '20px' }}>
      <h1>Web Panel - PanelManager Demo</h1>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => openPanel('UITipPanel', { data: { title: '提示', message: 'Hello PanelManager!' } })}>
          打开提示面板 (Common)
        </button>
        <button onClick={() => openPanel('UIFunctionPanel', { data: {} })}>
          打开功能面板 (AlwaysTop)
        </button>
        <button onClick={() => closePanel('UITipPanel')}>
          关闭提示面板
        </button>
        <button onClick={closeAll}>
          关闭所有面板
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>UITipPanel: {isPanelOpen('UITipPanel') ? '✅ 已打开' : '❌ 未打开'}</p>
        <p>UIFunctionPanel: {isPanelOpen('UIFunctionPanel') ? '✅ 已打开' : '❌ 未打开'}</p>
      </div>
    </div>
  );
}

function App() {
  const registry = useMemo(() => createRegistry(), []);

  return (
    <PanelManagerProvider registry={registry}>
      <AppContent />
    </PanelManagerProvider>
  );
}

export default App;
