/**
 * UIHistoryTakingPanel - Medical history taking Q&A data
 */

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  hint?: string;
}

export interface HistoryTakingData {
  categories: string[];
  items: QAItem[];
}

export const sampleHistoryData: HistoryTakingData = {
  categories: ['全部', '主诉', '现病史', '既往史', '过敏史', '家族史'],
  items: [
    {
      id: 'qa_1',
      question: '患者的主要症状是什么？',
      answer: '患者主诉发热3天，体温最高39.2°C，伴咳嗽、咳痰。',
      category: '主诉',
      hint: '询问主要症状及持续时间',
    },
    {
      id: 'qa_2',
      question: '症状何时开始的？',
      answer: '3天前无明显诱因出现发热，伴有寒战。',
      category: '主诉',
      hint: '确定发病时间',
    },
    {
      id: 'qa_3',
      question: '发热的规律是怎样的？',
      answer: '持续性发热，午后体温较高，夜间略有下降。',
      category: '现病史',
      hint: '询问热型',
    },
    {
      id: 'qa_4',
      question: '有无伴随症状？',
      answer: '伴有咳嗽、咳黄色脓痰，偶有胸闷。',
      category: '现病史',
      hint: '系统询问伴随症状',
    },
    {
      id: 'qa_5',
      question: '既往有什么疾病？',
      answer: '2年前诊断2型糖尿病，口服降糖药治疗。',
      category: '既往史',
      hint: '询问既往重要疾病',
    },
    {
      id: 'qa_6',
      question: '有无手术史？',
      answer: '否认手术史。',
      category: '既往史',
      hint: '询问手术史',
    },
    {
      id: 'qa_7',
      question: '有无药物过敏？',
      answer: '对青霉素过敏，表现为皮疹。',
      category: '过敏史',
      hint: '仔细询问药物过敏史',
    },
    {
      id: 'qa_8',
      question: '有无食物过敏？',
      answer: '否认食物过敏。',
      category: '过敏史',
      hint: '询问食物过敏',
    },
    {
      id: 'qa_9',
      question: '家族中有无类似疾病？',
      answer: '父亲有糖尿病史，母亲体健。',
      category: '家族史',
      hint: '询问一级亲属病史',
    },
    {
      id: 'qa_10',
      question: '家族中有无遗传性疾病？',
      answer: '否认家族遗传性疾病。',
      category: '家族史',
      hint: '询问遗传病史',
    },
  ],
};
