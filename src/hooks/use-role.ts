import { useMemo } from "react";
import secureLocalStorage from "react-secure-storage";
import { IRefreshTokenDecodeModel } from "../models/RefreshTokenDecodeModel";
import { jwtDecode } from "jwt-decode";

export const useRole = () => {
  const token = secureLocalStorage.getItem("refresh_token");
  const data: IRefreshTokenDecodeModel = jwtDecode(token as string);

  return useMemo(() => data.role, [data]);
};
