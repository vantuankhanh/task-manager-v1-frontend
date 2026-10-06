/**
 * legacy mode only. This is the one file (with pages/auth/Login.tsx and
 * pages/auth/Signup.tsx, which are only routed in legacy mode) that touches
 * react-secure-storage, jwt-decode and js-cookie. authentication.ts loads it
 * with a dynamic import, so iam mode never downloads or runs it. It can be
 * deleted, with those three packages, once legacy mode is retired.
 */
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import secureLocalStorage from "react-secure-storage";
import { IRefreshTokenDecodeModel } from "../models/RefreshTokenDecodeModel";
import { login } from "../services/login";
import { clearAllCookie } from "../utils/cookieHandler";
import { authenticationEndpoints } from "./authenticationEndpoints";
import {
  IAuthenticationProvider,
  IAuthenticationProviderContext,
  ICurrentUser,
} from "./authenticationTypes";
import { browserNavigation } from "./browserNavigation";
import { signInPagePath } from "./signInAttemptMarker";

const signedInCookieName = "login";
const accessTokenStorageKey = "access_token";
const refreshTokenStorageKey = "refresh_token";

let providerContext: IAuthenticationProviderContext | null = null;

const readCurrentUserFromStorage = (): ICurrentUser | null => {
  const refreshToken = secureLocalStorage.getItem(refreshTokenStorageKey);
  if (!Cookies.get(signedInCookieName) || typeof refreshToken !== "string") {
    return null;
  }
  try {
    const decodedRefreshToken =
      jwtDecode<IRefreshTokenDecodeModel>(refreshToken);
    return {
      name: decodedRefreshToken.name,
      email: decodedRefreshToken.email,
      role: decodedRefreshToken.role,
    };
  } catch {
    return null;
  }
};

/** Publishes the user of the stored refresh token, only when it changed. */
const publishCurrentUserFromStorage = () => {
  if (!providerContext) {
    return;
  }
  const storedUser = readCurrentUserFromStorage();
  const publishedUser = providerContext.getCurrentUser();
  const isSameUser =
    storedUser?.email === publishedUser?.email &&
    storedUser?.name === publishedUser?.name &&
    storedUser?.role === publishedUser?.role;
  if (!isSameUser) {
    providerContext.setCurrentUser(storedUser);
  }
};

/** The email and password form of pages/auth/Login.tsx. */
export const signInWithPassword = async (
  email: string,
  password: string,
  rememberSignIn: boolean
) => {
  const data = await login(email, password);
  if (!data) {
    return false;
  }

  if (rememberSignIn) {
    Cookies.set(signedInCookieName, "true", {
      expires: 7 + 7 / 24,
    });
  } else {
    Cookies.set(signedInCookieName, "true");
  }
  secureLocalStorage.setItem(accessTokenStorageKey, data.access_token);
  secureLocalStorage.setItem(refreshTokenStorageKey, data.refresh_token);
  publishCurrentUserFromStorage();
  return true;
};

export const createLegacyAuthenticationProvider = (
  context: IAuthenticationProviderContext
): IAuthenticationProvider => {
  providerContext = context;
  const { apiClient, setCurrentUser } = context;

  // The API is called with the access token; the refresh token only goes to /refresh-token
  apiClient.interceptors.request.use(
    (config) => {
      const token = secureLocalStorage.getItem(accessTokenStorageKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // 401 Unauthorized and the token was not renewed for this request yet
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const currentToken = secureLocalStorage.getItem(
            refreshTokenStorageKey
          );
          const response = await axios({
            method: "get",
            url: authenticationEndpoints.legacyRefresh(),
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          });

          // Store the new tokens and send the original request again
          const newAccessToken = response.data.access_token;
          secureLocalStorage.setItem(accessTokenStorageKey, newAccessToken);
          secureLocalStorage.setItem(
            refreshTokenStorageKey,
            response.data.refresh_token
          );
          publishCurrentUserFromStorage();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (error) {
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return {
    mode: "legacy",
    supportsLocalAccountManagement: true,

    loadCurrentUser: async () => readCurrentUserFromStorage(),

    isSessionPresent: () =>
      Boolean(
        Cookies.get(signedInCookieName) &&
          secureLocalStorage.getItem(refreshTokenStorageKey)
      ),

    // What LoginPrivateRoute did for a visitor without a session:
    // drop the leftovers, then show the login form.
    signIn: () => {
      clearAllCookie();
      secureLocalStorage.clear();
      localStorage.clear();
      setCurrentUser(null);
      browserNavigation.goToFrontendPath(signInPagePath);
    },

    signOut: async () => {
      Cookies.remove(signedInCookieName);
      secureLocalStorage.clear();
      localStorage.clear();
      setCurrentUser(null);
      browserNavigation.goToFrontendPath(signInPagePath);
    },

    // The login form is where another account is typed in.
    signInWithAnotherAccount: async () => {
      browserNavigation.goToFrontendPath(signInPagePath);
    },
  };
};
