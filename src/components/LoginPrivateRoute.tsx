import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import { clearAllCookie } from "../utils/cookieHandler";

interface ILoginPrivateRouteProps {
  children: JSX.Element;
}

const LoginPrivateRoute = ({ children }: ILoginPrivateRouteProps) => {
  const login = Cookies.get("login");
  const token = secureLocalStorage.getItem("refresh_token");

  if (!login || !token) {
    clearAllCookie();
    secureLocalStorage.clear();
    localStorage.clear();

    return <Navigate to="/auth/login" />;
  }

  return <div>{children}</div>;
};

export default LoginPrivateRoute;
