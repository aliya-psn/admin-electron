export interface ListItem {
  avatar?: string;
  title: string;
  datetime?: string;
  description?: string;
  status?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  extra?: string;
}

export const notifyData: ListItem[] = [
  {
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
    title: '系统发布了',
    datetime: '现在',
    description: '系统发布了'
  }
];

export const messageData: ListItem[] = [
  {
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
    title: '系统发布了',
    description: '系统发布了',
    datetime: '现在'
  }
];

export const todoData: ListItem[] = [
  {
    title: '任务名称',
    description: '这家伙很懒，什么都没留下',
    extra: '未开始',
    status: 'info'
  },
  {
    title: '任务名称',
    description: '这家伙很懒，什么都没留下',
    extra: '进行中',
    status: 'primary'
  },
  {
    title: '任务名称',
    description: '这家伙很懒，什么都没留下',
    extra: '已超时',
    status: 'danger'
  }
];
