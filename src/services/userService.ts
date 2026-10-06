import { authentication } from "../auth/authentication";
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

// Creating, deleting and changing the role of a user are legacy mode only:
// in iam mode accounts, roles and access are managed in the VTK IAM console
// (a user deleted here who still has a role there would come back at the
// next sign-in).
export const createUser = async (item: IUserModel) =>
  authentication.supportsLocalAccountManagement()
    ? await postAPI(import.meta.env.VITE_API_USER, item)
    : false;

export const deleteUser = async (id: string) =>
  authentication.supportsLocalAccountManagement()
    ? await deleteAPI(
        import.meta.env.VITE_API_USER,
        { id },
        {
          messageSuccess: "Successfully deleted user",
          messageFail: "Deleted user failed",
        }
      )
    : false;

export const changeRoleUser = async (item: IUserModel) => {
  if (!authentication.supportsLocalAccountManagement()) {
    return false;
  }

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
