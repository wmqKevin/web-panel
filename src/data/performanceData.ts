/**
 * UIComprehensivePerformanceRecordPanel - Performance scoring data
 */

export interface ScoreDimension {
  name: string;
  maxScore: number;
  score: number;
  weight: number;
  description?: string;
}

export interface PerformanceData {
  dimensions: ScoreDimension[];
  gradeLevels: GradeLevel[];
  studentName?: string;
  totalScore?: number;
}

export interface GradeLevel {
  minScore: number;
  maxScore: number;
  label: string;
  color: string;
  icon: string;
}

export const samplePerformanceData: PerformanceData = {
  studentName: '张三',
  dimensions: [
    { name: '操作规范', maxScore: 100, score: 85, weight: 0.25, description: '操作步骤的规范性评估' },
    { name: '无菌意识', maxScore: 100, score: 78, weight: 0.20, description: '无菌操作意识评估' },
    { name: '沟通能力', maxScore: 100, score: 92, weight: 0.15, description: '与患者沟通能力评估' },
    { name: '应急处理', maxScore: 100, score: 70, weight: 0.20, description: '突发事件应急处理能力' },
    { name: '专业知识', maxScore: 100, score: 88, weight: 0.20, description: '相关专业知识掌握程度' },
  ],
  gradeLevels: [
    { minScore: 90, maxScore: 100, label: '优秀', color: '#4caf50', icon: '⭐' },
    { minScore: 80, maxScore: 89, label: '良好', color: '#2196f3', icon: '👍' },
    { minScore: 70, maxScore: 79, label: '中等', color: '#ff9800', icon: '📋' },
    { minScore: 60, maxScore: 69, label: '及格', color: '#ff5722', icon: '📝' },
    { minScore: 0, maxScore: 59, label: '不及格', color: '#f44336', icon: '⚠️' },
  ],
};
