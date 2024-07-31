import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import secureLocalStorage from "react-secure-storage";

const Logout = () => {
  Cookies.remove("login");
  secureLocalStorage.clear();
  localStorage.clear();

  return <Navigate to="/auth/login" state={{}} />;
};

export default Logout;
