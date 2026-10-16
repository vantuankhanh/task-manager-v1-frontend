import { IUserModel } from "../models/UserModel";
import { getAPI, putAPI } from "./apiFunction";

export const getUser = async () => {
  const data = await getAPI(import.meta.env.VITE_API_USER);
  return data;
};

export const editUser = async (item: IUserModel) =>
  await putAPI(import.meta.env.VITE_API_USER, item, {
    messageSuccess: "Successfully updated user",
    messageFail: "Updated user failed",
  });

// Creating, deleting and changing the role of a user are done in the VTK IAM
// console (a user deleted here who still has a role there would come back at
// the next sign-in).
