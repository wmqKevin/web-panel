import type { PanelConfig, PanelProps } from '../types/panel';

class PanelManager {
  private panels = new Map<string, PanelConfig>();
  private visiblePanels = new Set<string>();
  private listeners = new Set<() => void>();

  register(config: PanelConfig): void {
    this.panels.set(config.id, config);
    if (config.defaultVisible) {
      this.visiblePanels.add(config.id);
    }
    this.notify();
  }

  unregister(id: string): void {
    this.panels.delete(id);
    this.visiblePanels.delete(id);
    this.notify();
  }

  open(id: string): void {
    if (this.panels.has(id)) {
      this.visiblePanels.add(id);
      this.notify();
    }
  }

  close(id: string): void {
    this.visiblePanels.delete(id);
    this.notify();
  }

  toggle(id: string): void {
    if (this.visiblePanels.has(id)) {
      this.close(id);
    } else {
      this.open(id);
    }
  }

  isVisible(id: string): boolean {
    return this.visiblePanels.has(id);
  }

  getAllPanels(): PanelConfig[] {
    return Array.from(this.panels.values());
  }

  getPanelConfig(id: string): PanelConfig | undefined {
    return this.panels.get(id);
  }

  getVisiblePanels(): PanelProps[] {
    return Array.from(this.visiblePanels).map((id, index) => ({
      id,
      visible: true,
      zIndex: index + 1,
    }));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const panelManager = new PanelManager();
