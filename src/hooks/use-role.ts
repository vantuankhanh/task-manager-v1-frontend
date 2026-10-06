import { useAuthentication } from "./use-authentication";

/** 0 = user, 1 = admin. Nobody signed in counts as a user. */
export const useRole = () => {
  return useAuthentication().currentUser?.role ?? 0;
};
