import { apiClient } from "./apiClient";
import {
  IAuthenticationProvider,
  IAuthenticationProviderContext,
  IAuthenticationState,
  ICurrentUser,
} from "./authenticationTypes";
import { browserNavigation } from "./browserNavigation";
import { createIamAuthenticationProvider } from "./iamAuthenticationProvider";

/**
 * The authentication module. VTK IAM signs people in, through the backend;
 * everything else in the application uses the interface below: current user,
 * isAdmin, signIn, signOut and the axios instance.
 */

type AuthenticationStateListener = () => void;

let authenticationState: IAuthenticationState = {
  status: "loading",
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

const runInitialization = async () => {
  try {
    activeProvider ??= createIamAuthenticationProvider(providerContext);
    const currentUser = await activeProvider.loadCurrentUser();
    updateAuthenticationState({ status: "ready", currentUser });
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
  /** The axios instance of every service, with the interceptors of the IAM sign-in. */
  apiClient,

  /** Asks the backend for the current user. Runs once per page load. */
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

  isSessionPresent: () =>
    authenticationState.currentUser !== null &&
    (activeProvider?.isSessionPresent() ?? false),

  /** Full-page navigation to the backend sign-in, back to returnToPath. */
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
