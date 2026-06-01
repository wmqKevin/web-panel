/**
 * usePanelLifecycle Hook
 *
 * 面板生命周期管理 Hook，对标 Unity QFramework 的面板生命周期。
 *
 * 使用方式：
 * 在面板组件内部调用此 Hook，注册 init / show / hide / destroy 回调。
 *
 * @example
 * ```tsx
 * function MyPanel({ data, visible, onClose }: PanelProps) {
 *   usePanelLifecycle({
 *     onInit() {
 *       console.log('面板初始化');
 *     },
 *     onShow(data) {
 *       console.log('面板显示，数据：', data);
 *     },
 *     onHide() {
 *       console.log('面板隐藏');
 *     },
 *     onDestroy() {
 *       console.log('面板销毁');
 *     },
 *   });
 *
 *   return <div onClick={onClose}>My Panel</div>;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import type { IUIData, PanelLifecycleCallbacks } from '../types/panel';

/**
 * 面板生命周期管理 Hook
 *
 * 提供与 Unity QFramework UIMgr 一致的面板生命周期回调：
 * - onInit: 面板首次创建时调用（等同 Unity 的 OnInit）
 * - onShow: 面板每次显示时调用，接收最新的 IUIData（等同 Unity 的 OnShow）
 * - onHide: 面板隐藏时调用（等同 Unity 的 OnHide）
 * - onDestroy: 面板即将销毁时调用，用于清理资源（等同 Unity 的 OnDestroy）
 *
 * @param callbacks 生命周期回调对象
 */
export function usePanelLifecycle(callbacks: PanelLifecycleCallbacks): void {
  const { onInit, onShow, onHide, onDestroy } = callbacks;

  // 使用 ref 存储回调，避免闭包陷阱
  const callbacksRef = useRef({
    onInit,
    onShow,
    onHide,
    onDestroy,
  });

  // 每次渲染都更新 ref
  callbacksRef.current = {
    onInit,
    onShow,
    onHide,
    onDestroy,
  };

  // init 标记：只在首次挂载时触发
  const initializedRef = useRef(false);

  // init 生命周期
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      callbacksRef.current.onInit?.();
    }

    // destroy 生命周期（组件卸载时）
    return () => {
      callbacksRef.current.onDestroy?.();
    };
  }, []);
}

/**
 * 面板可见性监听 Hook
 *
 * 当面板的 visible 属性变化时，触发对应的 show/hide 回调。
 * 需要配合 usePanelLifecycle 一起使用，或单独使用。
 *
 * @param visible 当前可见状态
 * @param data 面板数据
 * @param onShow 显示回调
 * @param onHide 隐藏回调
 */
export function usePanelVisibility(
  visible: boolean,
  data: IUIData,
  onShow?: (data: IUIData) => void,
  onHide?: () => void,
): void {
  const prevVisibleRef = useRef(false);
  const onShowRef = useRef(onShow);
  const onHideRef = useRef(onHide);

  onShowRef.current = onShow;
  onHideRef.current = onHide;

  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      // 从不可见 → 可见：触发 show
      onShowRef.current?.(data);
    } else if (!visible && prevVisibleRef.current) {
      // 从可见 → 不可见：触发 hide
      onHideRef.current?.();
    }
    prevVisibleRef.current = visible;
  }, [visible, data]);
}

/**
 * 组合 Hook：完整的面板生命周期 + 可见性监听
 *
 * 这是最常用的面板 Hook，同时处理：
 * 1. init/destroy 生命周期
 * 2. show/hide 可见性变化
 * 3. 数据更新通知
 *
 * @param options 面板生命周期选项
 *
 * @example
 * ```tsx
 * function MyPanel({ visible, data, onClose }: PanelProps) {
 *   usePanel({
 *     visible,
 *     data,
 *     onInit() { /* 初始化 *\/ },
 *     onShow(d) { /* 显示，d 是最新数据 *\/ },
 *     onHide() { /* 隐藏 *\/ },
 *     onDestroy() { /* 清理资源 *\/ },
 *   });
 *
 *   if (!visible) return null;
 *   return <div onClick={onClose}>{data.message}</div>;
 * }
 * ```
 */
export function usePanel(options: {
  visible: boolean;
  data: IUIData;
  onInit?: () => void | (() => void);
  onShow?: (data: IUIData) => void;
  onHide?: () => void;
  onDestroy?: () => void;
}): void {
  const { visible, data, onInit, onShow, onHide, onDestroy } = options;

  // ref 存储最新回调
  const callbacksRef = useRef({ onInit, onShow, onHide, onDestroy });
  callbacksRef.current = { onInit, onShow, onHide, onDestroy };

  const initializedRef = useRef(false);
  const prevVisibleRef = useRef(false);

  // init + destroy
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      callbacksRef.current.onInit?.();
    }
    return () => {
      callbacksRef.current.onDestroy?.();
    };
  }, []);

  // show / hide
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      callbacksRef.current.onShow?.(data);
    } else if (!visible && prevVisibleRef.current) {
      callbacksRef.current.onHide?.();
    }
    prevVisibleRef.current = visible;
  }, [visible, data]);
}
