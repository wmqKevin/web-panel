import { useMemo } from 'react';
import { PanelManagerProvider, PanelRegistry, usePanelManager, UILevel } from './index';

// 面板组件
import UILoadPanel from './panels/UILoadPanel';
import UITipPanel from './panels/UITipPanel';
import UINoviceTutorialPanel from './panels/UINoviceTutorialPanel';
import UIRecordPanel from './panels/UIRecordPanel';
import LoadScenePanel from './panels/LoadScenePanel';
import UISelectPanel from './panels/UISelectPanel';
import UIFunctionPanel from './panels/UIFunctionPanel';
import UISubtitlePanel from './panels/UISubtitlePanel';
import UIProtectiveClothingPanel from './panels/UIProtectiveClothingPanel';
import TaskMenu from './panels/TaskMenu';
import UIHistoryTakingPanel from './panels/UIHistoryTakingPanel';
import UIDisinfectPanel from './panels/UIDisinfectPanel';
import UIComprehensivePerformanceRecordPanel from './panels/UIComprehensivePerformanceRecordPanel';
import UITopOptTip from './panels/UITopOptTip';

// 面板配置列表
const PANEL_CONFIGS = [
  {
    name: 'UILoadPanel',
    component: UILoadPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 300 },
    demoData: { version: 'v1.0.0', duration: 2000, autoOpenPanels: ['UISelectPanel'] },
  },
  {
    name: 'UITipPanel',
    component: UITipPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 300 },
    demoData: { title: '提示', content: 'Hello PanelManager!', mode: 'Custom' },
  },
  {
    name: 'UINoviceTutorialPanel',
    component: UINoviceTutorialPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'slide' as const, duration: 400, direction: 'bottom' as const },
    demoData: { mode: 'practice' },
  },
  {
    name: 'UIRecordPanel',
    component: UIRecordPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 300 },
    demoData: {},
  },
  {
    name: 'LoadScenePanel',
    component: LoadScenePanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 300 },
    demoData: { sceneName: 'MainScene' },
  },
  {
    name: 'UISelectPanel',
    component: UISelectPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'slide' as const, duration: 400, direction: 'left' as const },
    demoData: {},
  },
  {
    name: 'UIFunctionPanel',
    component: UIFunctionPanel,
    level: UILevel.AlwayTop,
    singleton: true,
    defaultAnimation: { type: 'slide' as const, duration: 300, direction: 'right' as const },
    demoData: {},
  },
  {
    name: 'UISubtitlePanel',
    component: UISubtitlePanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'slide' as const, duration: 400, direction: 'bottom' as const },
    demoData: {
      dialogues: [
        { text: '欢迎来到护理虚拟仿真系统。', speaker: '系统', audioUrl: null },
        { text: '请选择你要进行的案例练习。', speaker: '系统', audioUrl: null },
      ],
      typingSpeed: 50,
    },
  },
  {
    name: 'UIProtectiveClothingPanel',
    component: UIProtectiveClothingPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 300 },
    demoData: {},
  },
  {
    name: 'TaskMenu',
    component: TaskMenu,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'slide' as const, duration: 400, direction: 'right' as const },
    demoData: { mode: 'dot' },
  },
  {
    name: 'UIHistoryTakingPanel',
    component: UIHistoryTakingPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 300 },
    demoData: {},
  },
  {
    name: 'UIDisinfectPanel',
    component: UIDisinfectPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 300 },
    demoData: {},
  },
  {
    name: 'UIComprehensivePerformanceRecordPanel',
    component: UIComprehensivePerformanceRecordPanel,
    level: UILevel.Common,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 400 },
    demoData: {},
  },
  {
    name: 'UITopOptTip',
    component: UITopOptTip,
    level: UILevel.AlwayTop,
    singleton: true,
    defaultAnimation: { type: 'fade' as const, duration: 200 },
    demoData: {},
  },
];

function createRegistry(): PanelRegistry {
  const registry = new PanelRegistry();
  for (const config of PANEL_CONFIGS) {
    registry.register({
      name: config.name,
      component: config.component,
      level: config.level,
      singleton: config.singleton,
      defaultAnimation: config.defaultAnimation,
    });
  }
  return registry;
}

function AppContent() {
  const { openPanel, closePanel, closeAll, isPanelOpen } = usePanelManager();

  return (
    <div className="app" style={{ padding: '20px', minHeight: '100vh' }}>
      <h1>Web Panel - PanelManager Demo</h1>

      {/* 面板控制区 */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {PANEL_CONFIGS.map((config) => (
          <button
            key={config.name}
            onClick={() => {
              if (isPanelOpen(config.name)) {
                closePanel(config.name);
              } else {
                openPanel(config.name, { data: config.demoData });
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isPanelOpen(config.name) ? '#4caf50' : '#555',
              backgroundColor: isPanelOpen(config.name) ? '#4caf5022' : '#1a1a1a',
              color: isPanelOpen(config.name) ? '#4caf50' : '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s',
            }}
          >
            {isPanelOpen(config.name) ? '✕ ' : '▶ '}
            {config.name}
          </button>
        ))}
      </div>

      {/* 全局控制 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={closeAll}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #d9534f',
            backgroundColor: '#d9534f22',
            color: '#d9534f',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          关闭所有面板
        </button>
      </div>

      {/* 状态显示 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '8px',
          fontSize: '13px',
          color: '#aaa',
        }}
      >
        {PANEL_CONFIGS.map((config) => (
          <div
            key={config.name}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              backgroundColor: isPanelOpen(config.name) ? '#4caf5011' : 'transparent',
              border: '1px solid',
              borderColor: isPanelOpen(config.name) ? '#4caf5044' : '#333',
              color: isPanelOpen(config.name) ? '#4caf50' : '#666',
              transition: 'all 0.2s',
            }}
          >
            {config.name}: {isPanelOpen(config.name) ? '已打开' : '未打开'}
          </div>
        ))}
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
