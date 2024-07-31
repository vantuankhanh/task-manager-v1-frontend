import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";
import secureLocalStorage from "react-secure-storage";
import { IRefreshTokenDecodeModel } from "../models/RefreshTokenDecodeModel";

export const useUser = () => {
  const token = secureLocalStorage.getItem("refresh_token");
  const data: IRefreshTokenDecodeModel = jwtDecode(token as string);
  return useMemo(
    () => ({
      email: data.email,
      name: data.name,
    }),
    [data]
  );
};
