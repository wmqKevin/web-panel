import { useState } from 'react';
import { PanelProps } from '../types';
import { usePanelLifecycle } from '../core/usePanelLifecycle';

export enum TipMode {
  Custom = 'Custom',
  Correct = 'Correct',
  Error = 'Error',
}

interface TipPanelData {
  mode?: TipMode;
  title?: string;
  content?: string;
  buttonCount?: 1 | 2;
  confirmText?: string;
  cancelText?: string;
  align?: 'left' | 'center';
  onConfirm?: () => void;
  onCancel?: () => void;
}

const modeConfig: Record<TipMode, { title: string; color: string; icon: string }> = {
  [TipMode.Correct]: { title: '回答正确', color: '#4caf50', icon: '✓' },
  [TipMode.Error]: { title: '回答错误', color: '#f44336', icon: '✗' },
  [TipMode.Custom]: { title: '提示', color: '#4f8cff', icon: '!' },
};

export default function UITipPanel({ data, visible, close }: PanelProps) {
  const panelData = (data ?? {}) as TipPanelData;
  const [confirming, setConfirming] = useState(false);

  const mode = panelData.mode ?? TipMode.Custom;
  const config = modeConfig[mode];
  const buttonCount = panelData.buttonCount ?? 1;
  const align = panelData.align ?? 'center';
  const confirmText = panelData.confirmText ?? '确定';
  const cancelText = panelData.cancelText ?? '取消';

  usePanelLifecycle({}, data, visible);

  const handleConfirm = () => {
    if (confirming) return;
    setConfirming(true);
    panelData.onConfirm?.();
    close();
  };

  const handleCancel = () => {
    panelData.onCancel?.();
    close();
  };

  return (
    <div className="panel-root" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="panel-content tip-panel"
        style={{
          width: 380,
          textAlign: align,
          animation: visible ? 'tip-scale-in 0.25s ease' : 'none',
        }}
      >
        <div
          className="tip-icon"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: config.color,
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {config.icon}
        </div>

        <div className="tip-title" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#fff' }}>
          {panelData.title ?? config.title}
        </div>

        <div
          className="tip-content"
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 24,
            whiteSpace: 'pre-wrap',
          }}
        >
          {panelData.content ?? ''}
        </div>

        <div
          className="tip-buttons"
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: buttonCount === 2 ? 'flex-end' : 'center',
          }}
        >
          {buttonCount === 2 && (
            <button className="btn btn-secondary" onClick={handleCancel}>
              {cancelText}
            </button>
          )}
          <button className="btn btn-primary" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
