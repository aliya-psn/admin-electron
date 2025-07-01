export interface ProjectModel {
  id: string;
  projectName: string;
  projectDesc: string;
  projectMember: string;
  projectMemberArr?: Array<number>;
  isDeleted?: number;
  createUser?: string;
  updateUser?: string;
  createTime?: string;
  updateTime?: string;
  appType?: number;
}

export interface ProjectSelectModel {
  id: string;
  name: string;
  appType?: number;
}

export interface ProjectData {
  data: {
    projectList: Array<ProjectModel>;
    totalNum: number;
  };
}

export interface ProjectParams {
  pageNum: number;
  pageSize: number;
  user: string;
  projectName: string;
}
