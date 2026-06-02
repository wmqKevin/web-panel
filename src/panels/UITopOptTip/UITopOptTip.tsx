/**
 * UITopOptTip - Ring-shaped operation buttons panel
 * Unity counterpart: UITopOptTip.cs
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { PanelProps, IFollowTarget } from '../../types/panel';
import { MockFollowTarget } from '../../types/panel';
import { usePanelLifecycle } from '../../hooks/usePanelLifecycle';
import type { TopOptTipData, RingButtonConfig } from '../../data/topOptTipData';
import { sampleTopOptTipData } from '../../data/topOptTipData';
import './UITopOptTip.css';

/** Calculate button position on ring */
function getRingPosition(
  index: number,
  total: number,
  radius: number,
  centerX: number,
  centerY: number,
  startAngle: number = 0,
  rotationOffset: number = 0
): { x: number; y: number } {
  const angleStep = (2 * Math.PI) / total;
  const angle = (startAngle * Math.PI) / 180 + index * angleStep + (rotationOffset * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

const UITopOptTip: React.FC<PanelProps> = ({ data, visible: _visible }) => {
  const initialData: TopOptTipData = (data as unknown as TopOptTipData) ?? sampleTopOptTipData;

  const buttons: RingButtonConfig[] = initialData.buttons ?? sampleTopOptTipData.buttons;
  const [centerX, setCenterX] = useState(initialData.centerX ?? sampleTopOptTipData.centerX);
  const [centerY, setCenterY] = useState(initialData.centerY ?? sampleTopOptTipData.centerY);
  const radius = initialData.radius ?? sampleTopOptTipData.radius;
  const rotationOffset = initialData.rotationOffset ?? sampleTopOptTipData.rotationOffset;
  const startAngle = initialData.startAngle ?? sampleTopOptTipData.startAngle;
  const [isAnimating, setIsAnimating] = useState(true);

  usePanelLifecycle({
    onInit: () => console.log('[UITopOptTip] init'),
    onShow: () => setIsAnimating(true),
    onHide: () => console.log('[UITopOptTip] hide'),
    onDestroy: () => console.log('[UITopOptTip] destroy'),
  });

  // Follow target mock - update position
  useEffect(() => {
    const mockTarget: IFollowTarget = new MockFollowTarget(centerX, centerY);

    const interval = setInterval(() => {
      if (mockTarget.isValid()) {
        const pos = mockTarget.getScreenPosition();
        setCenterX(pos.x);
        setCenterY(pos.y);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [centerX, centerY]);

  // Animation entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleButtonClick = useCallback((btn: RingButtonConfig) => {
    if (!btn.enabled) return;
    btn.action();
  }, []);

  // Calculate positions for all buttons
  const positions = useMemo(
    () =>
      buttons.map((_, i) =>
        getRingPosition(i, buttons.length, radius, centerX, centerY, startAngle, rotationOffset)
      ),
    [buttons, radius, centerX, centerY, startAngle, rotationOffset]
  );

  return (
    <div
      className={`toptip-root ${isAnimating ? 'toptip-enter' : ''}`}
      style={{
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div className="toptip-container">
        {/* Center dot */}
        <div
          className="toptip-center"
          style={{
            left: centerX,
            top: centerY,
          }}
        />

        {/* Decorative lines */}
        {buttons.map((_, i) => {
          const pos = positions[i];
          const dx = pos.x - centerX;
          const dy = pos.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          return (
            <div
              key={`line-${i}`}
              className="toptip-line"
              style={{
                left: centerX,
                top: centerY,
                width: dist - 30,
                transform: `rotate(${angle}deg)`,
              }}
            />
          );
        })}

        {/* Ring buttons */}
        {buttons.map((btn, i) => (
          <button
            key={btn.id}
            className={`toptip-ring-btn ${!btn.enabled ? 'disabled' : ''}`}
            style={{
              left: positions[i].x,
              top: positions[i].y,
              animationDelay: `${i * 0.05}s`,
            }}
            onClick={() => handleButtonClick(btn)}
            disabled={!btn.enabled}
            title={btn.label}
          >
            {btn.icon && <span className="toptip-btn-icon">{btn.icon}</span>}
            <span className="toptip-btn-label">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UITopOptTip;
