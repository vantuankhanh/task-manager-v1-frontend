import { AxiosInstance } from "axios";

export type AuthenticationMode = "legacy" | "iam";

export type AuthenticationStatus = "loading" | "ready" | "unavailable";

export interface ICurrentUser {
  /** Only the IAM mode knows the id; the legacy token does not carry it. */
  id?: string | number;
  name: string;
  email: string;
  /** 0 = user, 1 = admin */
  role: number;
}

export interface IAuthenticationState {
  status: AuthenticationStatus;
  mode: AuthenticationMode | null;
  currentUser: ICurrentUser | null;
}

/** What the authentication module hands to the provider of the active mode. */
export interface IAuthenticationProviderContext {
  apiClient: AxiosInstance;
  getCurrentUser: () => ICurrentUser | null;
  setCurrentUser: (currentUser: ICurrentUser | null) => void;
}

/**
 * The same small interface for both modes. Pages talk to the authentication
 * module, the module talks to the provider of the mode the backend announced.
 */
export interface IAuthenticationProvider {
  readonly mode: AuthenticationMode;
  /**
   * true when this application creates accounts and changes roles itself
   * (legacy). false when the VTK IAM console does it (iam).
   */
  readonly supportsLocalAccountManagement: boolean;
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
