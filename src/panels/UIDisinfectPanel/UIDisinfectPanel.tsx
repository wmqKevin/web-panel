/**
 * UIDisinfectPanel - Canvas pixel erasing interaction
 * Unity counterpart: UIDisinfectPanel.cs (Texture2D → HTML Canvas)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { PanelProps } from '../../types/panel';
import { usePanelLifecycle } from '../../hooks/usePanelLifecycle';
import type { DisinfectConfig } from '../../data/disinfectData';
import { defaultDisinfectConfig } from '../../data/disinfectData';
import './UIDisinfectPanel.css';

const UIDisinfectPanel: React.FC<PanelProps> = ({ data, onClose }) => {
  const config = (data?.config as DisinfectConfig) ?? defaultDisinfectConfig;
  const width = config.width ?? 600;
  const height = config.height ?? 400;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [shape, setShape] = useState<'circle' | 'square'>(config.shape);
  const [radius, setRadius] = useState(config.radius);
  const [intensity, setIntensity] = useState(config.intensity);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  usePanelLifecycle({
    onInit: () => console.log('[UIDisinfectPanel] init'),
    onShow: () => initCanvas(),
    onHide: () => console.log('[UIDisinfectPanel] hide'),
    onDestroy: () => console.log('[UIDisinfectPanel] destroy'),
  });

  /** Initialize canvas with dirty overlay */
  const initCanvas = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    const ctx = overlay.getContext('2d')!;

    // Draw background pattern (simulating a dirty surface)
    ctx.fillStyle = config.overlayColor ?? 'rgba(180, 120, 60, 0.9)';
    ctx.fillRect(0, 0, width, height);

    // Add some texture details
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 8 + 2;
      ctx.fillStyle = `rgba(${120 + Math.random() * 60}, ${80 + Math.random() * 40}, ${30 + Math.random() * 30}, ${0.3 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw bottom canvas - clean surface
    const base = canvasRef.current;
    if (base) {
      const baseCtx = base.getContext('2d')!;
      const gradient = baseCtx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#e8e8e8');
      gradient.addColorStop(1, '#d0d0d0');
      baseCtx.fillStyle = gradient;
      baseCtx.fillRect(0, 0, width, height);

      // Grid pattern for clean surface
      baseCtx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      baseCtx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        baseCtx.beginPath();
        baseCtx.moveTo(x, 0);
        baseCtx.lineTo(x, height);
        baseCtx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        baseCtx.beginPath();
        baseCtx.moveTo(0, y);
        baseCtx.lineTo(width, y);
        baseCtx.stroke();
      }

      // "CLEAN" text
      baseCtx.fillStyle = 'rgba(76, 175, 80, 0.15)';
      baseCtx.font = 'bold 48px Arial';
      baseCtx.textAlign = 'center';
      baseCtx.textBaseline = 'middle';
      baseCtx.fillText('✓ 已消毒', width / 2, height / 2);
    }
  }, [config, width, height]);

  /** Erase at position */
  const eraseAt = useCallback(
    (x: number, y: number) => {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;

      const ctx = overlay.getContext('2d')!;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;

      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }

      ctx.globalCompositeOperation = 'source-over';
    },
    [shape, radius, intensity]
  );

  /** Interpolate between two points for smooth erasing */
  const eraseLine = useCallback(
    (x0: number, y0: number, x1: number, y1: number) => {
      const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
      const steps = Math.max(Math.ceil(dist / (radius * 0.5)), 1);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        eraseAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
      }
    },
    [eraseAt, radius]
  );

  /** Calculate erase progress */
  const calculateProgress = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    const ctx = overlay.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = width * height;

    // Sample every 4th pixel for performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] < 128) transparent++;
    }

    const newProgress = transparent / (total / 4);
    setProgress(newProgress);
    if (newProgress >= (config.completionThreshold ?? 0.8)) {
      setIsComplete(true);
    }
  }, [width, height, config.completionThreshold]);

  // Mouse handlers
  const getCanvasPos = useCallback(
    (e: React.MouseEvent): { x: number; y: number } => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isComplete) return;
      isDrawingRef.current = true;
      const pos = getCanvasPos(e);
      lastPosRef.current = pos;
      eraseAt(pos.x, pos.y);
    },
    [getCanvasPos, eraseAt, isComplete]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Update cursor position
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }

      if (!isDrawingRef.current || isComplete) return;
      const pos = getCanvasPos(e);
      if (lastPosRef.current) {
        eraseLine(lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y);
      }
      lastPosRef.current = pos;
    },
    [getCanvasPos, eraseLine, isComplete]
  );

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    calculateProgress();
  }, [calculateProgress]);

  const handleMouseLeave = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    if (cursorRef.current) cursorRef.current.style.display = 'none';
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (cursorRef.current) cursorRef.current.style.display = 'block';
  }, []);

  // Update cursor size
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.width = `${radius * 2}px`;
      cursorRef.current.style.height = `${radius * 2}px`;
      cursorRef.current.className = `disinfect-cursor ${shape === 'square' ? 'square' : ''}`;
    }
  }, [radius, shape]);

  // Initialize canvas on mount
  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const resetCanvas = useCallback(() => {
    setIsComplete(false);
    setProgress(0);
    initCanvas();
  }, [initCanvas]);

  return (
    <div className="disinfect-root" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className={`disinfect-cursor ${shape === 'square' ? 'square' : ''}`}
        style={{ width: radius * 2, height: radius * 2, display: 'none' }}
      />

      <div className="disinfect-panel">
        {/* Header */}
        <div className="disinfect-header">
          <h2>🧹 消毒擦拭</h2>
          <button className="btn btn-secondary btn-sm" onClick={close}>
            ✕
          </button>
        </div>

        {/* Canvas */}
        <div
          className="disinfect-canvas-wrapper"
          style={{ width, height }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute' }} />
          <canvas
            ref={overlayCanvasRef}
            width={width}
            height={height}
            style={{ position: 'relative' }}
          />
          {isComplete && (
            <div className="disinfect-complete-overlay">
              <span className="disinfect-complete-text">✓ 消毒完成</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="disinfect-progress-wrapper">
          <span className="disinfect-progress-label">擦拭进度</span>
          <div className="disinfect-progress-bar">
            <div className="disinfect-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="disinfect-progress-text">{Math.round(progress * 100)}%</span>
        </div>

        {/* Controls */}
        <div className="disinfect-controls">
          <div className="disinfect-control-group">
            <span className="disinfect-control-label">形状</span>
            <button
              className={`disinfect-shape-btn ${shape === 'circle' ? 'active' : ''}`}
              onClick={() => setShape('circle')}
            >
              ⬤ 圆形
            </button>
            <button
              className={`disinfect-shape-btn ${shape === 'square' ? 'active' : ''}`}
              onClick={() => setShape('square')}
            >
              ◼ 方形
            </button>
          </div>

          <div className="disinfect-control-group">
            <span className="disinfect-control-label">大小</span>
            <input
              type="range"
              className="disinfect-slider"
              min={10}
              max={60}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </div>

          <div className="disinfect-control-group">
            <span className="disinfect-control-label">强度</span>
            <input
              type="range"
              className="disinfect-slider"
              min={0.1}
              max={1}
              step={0.1}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
            />
          </div>

          <button className="btn btn-warning btn-sm" onClick={resetCanvas}>
            重置
          </button>

          {isComplete && (
            <button className="btn btn-success btn-sm" onClick={close}>
              完成提交
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UIDisinfectPanel;
