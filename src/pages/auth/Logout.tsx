import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { browserNavigation } from "../../auth/browserNavigation";
import LoadingLazy from "../../components/Loading/LoadingLazy";
import { useAuthentication } from "../../hooks/use-authentication";

const Logout = () => {
  const { signOut } = useAuthentication();
  const signOutStarted = useRef(false);

  useEffect(() => {
    if (signOutStarted.current) {
      return;
    }
    signOutStarted.current = true;

    // The backend revokes the session, then the browser goes to the IAM sign-out.
    signOut().catch(() => {
      toast.error("Could not sign out. Please try again.");
      browserNavigation.goToFrontendPath("/");
    });
  }, [signOut]);

  return <LoadingLazy />;
};

export default Logout;
