export interface ITaskModel {
  id?: string;
  user_mail: string;
  project_id: string;
  time_start: string;
  time_end: string;
  status: number;
  note: string;
}

export interface ITaskInfo {
  label: string;
  taskList: ITaskModel[];
}
