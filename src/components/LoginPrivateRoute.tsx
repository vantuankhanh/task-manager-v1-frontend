import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authentication } from "../auth/authentication";
import {
  hasSignInAttemptMarker,
  removeSignInAttemptMarker,
  signInPagePathAfterFailedAttempt,
} from "../auth/signInAttemptMarker";
import { useAuthentication } from "../hooks/use-authentication";
import LoadingLazy from "./Loading/LoadingLazy";

interface ILoginPrivateRouteProps {
  children: JSX.Element;
}

const LoginPrivateRoute = ({ children }: ILoginPrivateRouteProps) => {
  const { isSignedIn, signIn } = useAuthentication();
  const location = useLocation();

  const requestedPath = location.pathname + location.search;
  const isSessionPresent = isSignedIn && authentication.isSessionPresent();
  // The browser is just back from a sign-in that started here
  const isBackFromSignIn = hasSignInAttemptMarker(location.search);
  const mustSignIn = !isSessionPresent && !isBackFromSignIn;

  useEffect(() => {
    if (mustSignIn) {
      // The VTK IAM sign-in, then back to requestedPath.
      signIn(requestedPath);
    }
  }, [mustSignIn, requestedPath, signIn]);

  if (!isSessionPresent) {
    if (isBackFromSignIn) {
      // Signed in at the IAM but still no session here: stop, do not go round again.
      return <Navigate to={signInPagePathAfterFailedAttempt} replace />;
    }
    return <LoadingLazy />;
  }

  if (isBackFromSignIn) {
    return <Navigate to={removeSignInAttemptMarker(requestedPath)} replace />;
  }

  return <div>{children}</div>;
};

export default LoginPrivateRoute;
