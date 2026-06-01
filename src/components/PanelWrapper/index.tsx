/**
 * PanelWrapper 组件
 *
 * 面板包装器，负责：
 * 1. 面板动画（fade/slide/none）
 * 2. 调用面板生命周期
 * 3. 提供面板关闭回调
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { PanelInstance } from '../../types/panel';
import type { PanelManager } from '../../core/PanelManager';

interface PanelWrapperProps {
  instance: PanelInstance;
  manager: PanelManager;
}

/**
 * 面板包装器组件
 * 每个活跃面板都会被此组件包裹
 */
export function PanelWrapper({ instance, manager }: PanelWrapperProps) {
  const {
    id,
    name,
    data,
    visible,
    closing,
    registration,
    animation,
    followTarget,
  } = instance;

  const PanelComponent = registration.component;
  const [animating, setAnimating] = useState(false);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});
  const mountedRef = useRef(false);

  // 关闭回调
  const handleClose = useCallback(() => {
    manager.closePanel(name);
  }, [manager, name]);

  // 确认关闭（动画完成后调用）
  const confirmClose = useCallback(() => {
    manager.confirmClose(id);
  }, [manager, id]);

  // 打开动画
  useEffect(() => {
    if (!mountedRef.current && visible && animation.type !== 'none') {
      mountedRef.current = true;
      setAnimating(true);

      // 设置动画初始状态
      const initialStyle = getInitialAnimationStyle(animation);
      setAnimationStyle(initialStyle);

      // 下一帧触发动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationStyle(getFinalAnimationStyle(animation));
        });
      });

      // 动画结束后清除 animating 状态
      const duration = animation.duration ?? 300;
      const timer = setTimeout(() => {
        setAnimating(false);
        setAnimationStyle({});
      }, duration + 50);

      return () => clearTimeout(timer);
    } else {
      mountedRef.current = true;
    }
  }, []); // 只在挂载时执行

  // 关闭动画
  useEffect(() => {
    if (closing && animation.type !== 'none') {
      setAnimating(true);
      const exitStyle = getExitAnimationStyle(animation);
      setAnimationStyle(exitStyle);

      const duration = animation.duration ?? 300;
      const timer = setTimeout(() => {
        setAnimating(false);
        confirmClose();
      }, duration + 50);

      return () => clearTimeout(timer);
    } else if (closing) {
      confirmClose();
    }
  }, [closing, animation, confirmClose]);

  // 面板容器样式
  const containerStyle = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
      transition: animating
        ? `all ${animation.duration ?? 300}ms ${animation.easing ?? 'ease-out'}`
        : undefined,
      ...animationStyle,
    }),
    [animating, animation, animationStyle],
  );

  return (
    <div
      className={`panel-wrapper panel-wrapper--${name} ${closing ? 'panel-wrapper--closing' : ''}`}
      style={containerStyle}
      data-panel-name={name}
      data-panel-id={id}
    >
      <PanelComponent
        panelName={name}
        data={data}
        visible={visible && !closing}
        onClose={handleClose}
        followTarget={followTarget}
      />
    </div>
  );
}

// ============================================================================
// 动画样式计算
// ============================================================================

function getInitialAnimationStyle(
  animation: { type: string; direction?: string },
): React.CSSProperties {
  switch (animation.type) {
    case 'fade':
      return { opacity: 0 };
    case 'slide':
      switch (animation.direction ?? 'bottom') {
        case 'bottom':
          return { transform: 'translateY(100%)', opacity: 0 };
        case 'top':
          return { transform: 'translateY(-100%)', opacity: 0 };
        case 'left':
          return { transform: 'translateX(-100%)', opacity: 0 };
        case 'right':
          return { transform: 'translateX(100%)', opacity: 0 };
        default:
          return { transform: 'translateY(100%)', opacity: 0 };
      }
    default:
      return {};
  }
}

function getFinalAnimationStyle(animation: { type: string }): React.CSSProperties {
  switch (animation.type) {
    case 'fade':
      return { opacity: 1 };
    case 'slide':
      return { transform: 'translate(0, 0)', opacity: 1 };
    default:
      return {};
  }
}

function getExitAnimationStyle(
  animation: { type: string; direction?: string },
): React.CSSProperties {
  switch (animation.type) {
    case 'fade':
      return { opacity: 0 };
    case 'slide':
      switch (animation.direction ?? 'bottom') {
        case 'bottom':
          return { transform: 'translateY(100%)', opacity: 0 };
        case 'top':
          return { transform: 'translateY(-100%)', opacity: 0 };
        case 'left':
          return { transform: 'translateX(-100%)', opacity: 0 };
        case 'right':
          return { transform: 'translateX(100%)', opacity: 0 };
        default:
          return { transform: 'translateY(100%)', opacity: 0 };
      }
    default:
      return {};
  }
}
