import secureLocalStorage from "react-secure-storage";
import { IUserModel } from "../models/UserModel";

export const getRole = () => {
  const data = secureLocalStorage.getItem("data") as IUserModel;

  return data.role;
};
