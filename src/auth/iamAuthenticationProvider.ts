import axios from "axios";
import { toast } from "react-toastify";
import { authenticationEndpoints } from "./authenticationEndpoints";
import {
  IAuthenticationProvider,
  IAuthenticationProviderContext,
  ICurrentUser,
} from "./authenticationTypes";
import { browserNavigation } from "./browserNavigation";
import {
  addSignInAttemptMarker,
  removeSignInAttemptMarker,
  signInPagePath,
} from "./signInAttemptMarker";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Set on a request that was already sent again after a session refresh. */
    hasBeenRetriedAfterSessionRefresh?: boolean;
    /** The caller decides what to do when the session is over (application start). */
    skipSignInRedirectWhenSessionEnded?: boolean;
  }
}

type SessionRefreshOutcome =
  | "refreshed"
  | "signedOut"
  | "unavailable"
  | "failed";

const requestTimeoutInMilliseconds = 5000;

const toCurrentUser = (responseBody: unknown): ICurrentUser => {
  const candidate = responseBody as Partial<ICurrentUser> | null;
  if (!candidate || typeof candidate.email !== "string") {
    throw new Error("The current user answer has an unexpected shape");
  }
  return {
    id: candidate.id,
    name: typeof candidate.name === "string" ? candidate.name : "",
    email: candidate.email,
    role: Number(candidate.role) === 1 ? 1 : 0,
  };
};

/** returnTo is always a path of this frontend, never the sign-in pages themselves. */
const toReturnToPath = (frontendPath: string) => {
  const isPathOfThisFrontend =
    frontendPath.startsWith("/") &&
    !frontendPath.startsWith("//") &&
    !frontendPath.includes("\\");
  if (!isPathOfThisFrontend || frontendPath.startsWith("/auth/")) {
    return "/";
  }
  return removeSignInAttemptMarker(frontendPath);
};

