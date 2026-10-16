import { Button } from "primereact/button";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthentication } from "../../hooks/use-authentication";

interface ISignInFailureMessage {
  title: string;
  explanation: string;
}

/**
 * The reason only selects one of these fixed messages. No text of the
 * address bar is ever shown on the page.
 */
const selectSignInFailureMessage = (
  search: string
): ISignInFailureMessage => {
  switch (new URLSearchParams(search).get("reason")) {
    case "access_denied":
      return {
        title: "Access Denied",
        explanation:
          "Your account has no role in Task Manager. Ask an administrator to give you access in the VTK IAM console, or sign in with another account.",
      };
    case "sign_in_failed":
      return {
        title: "Sign-in Failed",
        explanation:
          "Something went wrong while signing you in. Please try again in a moment.",
      };
    default:
      return {
        title: "Not Signed In",
        explanation: "You could not be signed in. Please try again.",
      };
  }
};

/**
 * /auth/access: the backend sends the browser here when the
 * sign-in at VTK IAM failed. It is a public page: it shows for a visitor
 * without a session and never starts a sign-in by itself.
 */
const IamSignInFailed = () => {
  const { signIn, signInWithAnotherAccount } = useAuthentication();
  const location = useLocation();
  const [isLeavingForSignIn, setIsLeavingForSignIn] = useState(false);

  const signInFailureMessage = selectSignInFailureMessage(location.search);

  const onSignInWithAnotherAccount = async () => {
    setIsLeavingForSignIn(true);
    try {
      await signInWithAnotherAccount();
    } catch {
      setIsLeavingForSignIn(false);
      toast.error("Could not switch the account. Please try again.");
    }
  };

  return (
    <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center"
            style={{ borderRadius: "53px" }}
          >
            <div
              className="flex justify-content-center align-items-center bg-pink-500 border-circle"
              style={{ height: "3.2rem", width: "3.2rem" }}
            >
              <i className="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
            </div>
            <h1 className="text-900 font-bold text-5xl mb-2 text-center">
              {signInFailureMessage.title}
            </h1>
            <div
              className="text-600 mb-5 text-center"
              style={{ maxWidth: "30rem" }}
            >
              {signInFailureMessage.explanation}
            </div>
            <div className="flex flex-column sm:flex-row gap-3">
              <Button
                icon="pi pi-refresh"
                label="Try again"
                disabled={isLeavingForSignIn}
                onClick={() => signIn("/")}
              />
              <Button
                icon="pi pi-users"
                label="Sign in with another account"
                severity="secondary"
                outlined
                disabled={isLeavingForSignIn}
                onClick={onSignInWithAnotherAccount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IamSignInFailed;
