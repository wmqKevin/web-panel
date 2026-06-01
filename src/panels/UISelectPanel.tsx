import { useState, useCallback } from 'react';
import { PanelManager } from '../core/PanelManager';
import { usePanelLifecycle } from '../hooks/usePanelLifecycle';
import type { PanelProps } from '../types/panel';

const CASES = [
  { id: 1, name: '案例一：普通病房护理', color: '#4a90d9' },
  { id: 2, name: '案例二：手术室准备', color: '#5cb85c' },
  { id: 3, name: '案例三：急诊处置', color: '#d9534f' },
  { id: 4, name: '案例四：ICU监护', color: '#f0ad4e' },
  { id: 5, name: '案例五：隔离区操作', color: '#6f42c1' },
];

export default function UISelectPanel(_props: PanelProps) {
  const [loadingCaseId, setLoadingCaseId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  usePanelLifecycle({
    onInit: () => {
      console.log('[UISelectPanel] initialized');
    },
    onShow: () => {
      console.log('[UISelectPanel] shown');
    },
  });

  const handleCaseClick = useCallback((caseId: number) => {
    if (loadingCaseId !== null) return;
    setLoadingCaseId(caseId);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoadingCaseId(null);
          setProgress(0);
          // 加载完成后打开相关面板
          PanelManager.openPanel('UIFunctionPanel', { level: 100 });
          PanelManager.openPanel('UISubtitlePanel', {
            data: {
              dialogues: [
                { text: `案例${caseId}加载完成，场景已就绪。`, audioUrl: null },
              ],
            },
          });
        }, 300);
      }
      setProgress(current);
    }, 150);
  }, [loadingCaseId]);

  const handleBackToMain = useCallback(() => {
    PanelManager.closePanel('UISelectPanel');
  }, []);

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2 style={titleStyle}>案例选择</h2>
        <div style={casesGridStyle}>
          {CASES.map((c) => (
            <button
              key={c.id}
              style={{
                ...caseButtonStyle,
                backgroundColor: c.color,
                opacity: loadingCaseId !== null && loadingCaseId !== c.id ? 0.5 : 1,
                cursor: loadingCaseId !== null ? 'not-allowed' : 'pointer',
              }}
              onClick={() => handleCaseClick(c.id)}
              disabled={loadingCaseId !== null}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loadingCaseId !== null && (
          <div style={loadingOverlayStyle}>
            <div style={loadingBoxStyle}>
              <p style={loadingTextStyle}>正在加载案例 {loadingCaseId}...</p>
              <div style={progressBarContainerStyle}>
                <div
                  style={{
                    ...progressBarFillStyle,
                    width: `${progress}%`,
                  }}
                />
              </div>
              <p style={progressTextStyle}>{Math.round(progress)}%</p>
            </div>
          </div>
        )}

        <button style={backButtonStyle} onClick={handleBackToMain}>
          返回主菜单
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.6)',
};

const panelStyle: React.CSSProperties = {
  width: 560,
  padding: '32px 40px',
  backgroundColor: '#16213e',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  position: 'relative',
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  textAlign: 'center',
  color: '#e94560',
};

const casesGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const caseButtonStyle: React.CSSProperties = {
  padding: '14px 20px',
  borderRadius: 10,
  color: '#fff',
  fontSize: 16,
  fontWeight: 500,
  transition: 'transform 0.15s, opacity 0.2s',
};

const loadingOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(22,33,62,0.92)',
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
};

const loadingBoxStyle: React.CSSProperties = {
  textAlign: 'center',
  width: '80%',
};

const loadingTextStyle: React.CSSProperties = {
  fontSize: 16,
  marginBottom: 16,
  color: '#ddd',
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: 12,
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: 6,
  overflow: 'hidden',
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#e94560',
  borderRadius: 6,
  transition: 'width 0.1s linear',
};

const progressTextStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 14,
  color: '#aaa',
};

const backButtonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: '12px',
  borderRadius: 8,
  backgroundColor: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#ccc',
  fontSize: 14,
  transition: 'all 0.2s',
};
