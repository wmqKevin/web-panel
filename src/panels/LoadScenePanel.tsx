import { useState, useRef, useCallback } from 'react';
import { PanelProps } from '../types/panel';
import { usePanel } from '../hooks/usePanelLifecycle';

interface LoadSceneData {
  sceneName?: string;
  minDisplayTime?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  loadTask?: () => Promise<void>;
}

const tips = [
  '正在加载资源...',
  '正在初始化场景...',
  '正在准备数据...',
  '即将完成...',
];

export default function LoadScenePanel({ data, visible, onClose }: PanelProps) {
  const panelData = (data ?? {}) as LoadSceneData;
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState('');
  const startTimeRef = useRef(0);
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const completedRef = useRef(false);

  const sceneName = panelData.sceneName ?? '场景';
  const minDisplayTime = panelData.minDisplayTime ?? 1500;

  const simulateLoad = useCallback(async () => {
    completedRef.current = false;
    startTimeRef.current = performance.now();
    setProgress(0);
    progressRef.current = 0;
    setTip(tips[0]);

    const loadStart = performance.now();

    // Run actual async load task if provided
    const loadPromise = panelData.loadTask
      ? panelData.loadTask()
      : Promise.resolve();

    // Simulate progress while loading
    const animateProgress = () => {
      const elapsed = performance.now() - loadStart;
      const fakeProgress = Math.min(elapsed / 2000, 0.95);

      progressRef.current = fakeProgress;
      setProgress(fakeProgress);

      const tipIndex = Math.min(Math.floor(fakeProgress * tips.length), tips.length - 1);
      setTip(tips[tipIndex]);

      panelData.onProgress?.(fakeProgress);

      if (fakeProgress < 0.95 && !completedRef.current) {
        rafRef.current = requestAnimationFrame(animateProgress);
      }
    };

    rafRef.current = requestAnimationFrame(animateProgress);

    try {
      await loadPromise;
    } catch (err) {
      console.error('[LoadScenePanel] Load task failed:', err);
    }

    // Ensure minimum display time
    const elapsed = performance.now() - startTimeRef.current;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    completedRef.current = true;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    setProgress(1);
    setTip('加载完成');
    panelData.onProgress?.(1);
    panelData.onComplete?.();

    setTimeout(() => onClose(), 300);
  }, [panelData, minDisplayTime, close, tips]);

  usePanel({
    visible,
    data,
    onShow: () => {
        simulateLoad();
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
    <div className="panel-root" style={{ background: '#0a0a1a' }}>
      <div className="loadscene-content" style={{ textAlign: 'center', width: 480 }}>
        <div
          className="loadscene-title"
          style={{ fontSize: 22, fontWeight: 500, marginBottom: 12, color: '#fff' }}
        >
          正在加载 {sceneName}
        </div>

        <div
          className="loadscene-tip"
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 32,
            minHeight: 20,
          }}
        >
          {tip}
        </div>

        <div
          className="loadscene-progress-track"
          style={{
            width: '100%',
            height: 6,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            className="loadscene-progress-fill"
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4f8cff, #00d4aa)',
              borderRadius: 3,
              transition: progress === 1 ? 'width 0.3s ease' : 'width 0.05s linear',
            }}
          />
        </div>

        <div
          className="loadscene-percent"
          style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}
        >
          {Math.floor(progress * 100)}%
        </div>
      </div>
    </div>
  );
}
