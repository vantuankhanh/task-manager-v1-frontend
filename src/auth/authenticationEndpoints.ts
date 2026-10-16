/**
 * VITE_BASE_URL is the API base of the build and already ends with "/api",
 * so "{API}/api/auth/login" is VITE_BASE_URL + "/auth/login".
 */
const apiBaseUrl = () => import.meta.env.VITE_BASE_URL;

export const authenticationEndpoints = {
  iamSignIn: (returnToPath: string) =>
    `${apiBaseUrl()}/auth/login?returnTo=${encodeURIComponent(returnToPath)}`,
  /** prompt=login: the IAM shows its sign-in form even to a browser it knows. */
  iamSignInWithAnotherAccount: (returnToPath: string) =>
    `${apiBaseUrl()}/auth/login?returnTo=${encodeURIComponent(
      returnToPath
    )}&prompt=login`,
  iamRefresh: () => `${apiBaseUrl()}/auth/refresh`,
  iamSignOut: () => `${apiBaseUrl()}/auth/logout`,
  iamCurrentUser: () => `${apiBaseUrl()}/me`,
};
