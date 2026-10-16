import { AxiosInstance } from "axios";

export type AuthenticationStatus = "loading" | "ready" | "unavailable";

export interface ICurrentUser {
  id?: string | number;
  name: string;
  email: string;
  /** 0 = user, 1 = admin */
  role: number;
}

export interface IAuthenticationState {
  status: AuthenticationStatus;
  currentUser: ICurrentUser | null;
}

/** What the authentication module hands to the provider. */
export interface IAuthenticationProviderContext {
  apiClient: AxiosInstance;
  getCurrentUser: () => ICurrentUser | null;
  setCurrentUser: (currentUser: ICurrentUser | null) => void;
}

/**
 * Pages talk to the authentication module, the module talks to this provider.
 */
export interface IAuthenticationProvider {
  /** Resolves null when nobody is signed in, rejects when it cannot tell. */
  loadCurrentUser: () => Promise<ICurrentUser | null>;
  isSessionPresent: () => boolean;
  signIn: (returnToPath: string) => void;
  signOut: () => Promise<void>;
  /**
   * For a person whose account was refused: goes to a sign-in that asks for
   * the account again instead of reusing the refused one.
   */
  signInWithAnotherAccount: () => Promise<void>;
}
