import React from 'react';
import { PanelProps } from '../types/panel';
import { ScrollView } from '../components';

export const LogPanel: React.FC<PanelProps> = ({ visible, zIndex }) => {
  if (!visible) return null;

  const logs = [
    '[INFO] Application started',
    '[INFO] PanelManager initialized',
    '[DEBUG] Loading panel configs...',
    '[INFO] All panels registered',
    '[INFO] Ready',
  ];

  return (
    <div className="panel" style={{ zIndex }}>
      <h2>Logs</h2>
      <ScrollView className="panel-content log-list">
        {logs.map((log, i) => (
          <div key={i} className="log-item">{log}</div>
        ))}
      </ScrollView>
    </div>
  );
};

export default LogPanel;
