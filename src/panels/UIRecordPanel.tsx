import { PanelProps, IUIData } from '../types';
import { usePanelLifecycle } from '../core/usePanelLifecycle';

/** Extensible data interface for UIRecordPanel */
export interface RecordPanelData extends IUIData {
  title?: string;
  onRefresh?: () => void;
  onExport?: () => void;
}

/**
 * UIRecordPanel - Record panel (shell with extension hooks)
 *
 * Currently a placeholder structure with预留 interfaces for future expansion:
 * - Record list display
 * - Search/filter
 * - Pagination
 * - Export functionality
 */
export default function UIRecordPanel({ data, visible, close }: PanelProps) {
  const panelData = (data ?? {}) as RecordPanelData;
  const title = panelData.title ?? '操作记录';

  usePanelLifecycle(
    {
      onInit: () => {
        // Extension hook: initialize record data source
      },
      onShow: () => {
        // Extension hook: refresh record list when shown
        panelData.onRefresh?.();
      },
      onHide: () => {
        // Extension hook: cleanup when hidden
      },
      onDestroy: () => {
        // Extension hook: release resources
      },
    },
    data,
    visible
  );

  return (
    <div className="panel-root" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="panel-content record-panel"
        style={{
          width: 640,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          animation: visible ? 'tip-scale-in 0.25s ease' : 'none',
        }}
      >
        <div
          className="record-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, color: '#fff' }}>{title}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => panelData.onRefresh?.()}
            >
              刷新
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => panelData.onExport?.()}
            >
              导出
            </button>
            <button className="btn btn-sm btn-secondary" onClick={close}>
              关闭
            </button>
          </div>
        </div>

        <div
          className="record-body"
          style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 200,
          }}
        >
          <div
            className="record-empty"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <div style={{ fontSize: 14 }}>暂无记录数据</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>预留扩展接口，后续接入数据源</div>
          </div>
        </div>

        <div
          className="record-footer"
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
          }}
        >
          UIRecordPanel - 扩展接口预留区域
        </div>
      </div>
    </div>
  );
}
