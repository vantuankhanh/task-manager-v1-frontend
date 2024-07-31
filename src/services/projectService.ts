import { IProjectModel } from "../models/ProjectModel";
import { deleteAPI, getAPI, postAPI, putAPI } from "./apiFunction";

export const createProject = async (item: IProjectModel) => {
  const res = await postAPI(import.meta.env.VITE_API_PROJECT, item, {
    messageSuccess: "Create new project successfully",
    messageFail: "Create project failed",
  });
  return res;
};

export const updateProject = async (item: IProjectModel) => {
  const res = await putAPI(import.meta.env.VITE_API_PROJECT, item, {
    messageSuccess: "Update project successfully",
    messageFail: "Update project failed",
  });
  return res;
};

export const deleteProject = async (id: string) => {
  const res = await deleteAPI(
    import.meta.env.VITE_API_PROJECT,
    { id },
    {
      messageSuccess: "Delete project successfully",
      messageFail: "Delete project failed",
    }
  );
  return res;
};

export const getProject = async (email: string = "") => {
  const data = await getAPI(
    email === ""
      ? import.meta.env.VITE_API_PROJECT
      : import.meta.env.VITE_API_GET_PROJECT_BY_USER + `/${email}`
  );
  return data;
};
