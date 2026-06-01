import React, { useState, useCallback } from 'react';
import type { PanelProps } from '../../types';
import { usePanelLifecycle } from '../../core/usePanelLifecycle';
import type { TaskItem, TaskMenuData } from '../../data/taskMenuData';
import { sampleTaskMenuData } from '../../data/taskMenuData';
import './TaskMenu.css';

const StatusIcon: Record<string, string> = {
  completed: '✓',
  in_progress: '●',
  incomplete: '○',
};

const TaskMenuPanel: React.FC<PanelProps> = ({ data, close }) => {
  const panelData = (data as unknown as TaskMenuData) ?? sampleTaskMenuData;
  const [mode, setMode] = useState<'dot' | 'panel'>(panelData.mode ?? 'panel');
  const [tasks, setTasks] = useState<TaskItem[]>(panelData.tasks ?? sampleTaskMenuData.tasks);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  usePanelLifecycle({
    onInit: () => console.log('[TaskMenu] init'),
    onShow: () => console.log('[TaskMenu] show'),
    onHide: () => console.log('[TaskMenu] hide'),
    onDestroy: () => console.log('[TaskMenu] destroy'),
  });

  const toggleExpand = useCallback((taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const cycleStatus = useCallback((status: TaskItem['status']): TaskItem['status'] => {
    if (status === 'incomplete') return 'in_progress';
    if (status === 'in_progress') return 'completed';
    return 'incomplete';
  }, []);

  const handleTaskClick = useCallback(
    (task: TaskItem) => {
      if (!task.canJump) return;
      panelData.onTaskClick?.(task.id);

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === task.id) {
            return { ...t, status: cycleStatus(task.status) };
          }
          return t;
        })
      );
    },
    [panelData, cycleStatus]
  );

  const handleSubTaskClick = useCallback(
    (task: TaskItem, parentTask: TaskItem) => {
      if (!task.canJump) return;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === parentTask.id) {
            return {
              ...t,
              children: t.children?.map((c) => {
                if (c.id === task.id) {
                  return { ...c, status: cycleStatus(c.status) };
                }
                return c;
              }),
            };
          }
          return t;
        })
      );
    },
    [cycleStatus]
  );

  const renderDotMode = () => (
    <div className="taskmenu-dot-mode">
      {tasks.map((task, index) => (
        <React.Fragment key={task.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className={`dot-item ${task.status}`}
              onClick={() => task.canJump && handleTaskClick(task)}
              title={task.title}
            />
            <span className="dot-label">{task.title}</span>
          </div>
          {index < tasks.length - 1 && (
            <div className={`dot-connector ${task.status === 'completed' ? 'completed' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderPanelMode = () => (
    <div className="taskmenu-body custom-scrollbar">
      {tasks.map((task) => {
        const hasChildren = task.children && task.children.length > 0;
        const isExpanded = expandedIds.has(task.id);
        const isDisabled = !task.canJump;

        return (
          <div key={task.id} className="task-item">
            <div
              className={`task-main ${isDisabled ? 'disabled' : ''}`}
              onClick={() => handleTaskClick(task)}
            >
              <span className={`task-status ${task.status}`}>
                {StatusIcon[task.status] || '○'}
              </span>
              <div className="task-info">
                <div className="task-title">{task.title}</div>
                {task.description && <div className="task-desc">{task.description}</div>}
              </div>
              {hasChildren && (
                <button
                  className={`task-expand-btn ${isExpanded ? 'expanded' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(task.id);
                  }}
                >
                  ▼
                </button>
              )}
            </div>
            {hasChildren && (
              <div className={`task-children ${isExpanded ? 'expanded' : ''}`}>
                {task.children!.map((child) => (
                  <div
                    key={child.id}
                    className={`subtask-item ${!child.canJump ? 'disabled' : ''}`}
                    onClick={() => child.canJump && handleSubTaskClick(child, task)}
                  >
                    <span
                      className="subtask-dot"
                      style={{
                        background:
                          child.status === 'completed'
                            ? '#4caf50'
                            : child.status === 'in_progress'
                            ? '#ff9800'
                            : 'rgba(255,255,255,0.3)',
                      }}
                    />
                    <span>{child.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="taskmenu-root" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="taskmenu-panel">
        <div className="taskmenu-header">
          <h2>📋 任务菜单</h2>
          <div className="taskmenu-mode-toggle">
            <button
              className={`taskmenu-mode-btn ${mode === 'dot' ? 'active' : ''}`}
              onClick={() => setMode('dot')}
            >
              点式
            </button>
            <button
              className={`taskmenu-mode-btn ${mode === 'panel' ? 'active' : ''}`}
              onClick={() => setMode('panel')}
            >
              面板式
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={close}>
            ✕
          </button>
        </div>
        {mode === 'dot' ? renderDotMode() : renderPanelMode()}
      </div>
    </div>
  );
};

export default TaskMenuPanel;
