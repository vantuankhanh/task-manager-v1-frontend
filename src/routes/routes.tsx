import { lazy } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import LoginPrivateRoute from "../components/LoginPrivateRoute";
import { useAuthentication } from "../hooks/use-authentication";
import LayoutFull from "../layout/full-page/layout-full-page";
import LayoutMain from "../layout/main/layout-main";

/* -----------------------------AUTH--------------------------------- */

const AccessDeniedPage = lazy(() => import("../pages/auth/Access"));
const ErrorPage = lazy(() => import("../pages/auth/Error"));
const IamSignIn = lazy(() => import("../pages/auth/IamSignIn"));
const IamSignInFailed = lazy(() => import("../pages/auth/IamSignInFailed"));
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
  const { supportsLocalAccountManagement } = useAuthentication();

  // legacy: the email and password form and the signup page of this application.
  // iam: one button to VTK IAM, where accounts are created too. The legacy pages
  // are separate chunks, so iam mode never loads their storage code.
  const signInRoutes = supportsLocalAccountManagement
    ? [
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
        { path: "access", element: <AccessDeniedPage /> },
      ]
    : [
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
