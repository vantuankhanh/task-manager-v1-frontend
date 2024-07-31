import { lazy } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import LoginPrivateRoute from "../components/LoginPrivateRoute";
import LayoutFull from "../layout/full-page/layout-full-page";
import LayoutMain from "../layout/main/layout-main";

/* -----------------------------AUTH--------------------------------- */

const AccessDeniedPage = lazy(() => import("../pages/auth/Access"));
const ErrorPage = lazy(() => import("../pages/auth/Error"));
const Login = lazy(() => import("../pages/auth/Login"));
const Logout = lazy(() => import("../pages/auth/Logout"));
const NotFound = lazy(() => import("../pages/auth/NotFound"));
const Signup = lazy(() => import("../pages/auth/Signup"));

/* ----------------------------PAGE--------------------------------- */

const Users = lazy(() => import("../pages/users"));
const Projects = lazy(() => import("../pages/projects"));
const Tasks = lazy(() => import("../pages/tasks"));
const Dashboard = lazy(() => import("../pages/dashboard"));

/* ------------------------------------------------------------------ */

const Router = () => {
  const routes = useRoutes([
    {
      element: (
        <LoginPrivateRoute>
          <LayoutMain>
            <Outlet />
          </LayoutMain>
        </LoginPrivateRoute>
      ),
      children: [
        { element: <Dashboard />, index: true },
        { path: "users", element: <Users /> },
        { path: "projects", element: <Projects /> },
        { path: "tasks", element: <Tasks /> },
      ],
    },
    {
      path: "auth",
      element: (
        <LayoutFull>
          <Outlet />
        </LayoutFull>
      ),
      children: [
        { path: "login", element: <Login /> },
        { path: "logout", element: <Logout /> },
        { path: "signup", element: <Signup /> },
        { path: "access", element: <AccessDeniedPage /> },
        { path: "error", element: <ErrorPage /> },
      ],
    },
    {
      path: "404",
      element: (
        <LayoutFull>
          <NotFound />
        </LayoutFull>
      ),
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
};

export default Router;
