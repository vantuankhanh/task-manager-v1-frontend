import { useMemo } from "react";
import { useAuthentication } from "./use-authentication";

export const useUser = () => {
  const { currentUser } = useAuthentication();

  return useMemo(
    () => ({
      email: currentUser?.email ?? "",
      name: currentUser?.name ?? "",
    }),
    [currentUser]
  );
};
