import { panelManager } from '../core/PanelManager';
import { SettingsPanel } from './SettingsPanel';
import { LogPanel } from './LogPanel';
import { StatsPanel } from './StatsPanel';

panelManager.register({
  id: 'settings',
  component: SettingsPanel,
  defaultVisible: false,
});

panelManager.register({
  id: 'logs',
  component: LogPanel,
  defaultVisible: false,
});

panelManager.register({
  id: 'stats',
  component: StatsPanel,
  defaultVisible: false,
});

export { SettingsPanel, LogPanel, StatsPanel };
