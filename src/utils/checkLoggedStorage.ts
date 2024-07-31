import secureLocalStorage from "react-secure-storage";
import Cookies from "js-cookie";

export const checkLoggedStorage = () => {
  const login = Cookies.get("login");
  const data = secureLocalStorage.getItem("refresh_token");
  const role = secureLocalStorage.getItem("role");

  return login && role && data;
};
