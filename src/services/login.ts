import axios from "axios";
import { toast } from "react-toastify";
import { ILoginModel } from "../models/LoginModel";

export const login = async (email: string, password: string) => {
  try {
    const request = {
      email,
      password,
    };

    const res = await axios.post(
      import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_LOGIN,
      request
    );

    if (res.status >= 200 && res.status < 300) {
      return res.data as ILoginModel;
    }
    return false;
  } catch {
    toast.error("Failed to login");
    return false;
  }
};
