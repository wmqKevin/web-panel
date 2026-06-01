/**
 * TaskMenu - JSON data driven task tree
 */

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'incomplete' | 'in_progress' | 'completed';
  canJump: boolean;
  children?: TaskItem[];
}

export interface TaskMenuData {
  mode: 'dot' | 'panel';
  tasks: TaskItem[];
  onTaskClick?: (taskId: string) => void;
  onComplete?: () => void;
}

export const sampleTaskMenuData: TaskMenuData = {
  mode: 'panel',
  tasks: [
    {
      id: 'task_1',
      title: '手卫生准备',
      description: '按照七步洗手法进行手部清洁',
      status: 'completed',
      canJump: true,
      children: [
        { id: 'task_1_1', title: '湿润双手', status: 'completed', canJump: true },
        { id: 'task_1_2', title: '涂抹洗手液', status: 'completed', canJump: true },
        { id: 'task_1_3', title: '揉搓双手', status: 'completed', canJump: true },
        { id: 'task_1_4', title: '冲洗干净', status: 'completed', canJump: true },
      ],
    },
    {
      id: 'task_2',
      title: '戴防护用品',
      description: '按顺序穿戴防护用品',
      status: 'in_progress',
      canJump: true,
      children: [
        { id: 'task_2_1', title: '戴帽子', status: 'completed', canJump: true },
        { id: 'task_2_2', title: '戴口罩', status: 'in_progress', canJump: true },
        { id: 'task_2_3', title: '穿防护服', status: 'incomplete', canJump: true },
        { id: 'task_2_4', title: '戴手套', status: 'incomplete', canJump: true },
      ],
    },
    {
      id: 'task_3',
      title: '进入隔离病房',
      description: '按规范流程进入隔离病房',
      status: 'incomplete',
      canJump: false,
      children: [
        { id: 'task_3_1', title: '检查防护用品', status: 'incomplete', canJump: false },
        { id: 'task_3_2', title: '通过缓冲区', status: 'incomplete', canJump: false },
        { id: 'task_3_3', title: '进入病房', status: 'incomplete', canJump: false },
      ],
    },
    {
      id: 'task_4',
      title: '执行护理操作',
      description: '完成患者的护理操作',
      status: 'incomplete',
      canJump: false,
      children: [
        { id: 'task_4_1', title: '核对患者信息', status: 'incomplete', canJump: false },
        { id: 'task_4_2', title: '测量生命体征', status: 'incomplete', canJump: false },
        { id: 'task_4_3', title: '执行医嘱', status: 'incomplete', canJump: false },
      ],
    },
    {
      id: 'task_5',
      title: '脱防护用品',
      description: '按规范流程脱卸防护用品',
      status: 'incomplete',
      canJump: false,
    },
  ],
};
