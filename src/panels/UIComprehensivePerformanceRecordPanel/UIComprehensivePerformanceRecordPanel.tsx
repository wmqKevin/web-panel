/**
 * UIComprehensivePerformanceRecordPanel - Comprehensive performance scoring panel
 * Unity counterpart: UIComprehensivePerformanceRecordPanel.cs (XCharts → ECharts)
 */

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { PanelProps } from '../../types/panel';
import { usePanelLifecycle } from '../../hooks/usePanelLifecycle';
import type { PerformanceData, ScoreDimension } from '../../data/performanceData';
import { samplePerformanceData } from '../../data/performanceData';
import './UIComprehensivePerformanceRecordPanel.css';

/** Calculate weighted total score */
function calculateTotalScore(dimensions: ScoreDimension[]): number {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const dim of dimensions) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/** Find grade level for a score */
function getGradeLevel(score: number, levels: PerformanceData['gradeLevels']) {
  for (const level of levels) {
    if (score >= level.minScore && score <= level.maxScore) {
      return level;
    }
  }
  return levels[levels.length - 1];
}

/** Get color for a score value */
function getScoreColor(score: number): string {
  if (score >= 90) return '#4caf50';
  if (score >= 80) return '#2196f3';
  if (score >= 70) return '#ff9800';
  if (score >= 60) return '#ff5722';
  return '#f44336';
}

const UIComprehensivePerformanceRecordPanel: React.FC<PanelProps> = ({ data, onClose }) => {
  const panelData = (data as unknown as PerformanceData) ?? samplePerformanceData;
  const dimensions = panelData.dimensions ?? samplePerformanceData.dimensions;
  const gradeLevels = panelData.gradeLevels ?? samplePerformanceData.gradeLevels;

  const totalScore = useMemo(
    () => panelData.totalScore ?? calculateTotalScore(dimensions),
    [panelData.totalScore, dimensions]
  );

  const grade = useMemo(() => getGradeLevel(totalScore, gradeLevels), [totalScore, gradeLevels]);

  usePanelLifecycle({
    onInit: () => console.log('[UIComprehensivePerformanceRecordPanel] init'),
    onShow: () => console.log('[UIComprehensivePerformanceRecordPanel] show'),
    onHide: () => console.log('[UIComprehensivePerformanceRecordPanel] hide'),
    onDestroy: () => console.log('[UIComprehensivePerformanceRecordPanel] destroy'),
  });

  // ECharts radar chart options
  const chartOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#fff' },
      },
      radar: {
        indicator: dimensions.map((d) => ({
          name: d.name,
          max: d.maxScore,
        })),
        shape: 'polygon' as const,
        splitNumber: 5,
        axisName: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.1)',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: [
              'rgba(79, 140, 255, 0.02)',
              'rgba(79, 140, 255, 0.04)',
              'rgba(79, 140, 255, 0.06)',
              'rgba(79, 140, 255, 0.08)',
              'rgba(79, 140, 255, 0.10)',
            ],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.15)',
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: dimensions.map((d) => d.score),
              name: panelData.studentName ?? '成绩',
              areaStyle: {
                color: 'rgba(79, 140, 255, 0.3)',
              },
              lineStyle: {
                color: '#4f8cff',
                width: 2,
              },
              itemStyle: {
                color: '#4f8cff',
              },
            },
          ],
        },
      ],
    }),
    [dimensions, panelData.studentName]
  );

  const handleSubmit = () => {
    console.log('[UIComprehensivePerformanceRecordPanel] Submit score:', totalScore);
    alert(`成绩已提交！总分：${totalScore}，等级：${grade.label}`);
  };

  return (
    <div className="perf-root" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="perf-panel">
        {/* Header */}
        <div className="perf-header">
          <h2>📊 综合成绩评定</h2>
          <button className="btn btn-secondary btn-sm" onClick={close}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="perf-body">
          {/* Radar chart */}
          <div className="perf-chart-section">
            <ReactECharts
              option={chartOption}
              className="perf-radar-chart"
              style={{ width: 340, height: 340 }}
            />
          </div>

          {/* Score details */}
          <div className="perf-score-section">
            {/* Total score */}
            <div className="perf-total-score">
              <span className="perf-total-number" style={{ color: getScoreColor(totalScore) }}>
                {totalScore}
              </span>
              <span className="perf-total-label">综合得分</span>
              <span
                className="perf-grade-badge"
                style={{ background: `${grade.color}30`, color: grade.color }}
              >
                {grade.icon} {grade.label}
              </span>
            </div>

            {/* Dimension scores */}
            {dimensions.map((dim) => (
              <div key={dim.name} className="perf-score-item">
                <span className="perf-score-name">{dim.name}</span>
                <div className="perf-score-bar-wrapper">
                  <div
                    className="perf-score-bar-fill"
                    style={{
                      width: `${(dim.score / dim.maxScore) * 100}%`,
                      background: getScoreColor(dim.score),
                    }}
                  />
                </div>
                <span className="perf-score-value" style={{ color: getScoreColor(dim.score) }}>
                  {dim.score}
                </span>
                <span className="perf-score-max">/{dim.maxScore}</span>
                <span className="perf-score-weight">×{dim.weight}</span>
                {dim.description && (
                  <span className="perf-score-desc" title={dim.description}>
                    ℹ
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="perf-footer">
          <button className="btn btn-secondary" onClick={close}>
            关闭
          </button>
          <button className="btn btn-success" onClick={handleSubmit}>
            提交成绩
          </button>
        </div>
      </div>
    </div>
  );
};

export default UIComprehensivePerformanceRecordPanel;
