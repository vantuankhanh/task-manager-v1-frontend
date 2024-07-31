import { lazy } from "react";
import { useRole } from "../hooks/use-role";

const DashboardAdmin = lazy(
  () => import("../section/dashboard/DashboardAdmins.tsx")
);
const DashboardUser = lazy(
  () => import("../section/dashboard/DashboardUser.tsx")
);

const Dashboard = () => {
  const role = useRole();

  if (role === 0) {
    return <DashboardUser />;
  }

  return <DashboardAdmin />;
};
export default Dashboard;
