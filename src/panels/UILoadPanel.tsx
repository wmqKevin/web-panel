import { useState, useRef } from 'react';
import { PanelProps } from '../types/panel';
import { usePanel } from '../hooks/usePanelLifecycle';
import { panelManager } from '../core/PanelManager';

interface LoadPanelData {
  version?: string;
  onComplete?: () => void;
  autoOpenPanels?: string[];
  duration?: number;
}

export default function UILoadPanel({ data, visible, onClose }: PanelProps) {
  const panelData = (data ?? {}) as LoadPanelData;
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);

  const duration = panelData.duration ?? 3000;
  const version = panelData.version ?? 'v1.0.0';

  usePanel({
    visible,
    data,
    onShow: () => {
        setProgress(0);
        setIsComplete(false);
        progressRef.current = 0;

        const startTime = performance.now();

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const raw = Math.min(elapsed / duration, 1);
          progressRef.current = raw;
          setProgress(raw);

          if (raw < 1) {
            rafRef.current = requestAnimationFrame(animate);
          } else {
            setIsComplete(true);
            panelData.onComplete?.();

            if (panelData.autoOpenPanels?.length) {
              panelData.autoOpenPanels.forEach((name) => {
                panelManager.openPanel(name);
              });
            }

            setTimeout(() => onClose(), 500);
          }
        };

        rafRef.current = requestAnimationFrame(animate);
      },
      onHide: () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      },
      onDestroy: () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      },
  });

  return (
    <div className="panel-root" style={{ background: '#0f0f23' }}>
      <div className="load-panel-content" style={{ textAlign: 'center', width: 420 }}>
        <div className="load-title" style={{ fontSize: 28, fontWeight: 600, marginBottom: 40, color: '#fff' }}>
          加载中...
        </div>

        <div
          className="load-progress-track"
          style={{
            width: '100%',
            height: 8,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            className="load-progress-fill"
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4f8cff, #6ab7ff)',
              borderRadius: 4,
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        <div
          className="load-percent"
          style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}
        >
          {Math.floor(progress * 100)}%
        </div>

        {isComplete && (
          <div className="load-complete" style={{ fontSize: 16, color: '#4caf50', marginBottom: 16 }}>
            加载完成
          </div>
        )}

        <div className="load-version" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          {version}
        </div>
      </div>
    </div>
  );
}