const isHttpUrl = (candidateUrl: unknown): candidateUrl is string => {
  if (typeof candidateUrl !== "string" || candidateUrl === "") {
    return false;
  }
  try {
    const protocol = new URL(candidateUrl, window.location.origin).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

/**
 * What a legacy session left in this browser before the backend was switched
 * to iam: the tokens of react-secure-storage (its keys start with "@secure.")
 * and the "login" cookie. They are of no use in iam mode, so they do not stay
 * within reach of scripts. Done by hand: the legacy libraries are not loaded.
 */
const removeLegacySessionLeftovers = () => {
  try {
    Object.keys(window.localStorage)
      .filter((storageKey) => storageKey.startsWith("@secure."))
      .forEach((storageKey) => window.localStorage.removeItem(storageKey));
    if (/(^|;\s*)login=/.test(document.cookie)) {
      document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
  } catch {
    // Storage blocked by the browser: nothing was left there either.
  }
};

/**
 * iam mode: the backend holds the tokens in httpOnly cookies of the API host.
 * This code never sees a token and writes nothing to localStorage,
 * sessionStorage or cookies (it only removes what legacy mode left there).
 */
export const createIamAuthenticationProvider = ({
  apiClient,
  getCurrentUser,
  setCurrentUser,
}: IAuthenticationProviderContext): IAuthenticationProvider => {
  let sessionRefreshInFlight: Promise<SessionRefreshOutcome> | null = null;
  let lastSessionRefreshOutcome: SessionRefreshOutcome | null = null;
  let signInNavigationStarted = false;

  const signIn = (returnToPath: string) => {
    browserNavigation.goToExternalUrl(
      authenticationEndpoints.iamSignIn(
        addSignInAttemptMarker(toReturnToPath(returnToPath))
      )
    );
  };

  /**
   * The tokens of a refresh carry the roles the user has now, so a role
   * changed in the VTK IAM console arrives here. The signed-in user is read
   * again and published when it changed: the menus and pages follow without
   * a page reload. Never refreshes or redirects by itself.
   */
  const reloadCurrentUserAfterSessionRefresh = async () => {
    const publishedUser = getCurrentUser();
    if (!publishedUser) {
      return;
    }
    try {
      const response = await apiClient.get(
        authenticationEndpoints.iamCurrentUser(),
        { hasBeenRetriedAfterSessionRefresh: true }
      );
      const reloadedUser = toCurrentUser(response.data);
      const isSameUser =
        reloadedUser.email === publishedUser.email &&
        reloadedUser.name === publishedUser.name &&
        reloadedUser.role === publishedUser.role;
      if (!isSameUser) {
        setCurrentUser(reloadedUser);
      }
    } catch {
      // The requests waiting for the refresh report their own failure.
    }
  };

  /** One refresh in flight: concurrent 401 answers wait for the same promise. */
  const refreshSessionOnce = () => {
    if (!sessionRefreshInFlight) {
      sessionRefreshInFlight = axios
        .post(authenticationEndpoints.iamRefresh(), undefined, {
          withCredentials: true,
          timeout: requestTimeoutInMilliseconds,
        })
        .then(
          (): SessionRefreshOutcome => "refreshed",
          (refreshError): SessionRefreshOutcome => {
            const refreshStatus = axios.isAxiosError(refreshError)
              ? refreshError.response?.status
              : undefined;
            if (refreshStatus === 401) return "signedOut";
            if (refreshStatus === 503) return "unavailable";
            return "failed";
          }
        )
        .then((sessionRefreshOutcome) => {
          lastSessionRefreshOutcome = sessionRefreshOutcome;
          sessionRefreshInFlight = null;
          if (sessionRefreshOutcome === "unavailable") {
            toast.error(
              "The sign-in service is temporarily unavailable. Please try again in a moment.",
              { toastId: "sign-in-service-unavailable" }
            );
          }
          if (sessionRefreshOutcome === "refreshed") {
            void reloadCurrentUserAfterSessionRefresh();
          }
          return sessionRefreshOutcome;
        });
    }
    return sessionRefreshInFlight;
  };

  /** POST /api/auth/logout: the backend revokes the session and says where the IAM sign-out is. */
  const endSessionAndGoToRedirectUrl = async () => {
    const response = await axios.post(
      authenticationEndpoints.iamSignOut(),
      undefined,
      {
        withCredentials: true,
        timeout: requestTimeoutInMilliseconds,
        headers: { Accept: "application/json" },
      }
    );
    const redirectUrl = response.data?.redirectUrl;
    if (!isHttpUrl(redirectUrl)) {
      throw new Error("The sign-out answer has no usable redirectUrl");
    }
    browserNavigation.goToExternalUrl(redirectUrl);
  };

  const answeredUnauthorized = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 401;

  removeLegacySessionLeftovers();

  apiClient.defaults.withCredentials = true;

  apiClient.interceptors.request.use((config) => {
    config.withCredentials = true;
    config.headers.delete("Authorization");
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = axios.isAxiosError(error)
        ? error.config
        : undefined;

      if (
        !originalRequest ||
        error.response?.status !== 401 ||
        originalRequest.hasBeenRetriedAfterSessionRefresh
      ) {
        return Promise.reject(error);
      }
      originalRequest.hasBeenRetriedAfterSessionRefresh = true;

      const sessionRefreshOutcome = await refreshSessionOnce();

      if (sessionRefreshOutcome === "refreshed") {
        return apiClient.request(originalRequest);
      }

      if (
        sessionRefreshOutcome === "signedOut" &&
        !originalRequest.skipSignInRedirectWhenSessionEnded
      ) {
        if (!signInNavigationStarted) {
          signInNavigationStarted = true;
          signIn(browserNavigation.currentFrontendPath());
        }
        // The page is leaving for the sign-in: keep the caller waiting
        // instead of letting it show an error.
        return new Promise(() => {});
      }

      // 503 or any other refresh failure: give the error back, never loop.
      return Promise.reject(error);
    }
  );

  return {
    mode: "iam",
    supportsLocalAccountManagement: false,

    loadCurrentUser: async () => {
      lastSessionRefreshOutcome = null;
      try {
        const response = await apiClient.get(
          authenticationEndpoints.iamCurrentUser(),
          { skipSignInRedirectWhenSessionEnded: true }
        );
        return toCurrentUser(response.data);
      } catch (error) {
        if (
          answeredUnauthorized(error) &&
          lastSessionRefreshOutcome === "signedOut"
        ) {
          return null;
        }
        throw error;
      }
    },

    isSessionPresent: () => getCurrentUser() !== null,

    signIn,

    signOut: async () => {
      try {
        await endSessionAndGoToRedirectUrl();
      } catch (error) {
        if (answeredUnauthorized(error)) {
          // The session was already over on the backend.
          setCurrentUser(null);
          browserNavigation.goToFrontendPath(signInPagePath);
          return;
        }
        throw error;
      }
    },

    signInWithAnotherAccount: async () => {
      // Straight to the IAM sign-in form: the account that signs in there
      // replaces the refused one, without a sign-out page in between.
      browserNavigation.goToExternalUrl(
        authenticationEndpoints.iamSignInWithAnotherAccount(
          addSignInAttemptMarker("/")
        )
      );
    },
  };
};
