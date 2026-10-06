import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { classNames } from "primereact/utils";
import { Navigate, useLocation } from "react-router-dom";
import { hasSignInAttemptMarker } from "../../auth/signInAttemptMarker";
import { useAuthentication } from "../../hooks/use-authentication";

/**
 * The login route in iam mode: no form and no password here, the sign-in
 * itself happens at VTK IAM.
 */
const IamSignIn = () => {
  const { isSignedIn, signIn } = useAuthentication();
  const location = useLocation();

  if (isSignedIn) {
    return <Navigate to="/" />;
  }

  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
  );

  return (
    <div className={containerClassName}>
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <div className="text-center mb-5">
              <div className="text-900 text-3xl font-bold mb-3">WELCOME!</div>
              <span className="text-600 font-medium">Sign in to continue</span>
            </div>

            {hasSignInAttemptMarker(location.search) && (
              <Message
                severity="warn"
                className="w-full md:w-30rem mb-5"
                text="The sign-in did not complete. Please allow cookies for this site and try again."
              />
            )}

            <Button
              label="Sign in with VTK IAM"
              icon="pi pi-sign-in"
              className="w-full md:w-30rem p-3 text-xl border-round-3xl"
              onClick={() => signIn("/")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IamSignIn;
