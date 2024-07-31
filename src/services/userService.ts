import { IUserModel } from "../models/UserModel";
import { deleteAPI, getAPI, postAPI, putAPI } from "./apiFunction";

export const getUser = async () => {
  const data = await getAPI(import.meta.env.VITE_API_USER);
  return data;
};

export const editUser = async (item: IUserModel) =>
  await putAPI(import.meta.env.VITE_API_USER, item, {
    messageSuccess: "Successfully updated user",
    messageFail: "Updated user failed",
  });

export const createUser = async (item: IUserModel) =>
  await postAPI(import.meta.env.VITE_API_USER, item);

export const deleteUser = async (id: string) =>
  await deleteAPI(
    import.meta.env.VITE_API_USER,
    { id },
    {
      messageSuccess: "Successfully deleted user",
      messageFail: "Deleted user failed",
    }
  );

export const changeRoleUser = async (item: IUserModel) => {
  const res = await putAPI(
    import.meta.env.VITE_API_USER + "/changerole",
    {
      ...item,
      role: item.role === 1 ? 0 : item.role === 0 ? 1 : 0,
    },
    {
      messageSuccess: `Successfully change role of ${item.email} to ${
        item.role === 0 ? "admin" : "normal user"
      }`,
      messageFail: "Changed role failed",
    }
  );
  return res;
};
