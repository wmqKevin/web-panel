export interface PanelProps {
  id: string;
  visible: boolean;
  zIndex: number;
}

export interface PanelConfig {
  id: string;
  component: React.ComponentType<PanelProps>;
  defaultVisible?: boolean;
}
