import { Navigate } from "react-router-dom";
import { useRole } from "../hooks/use-role";
import { lazy } from "react";

const AdminSection = lazy(() => import("../section/users/AdminSection"));

const Users = () => {
  const role = useRole();

  if (role !== 0) {
    return <AdminSection />;
  }
  return <Navigate to="/" />;
};

export default Users;
