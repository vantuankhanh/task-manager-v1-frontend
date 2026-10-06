import axios from "axios";
import { apiClient } from "./apiClient";
import { authenticationEndpoints } from "./authenticationEndpoints";
import {
  AuthenticationMode,
  IAuthenticationProvider,
  IAuthenticationProviderContext,
  IAuthenticationState,
  ICurrentUser,
} from "./authenticationTypes";
import { browserNavigation } from "./browserNavigation";
import { createIamAuthenticationProvider } from "./iamAuthenticationProvider";

/**
 * The authentication module. The backend says at runtime which mode is on
 * (GET /api/auth/config), this module picks the provider of that mode and
 * everything else in the application uses the interface below, whatever the
 * mode: current user, isAdmin, signIn, signOut and the axios instance.
 */

type AuthenticationStateListener = () => void;

let authenticationState: IAuthenticationState = {
  status: "loading",
  mode: null,
  currentUser: null,
};
const authenticationStateListeners = new Set<AuthenticationStateListener>();
let activeProvider: IAuthenticationProvider | null = null;
let initializationInFlight: Promise<void> | null = null;

const updateAuthenticationState = (changes: Partial<IAuthenticationState>) => {
  authenticationState = { ...authenticationState, ...changes };
  authenticationStateListeners.forEach((listener) => listener());
};

const providerContext: IAuthenticationProviderContext = {
  apiClient,
  getCurrentUser: () => authenticationState.currentUser,
  setCurrentUser: (currentUser: ICurrentUser | null) =>
    updateAuthenticationState({ currentUser }),
};

const fetchAuthenticationMode = async (): Promise<AuthenticationMode> => {
  try {
    const response = await axios.get(
      authenticationEndpoints.authenticationConfiguration(),
      { timeout: 5000 }
    );
    const announcedMode = response.data?.mode;
    if (announcedMode === "legacy" || announcedMode === "iam") {
      return announcedMode;
    }
    throw new Error("The authentication configuration names an unknown mode");
  } catch (error) {
    // A backend from before the dual mode has no such route: it is a legacy backend.
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return "legacy";
    }
    throw error;
  }
};

const createProviderForMode = async (mode: AuthenticationMode) => {
  if (mode === "iam") {
    return createIamAuthenticationProvider(providerContext);
  }
  // Dynamic import: react-secure-storage, jwt-decode and js-cookie stay out of iam mode.
  const { createLegacyAuthenticationProvider } = await import(
    "./legacyAuthenticationProvider"
  );
  return createLegacyAuthenticationProvider(providerContext);
};

const runInitialization = async () => {
  try {
    if (!activeProvider) {
      activeProvider = await createProviderForMode(
        await fetchAuthenticationMode()
      );
    }
    const currentUser = await activeProvider.loadCurrentUser();
    updateAuthenticationState({
      status: "ready",
      mode: activeProvider.mode,
      currentUser,
    });
  } catch {
    updateAuthenticationState({ status: "unavailable" });
  }
};

/**
 * The back and forward buttons can bring a page back from the browser's
 * history cache exactly as it was left, with the user it had in memory, also
 * after that user signed out. Such a page is loaded again, so it asks the
 * backend who is signed in before it shows anything.
 */
const reloadWhenRestoredFromHistoryCache = (event: PageTransitionEvent) => {
  if (event.persisted) {
    browserNavigation.reloadPage();
  }
};

export const authentication = {
  /** The axios instance of every service, with the interceptors of the active mode. */
  apiClient,

  /** Asks the backend for the mode, then for the current user. Runs once per page load. */
  initialize: () => {
    if (!initializationInFlight) {
      window.addEventListener("pageshow", reloadWhenRestoredFromHistoryCache);
      initializationInFlight = runInitialization();
    }
    return initializationInFlight;
  },

  /** After status "unavailable": try again, started by the user (never automatically). */
  retryInitialization: () => {
    updateAuthenticationState({ status: "loading" });
    initializationInFlight = runInitialization();
    return initializationInFlight;
  },

  getState: () => authenticationState,

  subscribe: (listener: AuthenticationStateListener) => {
    authenticationStateListeners.add(listener);
    return () => {
      authenticationStateListeners.delete(listener);
    };
  },

  getCurrentUser: () => authenticationState.currentUser,

  isAdmin: () => authenticationState.currentUser?.role === 1,

  /** Also re-checks what the mode keeps in the browser (legacy), so a lapsed session is noticed. */
  isSessionPresent: () =>
    authenticationState.currentUser !== null &&
    (activeProvider?.isSessionPresent() ?? false),

  /** false in iam mode: accounts and roles are managed in the VTK IAM console. */
  supportsLocalAccountManagement: () =>
    activeProvider?.supportsLocalAccountManagement ?? false,

  /**
   * iam: full-page navigation to the backend sign-in, back to returnToPath.
   * legacy: the login form of this application.
   */
  signIn: (returnToPath: string = browserNavigation.currentFrontendPath()) => {
    activeProvider?.signIn(returnToPath);
  },

  signOut: async () => {
    await activeProvider?.signOut();
  },

  /** After a refused sign-in: lets the person choose another account. */
  signInWithAnotherAccount: async () => {
    await activeProvider?.signInWithAnotherAccount();
  },
};
