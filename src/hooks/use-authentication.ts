import { useMemo, useSyncExternalStore } from "react";
import { authentication } from "../auth/authentication";

export const useAuthentication = () => {
  const authenticationState = useSyncExternalStore(
    authentication.subscribe,
    authentication.getState
  );

  return useMemo(
    () => ({
      status: authenticationState.status,
      mode: authenticationState.mode,
      currentUser: authenticationState.currentUser,
      isSignedIn: authenticationState.currentUser !== null,
      isAdmin: authenticationState.currentUser?.role === 1,
      supportsLocalAccountManagement:
        authentication.supportsLocalAccountManagement(),
      signIn: authentication.signIn,
      signOut: authentication.signOut,
      signInWithAnotherAccount: authentication.signInWithAnotherAccount,
    }),
    [authenticationState]
  );
};
