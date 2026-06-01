import { useState, useRef, useCallback } from 'react';
import { PanelManager } from '../core/PanelManager';
import { usePanelLifecycle } from '../hooks/usePanelLifecycle';
import type { PanelProps, IUIData } from '../types/panel';

interface DialogueItem {
  text: string;
  audioUrl?: string | null;
  speaker?: string;
}

interface SubtitleData extends IUIData {
  dialogues?: DialogueItem[];
  onComplete?: () => void;
  typingSpeed?: number;
}

export default function UISubtitlePanel({ data }: PanelProps) {
  const subtitleData = data as SubtitleData | undefined;
  const dialogues = subtitleData?.dialogues ?? [];
  const typingSpeed = subtitleData?.typingSpeed ?? 50;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTextRef = useRef('');
  const charIndexRef = useRef(0);

  usePanelLifecycle({
    onInit: () => {
      console.log('[UISubtitlePanel] initialized');
    },
    onShow: () => {
      if (dialogues.length > 0) {
        startTyping(0);
      }
    },
    onDestroy: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      audioRef.current?.pause();
    },
  });

  const playAudio = useCallback((url?: string | null) => {
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  const startTyping = useCallback(
    (index: number) => {
      if (index >= dialogues.length) {
        setIsComplete(true);
        setIsTyping(false);
        subtitleData?.onComplete?.();
        return;
      }

      setCurrentIndex(index);
      setDisplayText('');
      setIsTyping(true);
      currentTextRef.current = dialogues[index].text;
      charIndexRef.current = 0;

      playAudio(dialogues[index].audioUrl);

      const typeNext = () => {
        if (charIndexRef.current < currentTextRef.current.length) {
          charIndexRef.current += 1;
          setDisplayText(currentTextRef.current.slice(0, charIndexRef.current));
          timerRef.current = setTimeout(typeNext, typingSpeed);
        } else {
          setIsTyping(false);
          timerRef.current = setTimeout(() => {
            startTyping(index + 1);
          }, 1200);
        }
      };

      timerRef.current = setTimeout(typeNext, typingSpeed);
    },
    [dialogues, typingSpeed, subtitleData, playAudio]
  );

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSkipped(true);
    setIsTyping(false);
    setDisplayText(currentTextRef.current);

    // 快速播放到最后一条
    timerRef.current = setTimeout(() => {
      setIsComplete(true);
      subtitleData?.onComplete?.();
    }, 600);
  }, [subtitleData]);

  const handleShowAll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSkipped(true);
    setIsTyping(false);
    setDisplayText(currentTextRef.current);
    audioRef.current?.pause();
  }, []);

  const handleClose = useCallback(() => {
    PanelManager.closePanel('UISubtitlePanel');
  }, []);

  const currentDialogue = dialogues[currentIndex];

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        {/* 说话人 */}
        {currentDialogue?.speaker && (
          <div style={speakerStyle}>{currentDialogue.speaker}</div>
        )}

        {/* 文本显示区 */}
        <div style={textAreaStyle}>
          <span>{displayText}</span>
          {isTyping && <span style={cursorStyle}>|</span>}
        </div>

        {/* 进度指示 */}
        <div style={progressStyle}>
          {dialogues.map((_, i) => (
            <div
              key={i}
              style={{
                ...dotStyle,
                backgroundColor: i <= currentIndex ? '#e94560' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        {/* 控制按钮 */}
        <div style={controlsStyle}>
          {!isComplete && (
            <>
              <button style={controlBtnStyle} onClick={handleShowAll} disabled={!isTyping}>
                显示全部
              </button>
              <button style={controlBtnStyle} onClick={handleSkip}>
                {isSkipped ? '下一条' : '跳过'}
              </button>
            </>
          )}
          {isComplete && (
            <button style={{ ...controlBtnStyle, backgroundColor: '#e94560' }} onClick={handleClose}>
              关闭
            </button>
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
  alignItems: 'flex-end',
  justifyContent: 'center',
  paddingBottom: 40,
  pointerEvents: 'none',
};

const panelStyle: React.CSSProperties = {
  width: 720,
  maxWidth: '90%',
  padding: '24px 28px',
  backgroundColor: 'rgba(22,33,62,0.95)',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  pointerEvents: 'auto',
};

const speakerStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#e94560',
  marginBottom: 8,
};

const textAreaStyle: React.CSSProperties = {
  minHeight: 60,
  fontSize: 16,
  lineHeight: 1.7,
  color: '#eee',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const cursorStyle: React.CSSProperties = {
  color: '#e94560',
  animation: 'blink 1s step-end infinite',
};

const progressStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  marginTop: 14,
  justifyContent: 'center',
};

const dotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  transition: 'background-color 0.3s',
};

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 16,
  justifyContent: 'flex-end',
};

const controlBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  borderRadius: 6,
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#ddd',
  fontSize: 13,
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.2s',
};
