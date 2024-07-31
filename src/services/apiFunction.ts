/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import axiosCustom from "./axios_custom";

interface IAPIFunctionOptionProps {
  messageSuccess?: string;
  messageFail?: string;
  configAPI?: AxiosRequestConfig<any>;
}

export const getAPI = async (url: string, option?: IAPIFunctionOptionProps) =>
  await axiosCustom
    .get(import.meta.env.VITE_BASE_URL + url, { ...option?.configAPI })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        option?.messageSuccess && toast.success(option.messageSuccess);
        return res.data;
      } else {
        toast.error(option?.messageFail || "Something went wrong");
        return false;
      }
    })
    .catch((error) => {
      toast.error(option?.messageFail || error.response.data.message);
      return false;
    });

export const postAPI = async (
  url: string,
  data: any,
  option?: IAPIFunctionOptionProps
) =>
  await axiosCustom
    .post(import.meta.env.VITE_BASE_URL + url, data, { ...option?.configAPI })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        option?.messageSuccess && toast.success(option.messageSuccess);
        return res.data;
      } else {
        toast.error(option?.messageFail || "Something went wrong");
        return false;
      }
    })
    .catch((error) => {
      toast.error(option?.messageFail || error.response.data.message);
      return false;
    });

export const putAPI = async (
  url: string,
  data: any,
  option?: IAPIFunctionOptionProps
) =>
  await axiosCustom
    .put(import.meta.env.VITE_BASE_URL + url, data, { ...option?.configAPI })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        option?.messageSuccess && toast.success(option.messageSuccess);
        return res.data;
      } else {
        toast.error(option?.messageFail || "Something went wrong");
        return false;
      }
    })
    .catch((error) => {
      toast.error(option?.messageFail || error.response.data.message);
      return false;
    });

export const deleteAPI = async (
  url: string,
  data?: any,
  option?: IAPIFunctionOptionProps
) =>
  await axiosCustom
    .delete(import.meta.env.VITE_BASE_URL + url, { data, ...option?.configAPI })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        option?.messageSuccess && toast.success(option.messageSuccess);
        return res.data;
      } else {
        toast.error(option?.messageFail || "Something went wrong");
        return false;
      }
    })
    .catch((error) => {
      toast.error(option?.messageFail || error.response.data.message);
      return false;
    });
