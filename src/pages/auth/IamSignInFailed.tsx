import { Button } from "primereact/button";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthentication } from "../../hooks/use-authentication";
import { privacyNoticePath } from "../privacy/privacyNoticeLocation";

interface ISignInFailureMessage {
  title: string;
  explanation: string;
  /** Offers the personal data notice of this application. */
  offersPrivacyNotice: boolean;
}

/**
 * The reason only selects one of these fixed messages. No text of the
 * address bar is ever shown on the page.
 * access_denied also comes back when the person declined the personal data
 * notice of this application on the consent page of VTK IAM (ADR-020 of VTK
 * IAM, its docs/INTEGRATION.md section 8.7), so that message offers the notice
 * and another try.
 */
const selectSignInFailureMessage = (
  search: string
): ISignInFailureMessage => {
  switch (new URLSearchParams(search).get("reason")) {
    case "access_denied":
      return {
        title: "Access Denied",
        explanation:
          "Your account has no role in Task Manager, or you did not accept the personal data notice of Task Manager at VTK IAM. Read the notice and try again to accept it, ask an administrator to give you access in the VTK IAM console, or sign in with another account.",
        offersPrivacyNotice: true,
      };
    case "sign_in_failed":
      return {
        title: "Sign-in Failed",
        explanation:
          "Something went wrong while signing you in. Please try again in a moment.",
        offersPrivacyNotice: false,
      };
    default:
      return {
        title: "Not Signed In",
        explanation: "You could not be signed in. Please try again.",
        offersPrivacyNotice: false,
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
  const navigate = useNavigate();
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
              {signInFailureMessage.offersPrivacyNotice && (
                <Button
                  icon="pi pi-shield"
                  label="Read the notice"
                  severity="secondary"
                  outlined
                  disabled={isLeavingForSignIn}
                  onClick={() => navigate(privacyNoticePath)}
                />
              )}
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
