import { lazy } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import LoginPrivateRoute from "../components/LoginPrivateRoute";
import LayoutFull from "../layout/full-page/layout-full-page";
import LayoutMain from "../layout/main/layout-main";

/* -----------------------------AUTH--------------------------------- */

const ErrorPage = lazy(() => import("../pages/auth/Error"));
const IamSignIn = lazy(() => import("../pages/auth/IamSignIn"));
const IamSignInFailed = lazy(() => import("../pages/auth/IamSignInFailed"));
const Logout = lazy(() => import("../pages/auth/Logout"));
const NotFound = lazy(() => import("../pages/auth/NotFound"));

/* ----------------------------PAGE--------------------------------- */

const Users = lazy(() => import("../pages/users"));
const Projects = lazy(() => import("../pages/projects"));
const Tasks = lazy(() => import("../pages/tasks"));
const Dashboard = lazy(() => import("../pages/dashboard"));

/* ------------------------------------------------------------------ */

const Router = () => {
  // One button to VTK IAM, where accounts are created too.
  const signInRoutes = [
    { path: "login", element: <IamSignIn /> },
    // Where the backend sends the browser when a sign-in at VTK IAM failed
    { path: "access", element: <IamSignInFailed /> },
  ];

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
        ...signInRoutes,
        { path: "logout", element: <Logout /> },
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
