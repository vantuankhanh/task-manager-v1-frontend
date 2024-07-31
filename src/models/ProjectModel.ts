export interface IProjectModel {
  id?: string;
  name: string;
  payment: number;
  note: string;
  priority: number;
  time_start: string;
  time_end: string;
}

export interface IprojectInfo {
  label: string;
  IProjectModel: IProjectModel[];
}
