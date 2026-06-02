import React from 'react';
import { PanelProps } from '../types/panel';
import { Slider } from '../components';

export const StatsPanel: React.FC<PanelProps> = ({ visible, zIndex }) => {
  const [cpu, setCpu] = React.useState(45);
  const [memory, setMemory] = React.useState(62);

  if (!visible) return null;

  return (
    <div className="panel" style={{ zIndex }}>
      <h2>Stats</h2>
      <div className="panel-content">
        <div className="stat-row">
          <label>CPU Usage</label>
          <Slider min={0} max={100} value={cpu} onChange={setCpu} />
          <span>{cpu}%</span>
        </div>
        <div className="stat-row">
          <label>Memory Usage</label>
          <Slider min={0} max={100} value={memory} onChange={setMemory} />
          <span>{memory}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
