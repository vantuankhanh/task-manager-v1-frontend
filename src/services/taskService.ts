import { ITaskModel } from "../models/TaskModel";
import { deleteAPI, getAPI, postAPI, putAPI } from "./apiFunction";

export const getTaskByProjectId = async (id: string) => {
  const data = await getAPI(
    import.meta.env.VITE_API_GET_TASK_BY_PROJECT + `/${id}`
  );
  return data;
};

export const createTask = async (item: ITaskModel) => {
  const data = await postAPI(import.meta.env.VITE_API_TASK, item, {
    messageSuccess: "Create new task successfully",
    messageFail: "Create task failed",
  });
  return data;
};

export const updateTask = async (item: ITaskModel) => {
  const res = await putAPI(import.meta.env.VITE_API_TASK, item, {
    messageSuccess: "Update task successfully",
    messageFail: "Update task failed",
  });
  return res;
};

export const deleteTask = async (task: ITaskModel) => {
  const res = await deleteAPI(import.meta.env.VITE_API_TASK, task, {
    messageSuccess: "Delete Task successfully",
    messageFail: "Delete Task failed",
  });
  return res;
};

export const getTask = async (email: string = "") => {
  const data = await getAPI(
    email === ""
      ? import.meta.env.VITE_API_TASK
      : import.meta.env.VITE_API_GET_TASK_BY_USER + `/${email}`
  );
  return data;
};
