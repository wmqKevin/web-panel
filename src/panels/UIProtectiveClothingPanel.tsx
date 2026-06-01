import { useState, useCallback } from 'react';
import { PanelManager } from '../core/PanelManager';
import { usePanelLifecycle } from '../hooks/usePanelLifecycle';
import type { PanelProps, IUIData } from '../types/panel';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
}

interface ClothingData extends IUIData {
  items?: ClothingItem[];
  correctOrder?: string[];
  onSubmit?: (selectedIds: string[]) => void;
  onNext?: () => void;
}

const DEFAULT_ITEMS: ClothingItem[] = [
  { id: 'mask', name: '医用防护口罩', category: '呼吸防护' },
  { id: 'cap', name: '一次性工作帽', category: '头部防护' },
  { id: 'goggles', name: '护目镜/防护面屏', category: '眼部防护' },
  { id: 'gloves1', name: '内层手套', category: '手部防护' },
  { id: 'gown', name: '防护服', category: '躯体防护' },
  { id: 'boots', name: '鞋套/靴套', category: '足部防护' },
  { id: 'gloves2', name: '外层手套', category: '手部防护' },
];

const DEFAULT_CORRECT_ORDER = ['cap', 'mask', 'goggles', 'gown', 'gloves1', 'boots', 'gloves2'];

export default function UIProtectiveClothingPanel({ data }: PanelProps) {
  const clothingData = data as ClothingData | undefined;
  const items = clothingData?.items ?? DEFAULT_ITEMS;
  const correctOrder = clothingData?.correctOrder ?? DEFAULT_CORRECT_ORDER;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  usePanelLifecycle({
    onInit: () => {
      console.log('[UIProtectiveClothingPanel] initialized');
    },
  });

  const toggleItem = useCallback((id: string) => {
    if (submitted) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  }, [submitted]);

  const handleReset = useCallback(() => {
    setSelectedIds([]);
    setSubmitted(false);
    setShowAnswer(false);
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    clothingData?.onSubmit?.(selectedIds);
  }, [selectedIds, clothingData]);

  const handleNext = useCallback(() => {
    clothingData?.onNext?.();
    PanelManager.closePanel('UIProtectiveClothingPanel');
  }, [clothingData]);

  const handleShowAnswer = useCallback(() => {
    setShowAnswer((s) => !s);
  }, []);

  // 选中项按选择顺序编号，但按正确顺序展示时重新排序
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const numberedItems = selectedItems.map((item) => ({
    ...item,
    orderNumber: selectedIds.indexOf(item.id) + 1,
  }));

  const isCorrect =
    submitted && selectedIds.length === correctOrder.length &&
    selectedIds.every((id, idx) => id === correctOrder[idx]);

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2 style={titleStyle}>防护用品穿脱</h2>

        {/* Toggle 选择区 */}
        <div style={toggleGridStyle}>
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                style={{
                  ...toggleItemStyle,
                  backgroundColor: isSelected ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                  borderColor: isSelected ? '#e94560' : 'rgba(255,255,255,0.1)',
                }}
              >
                <input
                  type="checkbox"
                  style={{ display: 'none' }}
                  checked={isSelected}
                  onChange={() => toggleItem(item.id)}
                />
                <span style={toggleCheckStyle}>{isSelected ? '✓' : ''}</span>
                <div style={toggleInfoStyle}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.category}</div>
                </div>
              </label>
            );
          })}
        </div>

        {/* 已选列表 */}
        {numberedItems.length > 0 && (
          <div style={selectedListStyle}>
            <div style={selectedListHeaderStyle}>已选顺序：</div>
            <div style={selectedItemsStyle}>
              {numberedItems.map((item) => (
                <div key={item.id} style={selectedItemStyle}>
                  <span style={orderBadgeStyle}>{item.orderNumber}</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 提交结果 */}
        {submitted && (
          <div
            style={{
              ...resultBannerStyle,
              backgroundColor: isCorrect ? 'rgba(92,184,92,0.15)' : 'rgba(217,83,79,0.15)',
              color: isCorrect ? '#5cb85c' : '#d9534f',
            }}
          >
            {isCorrect ? '✓ 穿脱顺序正确！' : '✗ 穿脱顺序有误，请查看正确答案。'}
          </div>
        )}

        {/* 正确答案展示 */}
        {showAnswer && (
          <div style={answerBoxStyle}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#e94560' }}>正确答案顺序：</div>
            <ol style={{ paddingLeft: 20, fontSize: 13, color: '#ccc' }}>
              {correctOrder.map((id) => {
                const item = items.find((i) => i.id === id);
                return <li key={id}>{item?.name ?? id}</li>;
              })}
            </ol>
          </div>
        )}

        {/* 底部按钮 */}
        <div style={footerStyle}>
          <button style={secondaryBtnStyle} onClick={handleReset}>重置</button>
          <button style={secondaryBtnStyle} onClick={handleShowAnswer}>
            {showAnswer ? '隐藏答案' : '查看答案'}
          </button>
          {!submitted ? (
            <button
              style={{
                ...primaryBtnStyle,
                opacity: selectedIds.length > 0 ? 1 : 0.5,
              }}
              onClick={handleSubmit}
              disabled={selectedIds.length === 0}
            >
              提交
            </button>
          ) : (
            <button style={primaryBtnStyle} onClick={handleNext}>下一步</button>
          )}
        </div>
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
  backgroundColor: 'rgba(0,0,0,0.5)',
};

const panelStyle: React.CSSProperties = {
  width: 480,
  maxHeight: '85vh',
  overflowY: 'auto',
  padding: '28px 32px',
  backgroundColor: '#16213e',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  textAlign: 'center',
  color: '#e94560',
};

const toggleGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const toggleItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const toggleCheckStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 4,
  backgroundColor: 'rgba(255,255,255,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  color: '#e94560',
  fontWeight: 700,
  flexShrink: 0,
};

const toggleInfoStyle: React.CSSProperties = {
  flex: 1,
};

const selectedListStyle: React.CSSProperties = {
  padding: '12px 14px',
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderRadius: 8,
};

const selectedListHeaderStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#aaa',
  marginBottom: 8,
};

const selectedItemsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const selectedItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  color: '#ddd',
};

const orderBadgeStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#e94560',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const resultBannerStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  textAlign: 'center',
};

const answerBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  backgroundColor: 'rgba(233,69,96,0.08)',
  borderRadius: 8,
  border: '1px solid rgba(233,69,96,0.2)',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  justifyContent: 'flex-end',
  marginTop: 4,
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 22px',
  borderRadius: 8,
  backgroundColor: '#e94560',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  transition: 'opacity 0.2s',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: '#ccc',
  fontSize: 14,
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.2s',
};
