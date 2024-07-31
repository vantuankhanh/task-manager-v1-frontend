export interface IUserModel {
  id?: string;
  email: string;
  name: string;
  role?: number;
  password?: string;
}

export interface IUserInfo {
  label: string;
  IUserData: IUserModel[];
}
