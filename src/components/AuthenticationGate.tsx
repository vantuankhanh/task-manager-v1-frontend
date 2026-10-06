import { Button } from "primereact/button";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authentication } from "../auth/authentication";
import { browserNavigation } from "../auth/browserNavigation";
import { useAuthentication } from "../hooks/use-authentication";
import LoadingLazy from "./Loading/LoadingLazy";

interface IAuthenticationGateProps {
  children: ReactNode;
}

/**
 * Nothing of the application renders before the backend said which sign-in
 * mode is on and who is signed in, so no login page flashes by.
 */
const AuthenticationGate = ({ children }: IAuthenticationGateProps) => {
  const navigate = useNavigate();
  const { status } = useAuthentication();

  useEffect(() => {
    browserNavigation.registerFrontendNavigator((frontendPath) =>
      navigate(frontendPath)
    );
    return () => browserNavigation.registerFrontendNavigator(null);
  }, [navigate]);

  useEffect(() => {
    authentication.initialize();
  }, []);

  if (status === "loading") {
    return <LoadingLazy />;
  }

  if (status === "unavailable") {
    return (
      <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div className="surface-card py-6 px-5 sm:px-8 flex flex-column align-items-center border-round-3xl">
          <div
            className="flex justify-content-center align-items-center bg-pink-500 border-circle"
            style={{ height: "3.2rem", width: "3.2rem" }}
          >
            <i className="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
          </div>
          <h1 className="text-900 font-bold text-3xl mb-2">
            Sign-in is unavailable
          </h1>
          <div className="text-600 mb-5 text-center">
            The server could not be reached or could not check your session.
            Please try again in a moment.
          </div>
          <Button
            icon="pi pi-refresh"
            label="Try again"
            onClick={() => authentication.retryInitialization()}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthenticationGate;
