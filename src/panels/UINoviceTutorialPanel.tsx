import { useState } from 'react';
import { PanelProps } from '../types/panel';
import { usePanel } from '../hooks/usePanelLifecycle';

export enum TutorialMode {
  Practice = 'Practice',
  Exam = 'Exam',
}

interface NoviceTutorialData {
  defaultMode?: TutorialMode;
  onPractice?: () => void;
  onExam?: () => void;
  onBack?: () => void;
}

export default function UINoviceTutorialPanel({ data, visible, onClose }: PanelProps) {
  const panelData = (data ?? {}) as NoviceTutorialData;
  const [mode, setMode] = useState<TutorialMode>(panelData.defaultMode ?? TutorialMode.Practice);

  usePanel({
    visible,
    data,
  });

  const handlePractice = () => {
    setMode(TutorialMode.Practice);
    panelData.onPractice?.();
  };

  const handleExam = () => {
    setMode(TutorialMode.Exam);
    panelData.onExam?.();
  };

  const handleBack = () => {
    panelData.onBack?.();
    onClose();
  };

  return (
    <div className="panel-root" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="panel-content novice-panel"
        style={{
          width: 480,
          animation: visible ? 'tip-scale-in 0.25s ease' : 'none',
        }}
      >
        <div
          className="novice-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, color: '#fff' }}>新手引导</h2>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleBack}
            style={{ padding: '4px 12px' }}
          >
            返回
          </button>
        </div>

        <div
          className="novice-mode-switch"
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: 4,
            marginBottom: 32,
          }}
        >
          <button
            className="btn"
            onClick={handlePractice}
            style={{
              flex: 1,
              background: mode === TutorialMode.Practice ? '#4f8cff' : 'transparent',
              color: '#fff',
              borderRadius: 6,
              transition: 'all 0.2s ease',
            }}
          >
            练习模式
          </button>
          <button
            className="btn"
            onClick={handleExam}
            style={{
              flex: 1,
              background: mode === TutorialMode.Exam ? '#4f8cff' : 'transparent',
              color: '#fff',
              borderRadius: 6,
              transition: 'all 0.2s ease',
            }}
          >
            考核模式
          </button>
        </div>

        <div
          className="novice-content"
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            minHeight: 120,
          }}
        >
          {mode === TutorialMode.Practice ? (
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#6ab7ff' }}>练习模式</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                在练习模式下，您可以自由探索各项功能，系统会提供操作提示和错误纠正。适合初次接触的用户熟悉操作流程。
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#ff9800' }}>考核模式</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                在考核模式下，您需要独立完成操作任务，系统将记录您的操作并给出评分。适合检验学习成果。
              </p>
            </div>
          )}
        </div>

        <div className="novice-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-lg btn-primary"
            onClick={() => {
              if (mode === TutorialMode.Practice) {
                panelData.onPractice?.();
              } else {
                panelData.onExam?.();
              }
              onClose();
            }}
          >
            开始{mode === TutorialMode.Practice ? '练习' : '考核'}
          </button>
        </div>
      </div>
    </div>
  );
}
