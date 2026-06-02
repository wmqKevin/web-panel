import React from 'react';
import { PanelProps } from '../types/panel';
import { Toggle } from '../components';

export const SettingsPanel: React.FC<PanelProps> = ({ visible, zIndex }) => {
  if (!visible) return null;

  const [darkMode, setDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="panel" style={{ zIndex }}>
      <h2>Settings</h2>
      <div className="panel-content">
        <Toggle
          checked={darkMode}
          onChange={setDarkMode}
          label="Dark Mode"
        />
        <Toggle
          checked={notifications}
          onChange={setNotifications}
          label="Notifications"
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
