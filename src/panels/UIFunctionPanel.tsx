import { useState, useCallback, useRef } from 'react';
import { PanelManager } from '../core/PanelManager';
import { usePanelLifecycle } from '../hooks/usePanelLifecycle';
import { UILevel } from '../types/panel';
import type { PanelProps } from '../types/panel';

interface BackData {
  id: string;
  doAction: () => void;
  undoAction: () => void;
  label: string;
}

let singletonInstance: { pushBack: (data: BackData) => void; popBack: () => BackData | undefined } | null = null;

export default function UIFunctionPanel(_props: PanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [backStack, setBackStack] = useState<BackData[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const backStackRef = useRef(backStack);
  backStackRef.current = backStack;

  usePanelLifecycle({
    onInit: () => {
      console.log('[UIFunctionPanel] singleton initialized');
    },
  });

  // 单例引用暴露
  const pushBack = useCallback((item: BackData) => {
    setBackStack((prev) => [...prev, item]);
  }, []);

  const popBack = useCallback(() => {
    let popped: BackData | undefined;
    setBackStack((prev) => {
      if (prev.length === 0) return prev;
      popped = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return popped;
  }, []);

  // 注册单例方法
  if (!singletonInstance) {
    singletonInstance = { pushBack, popBack };
  }

  const handleUndo = useCallback(() => {
    const item = popBack();
    if (item) {
      item.undoAction();
    }
  }, [popBack]);

  const handlePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleQuit = useCallback(() => {
    PanelManager.closePanel('UIFunctionPanel');
  }, []);

  return (
    <div style={{ ...containerStyle, pointerEvents: 'none' }}>
      <div style={{ ...panelStyle, pointerEvents: 'auto' }}>
        {/* 展开/收起按钮 */}
        <button
          style={toggleButtonStyle}
          onClick={() => setExpanded((e) => !e)}
          title={expanded ? '收起' : '展开'}
        >
          {expanded ? '◀' : '▶'}
        </button>

        {/* 功能按钮组 */}
        <div
          style={{
            ...buttonsGroupStyle,
            maxWidth: expanded ? 200 : 0,
            opacity: expanded ? 1 : 0,
            marginLeft: expanded ? 8 : 0,
          }}
        >
          <button style={funcButtonStyle} onClick={handleUndo} title="撤销">
            ↩
          </button>
          <button
            style={{ ...funcButtonStyle, backgroundColor: isPaused ? '#d9534f' : '#5cb85c' }}
            onClick={handlePause}
            title={isPaused ? '继续' : '暂停'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button style={funcButtonStyle} onClick={handleFullscreen} title="全屏">
            ⛶
          </button>
          <button style={{ ...funcButtonStyle, backgroundColor: '#d9534f' }} onClick={handleQuit} title="退出">
            ✕
          </button>
        </div>
      </div>

      {/* 撤销计数徽章 */}
      {backStack.length > 0 && (
        <div style={badgeStyle}>{backStack.length}</div>
      )}
    </div>
  );
}

UIFunctionPanel.level = UILevel.AlwayTop;

export function getFunctionPanelApi() {
  return singletonInstance;
}

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 20,
  right: 20,
  display: 'flex',
  alignItems: 'center',
  zIndex: UILevel.AlwayTop,
};

const panelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(22,33,62,0.9)',
  borderRadius: 12,
  padding: '6px 10px',
  border: '1px solid rgba(255,255,255,0.1)',
};

const toggleButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: '#e94560',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s',
};

const buttonsGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  whiteSpace: 'nowrap',
};

const funcButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: '#4a90d9',
  color: '#fff',
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.15s, background-color 0.2s',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: -6,
  right: -6,
  width: 18,
  height: 18,
  borderRadius: '50%',
  backgroundColor: '#f0ad4e',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
