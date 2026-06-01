/**
 * UIHistoryTakingPanel - Medical history taking Q&A panel
 * Unity counterpart: UIHistoryTakingPanel.cs
 */

import React, { useState, useCallback, useRef } from 'react';
import type { PanelProps } from '../../types';
import { usePanelLifecycle } from '../../core/usePanelLifecycle';
import type { HistoryTakingData } from '../../data/historyData';
import { sampleHistoryData } from '../../data/historyData';
import './UIHistoryTakingPanel.css';

const UIHistoryTakingPanel: React.FC<PanelProps> = ({ data, close }) => {
  const panelData = (data as unknown as HistoryTakingData) ?? sampleHistoryData;
  const categories = panelData.categories ?? sampleHistoryData.categories;
  const items = panelData.items ?? sampleHistoryData.items;

  const [activeCategory, setActiveCategory] = useState('全部');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [tabState, setTabState] = useState<Record<string, 'answer' | 'hint'>>({});
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  usePanelLifecycle({
    onInit: () => console.log('[UIHistoryTakingPanel] init'),
    onShow: () => console.log('[UIHistoryTakingPanel] show'),
    onHide: () => console.log('[UIHistoryTakingPanel] hide'),
    onDestroy: () => {
      if (recognitionRef.current) {
        clearTimeout(recognitionRef.current);
      }
    },
  });

  const filteredItems =
    activeCategory === '全部' ? items : items.filter((i) => i.category === activeCategory);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getTab = useCallback(
    (id: string) => tabState[id] ?? 'answer',
    [tabState]
  );

  const setTab = useCallback((id: string, tab: 'answer' | 'hint') => {
    setTabState((prev) => ({ ...prev, [id]: tab }));
  }, []);

  /** Mock voice recognition using Web Speech API or fallback */
  const toggleVoice = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) clearTimeout(recognitionRef.current);
      setIsListening(false);
      return;
    }

    // Try Web Speech API
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>)['SpeechRecognition'] ??
      (window as unknown as Record<string, unknown>)['webkitSpeechRecognition'];

    if (SpeechRecognition) {
      const recognition = new (SpeechRecognition as new () => { lang: string; continuous: boolean; interimResults: boolean; onresult: (e: unknown) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void })();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: unknown) => {
        console.log('[VoiceRecognition]', event);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
      setIsListening(true);
    } else {
      // Mock: simulate listening for 2 seconds
      setIsListening(true);
      recognitionRef.current = setTimeout(() => {
        console.log('[VoiceRecognition] Mock: "患者发热三天"');
        setIsListening(false);
        recognitionRef.current = null;
      }, 2000);
    }
  }, [isListening]);

  return (
    <div className="history-root" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="history-panel">
        {/* Header */}
        <div className="history-header">
          <h2>🏥 问诊面板</h2>
          <button className="btn btn-secondary btn-sm" onClick={close}>
            ✕
          </button>
        </div>

        {/* Category filter */}
        <div className="history-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`history-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Voice toolbar */}
        <div className="history-toolbar">
          <button
            className={`history-voice-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleVoice}
          >
            {isListening ? '🔴 正在聆听...' : '🎤 语音输入'}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            {filteredItems.length} 个问题
          </span>
        </div>

        {/* QA List */}
        <div className="history-body custom-scrollbar">
          {filteredItems.map((item) => {
            const isOpen = expandedIds.has(item.id);
            const currentTab = getTab(item.id);

            return (
              <div key={item.id} className="history-qa-item">
                <div
                  className="history-qa-question"
                  onClick={() => toggleExpand(item.id)}
                >
                  <span>{item.question}</span>
                  <span className="history-qa-category">{item.category}</span>
                </div>
                <div className={`history-qa-answer-panel ${isOpen ? 'open' : ''}`}>
                  <div className="history-qa-tabs">
                    <button
                      className={`history-qa-tab ${currentTab === 'answer' ? 'active' : ''}`}
                      onClick={() => setTab(item.id, 'answer')}
                    >
                      答案
                    </button>
                    <button
                      className={`history-qa-tab ${currentTab === 'hint' ? 'active' : ''}`}
                      onClick={() => setTab(item.id, 'hint')}
                    >
                      提示
                    </button>
                  </div>
                  {currentTab === 'answer' ? (
                    <div className="history-qa-text">{item.answer}</div>
                  ) : (
                    <div className="history-qa-hint">
                      💡 {item.hint ?? '暂无提示'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UIHistoryTakingPanel;
