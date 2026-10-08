import type { InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiBaseUrl = "https://api.task-manager.test/api";
const legacyLibraryNames = ["react-secure-storage", "jwt-decode", "js-cookie"];

interface IFakeAnswer {
  status: number;
  data?: unknown;
}

interface IReceivedRequest {
  method: string;
  path: string;
  authorizationHeader: string | undefined;
  acceptHeader: string | undefined;
  withCredentials: boolean;
}

type FakeBackend = (
  request: IReceivedRequest
) => IFakeAnswer | Promise<IFakeAnswer>;

const toastError = vi.fn();

/** A refresh token as the legacy backend signs it; only the payload matters here. */
const createLegacyRefreshToken = (payload: object) => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
};

/** jsdom has no canvas, and react-secure-storage draws on one to derive its key. */
const provideCanvasForSecureStorage = () => {
  const drawingContext = new Proxy(
    {},
    { get: () => () => undefined, set: () => true }
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    drawingContext as never
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:,");
};

const isStillPending = async (promise: Promise<unknown>) => {
  const settled = promise.then(
    () => "settled",
    () => "settled"
  );
  const pending = new Promise((resolve) =>
    setTimeout(() => resolve("pending"), 20)
  );
  return (await Promise.race([settled, pending])) === "pending";
};

/**
 * Loads a fresh copy of the authentication module against a fake backend:
 * an axios adapter, so no request leaves the process.
 */
const loadAuthentication = async (fakeBackend: FakeBackend) => {
  vi.resetModules();
  vi.stubEnv("VITE_BASE_URL", apiBaseUrl);
  vi.stubEnv("VITE_API_LOGIN", "/login");
  vi.stubEnv("VITE_API_USER", "/user");
  vi.doMock("react-toastify", () => ({
    toast: { error: toastError, success: vi.fn() },
  }));

  const axios = (await import("axios")).default;
  const receivedRequests: IReceivedRequest[] = [];

  axios.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const receivedRequest: IReceivedRequest = {
      method: (config.method ?? "get").toUpperCase(),
      path: (config.url ?? "").replace(apiBaseUrl, ""),
      authorizationHeader: config.headers.get("Authorization")?.toString(),
      acceptHeader: config.headers.get("Accept")?.toString(),
      withCredentials: config.withCredentials === true,
    };
    receivedRequests.push(receivedRequest);

    const answer = await fakeBackend(receivedRequest);
    const response = {
      data: answer.data ?? null,
      status: answer.status,
      statusText: "",
      headers: {},
      config,
    };
    if (answer.status >= 200 && answer.status < 300) {
      return response;
    }
    throw new axios.AxiosError(
      `Request failed with status code ${answer.status}`,
      "ERR_BAD_RESPONSE",
      config,
      undefined,
      response
    );
  };

  const { browserNavigation } = await import("./browserNavigation");
  const goToExternalUrl = vi
    .spyOn(browserNavigation, "goToExternalUrl")
    .mockImplementation(() => {});
  const goToFrontendPath = vi
    .spyOn(browserNavigation, "goToFrontendPath")
    .mockImplementation(() => {});
  vi.spyOn(browserNavigation, "currentFrontendPath").mockReturnValue(
    "/tasks?view=board"
  );

  const { authentication } = await import("./authentication");

  const requestsTo = (method: string, path: string) =>
    receivedRequests.filter(
      (request) => request.method === method && request.path === path
    );

  return {
    authentication,
    receivedRequests,
    requestsTo,
    goToExternalUrl,
    goToFrontendPath,
  };
};

const signedInAdmin = {
  id: 7,
  name: "Admin Person",
  email: "admin@example.test",
  role: 1,
};

beforeEach(() => {
  provideCanvasForSecureStorage();
  toastError.mockClear();
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach((cookie) => {
    const cookieName = cookie.split("=")[0].trim();
    if (cookieName) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
});

afterEach(() => {
  legacyLibraryNames.forEach((libraryName) => vi.doUnmock(libraryName));
  vi.doUnmock("react-toastify");
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("mode selection from GET /api/auth/config", () => {
  it("uses iam mode and the user of GET /api/me when the backend says iam", async () => {
    const { authentication, requestsTo } = await loadAuthentication(
      (request) => {
        if (request.path === "/auth/config")
          return { status: 200, data: { mode: "iam" } };
        if (request.path === "/me") return { status: 200, data: signedInAdmin };
        return { status: 404 };
      }
    );

    expect(authentication.getState().status).toBe("loading");
    await Promise.all([
      authentication.initialize(),
      authentication.initialize(),
    ]);

    expect(authentication.getState()).toEqual({
      status: "ready",
      mode: "iam",
      currentUser: signedInAdmin,
    });
    expect(authentication.isAdmin()).toBe(true);
    expect(authentication.supportsLocalAccountManagement()).toBe(false);
    expect(requestsTo("GET", "/auth/config")).toHaveLength(1);
    expect(requestsTo("GET", "/me")).toHaveLength(1);
  });

  it("uses legacy mode when the backend says legacy, and never asks for /api/me", async () => {
    const { authentication, requestsTo } = await loadAuthentication(
      (request) =>
        request.path === "/auth/config"
          ? { status: 200, data: { mode: "legacy" } }
          : { status: 404 }
    );

    await authentication.initialize();

    expect(authentication.getState()).toEqual({
      status: "ready",
      mode: "legacy",
      currentUser: null,
    });
    expect(authentication.supportsLocalAccountManagement()).toBe(true);
    expect(requestsTo("GET", "/me")).toHaveLength(0);
  });

  it("treats a backend without the route (404) as a legacy backend", async () => {
    const { authentication } = await loadAuthentication(() => ({
      status: 404,
    }));

    await authentication.initialize();

    expect(authentication.getState().mode).toBe("legacy");
  });

  it("reports unavailable, without guessing a mode, on a server error or an unknown mode", async () => {
    const serverError = await loadAuthentication(() => ({ status: 500 }));
    await serverError.authentication.initialize();
    expect(serverError.authentication.getState()).toEqual({
      status: "unavailable",
      mode: null,
      currentUser: null,
    });

    const unknownMode = await loadAuthentication(() => ({
      status: 200,
      data: { mode: "something-else" },
    }));
    await unknownMode.authentication.initialize();
    expect(unknownMode.authentication.getState().status).toBe("unavailable");
  });
});

describe("iam mode", () => {
  /** A backend whose access cookie has expired until POST /auth/refresh is called. */
  const createIamBackend = (options: {
    refreshStatus: number;
    refreshRestoresSession?: boolean;
    startSignedIn?: boolean;
  }) => {
    let sessionIsValid = options.startSignedIn ?? false;
    let releaseRefresh: () => void = () => {};
    const refreshMayAnswer = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });

    const fakeBackend: FakeBackend = async (request) => {
      if (request.path === "/auth/config")
        return { status: 200, data: { mode: "iam" } };
      if (request.path === "/auth/refresh") {
        await refreshMayAnswer;
        if (
          options.refreshStatus === 204 &&
          options.refreshRestoresSession !== false
        ) {
          sessionIsValid = true;
        }
        return { status: options.refreshStatus };
      }
      if (request.path === "/auth/logout") {
        return {
          status: 200,
          data: { redirectUrl: "https://auth.example.test/logout?state=1" },
        };
      }
      if (!sessionIsValid) return { status: 401, data: { message: "expired" } };
      if (request.path === "/me") return { status: 200, data: signedInAdmin };
      return { status: 200, data: { path: request.path } };
    };

    return {
      fakeBackend,
      releaseRefresh,
      expireSession: () => {
        sessionIsValid = false;
      },
    };
  };

  const loadSignedInIamAuthentication = async (
    options: Parameters<typeof createIamBackend>[0]
  ) => {
    const backend = createIamBackend({ ...options, startSignedIn: true });
    const loaded = await loadAuthentication(backend.fakeBackend);
    await loaded.authentication.initialize();
    backend.expireSession();
    return { ...loaded, ...backend };
  };

  it("shares one refresh between concurrent 401 answers and retries each request once", async () => {
    const { authentication, requestsTo, releaseRefresh } =
      await loadSignedInIamAuthentication({ refreshStatus: 204 });

    const concurrentRequests = Promise.all([
      authentication.apiClient.get(`${apiBaseUrl}/task`),
      authentication.apiClient.get(`${apiBaseUrl}/project`),
      authentication.apiClient.get(`${apiBaseUrl}/user`),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 10));
    releaseRefresh();
    const responses = await concurrentRequests;

    expect(responses.map((response) => response.data.path)).toEqual([
      "/task",
      "/project",
      "/user",
    ]);
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(1);
    expect(requestsTo("POST", "/auth/refresh")[0].withCredentials).toBe(true);
    expect(requestsTo("GET", "/task")).toHaveLength(2);
    expect(requestsTo("GET", "/project")).toHaveLength(2);
    expect(requestsTo("GET", "/user")).toHaveLength(2);
  });

  it("retries only once: a 401 after the refresh is given back to the caller", async () => {
    const { authentication, requestsTo, releaseRefresh, goToExternalUrl } =
      await loadSignedInIamAuthentication({
        refreshStatus: 204,
        refreshRestoresSession: false,
      });
    releaseRefresh();

    await expect(
      authentication.apiClient.get(`${apiBaseUrl}/task`)
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(requestsTo("GET", "/task")).toHaveLength(2);
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(1);
    expect(goToExternalUrl).not.toHaveBeenCalled();
  });

  it("goes to the backend sign-in once when the refresh answers 401", async () => {
    const { authentication, requestsTo, releaseRefresh, goToExternalUrl } =
      await loadSignedInIamAuthentication({ refreshStatus: 401 });
    releaseRefresh();

    const firstRequest = authentication.apiClient.get(`${apiBaseUrl}/task`);
    const secondRequest = authentication.apiClient.get(`${apiBaseUrl}/project`);

    expect(await isStillPending(firstRequest)).toBe(true);
    expect(await isStillPending(secondRequest)).toBe(true);
    expect(goToExternalUrl).toHaveBeenCalledTimes(1);
    expect(goToExternalUrl).toHaveBeenCalledWith(
      `${apiBaseUrl}/auth/login?returnTo=${encodeURIComponent(
        "/tasks?view=board&signInAttempt=1"
      )}`
    );
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(1);
    expect(requestsTo("GET", "/task")).toHaveLength(1);
  });

  it("shows an error and does not loop when the refresh answers 503", async () => {
    const { authentication, requestsTo, releaseRefresh, goToExternalUrl } =
      await loadSignedInIamAuthentication({ refreshStatus: 503 });
    releaseRefresh();

    await expect(
      authentication.apiClient.get(`${apiBaseUrl}/task`)
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(goToExternalUrl).not.toHaveBeenCalled();
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(1);
    expect(requestsTo("GET", "/task")).toHaveLength(1);
  });

  it("starts with nobody signed in, without redirecting, when /api/me and the refresh answer 401", async () => {
    const backend = createIamBackend({ refreshStatus: 401 });
    backend.releaseRefresh();
    const { authentication, goToExternalUrl, requestsTo } =
      await loadAuthentication(backend.fakeBackend);

    await authentication.initialize();

    expect(authentication.getState()).toEqual({
      status: "ready",
      mode: "iam",
      currentUser: null,
    });
    expect(authentication.isSessionPresent()).toBe(false);
    expect(goToExternalUrl).not.toHaveBeenCalled();
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(1);
  });

  it("starts as unavailable, without redirecting, when the refresh answers 503", async () => {
    const backend = createIamBackend({ refreshStatus: 503 });
    backend.releaseRefresh();
    const { authentication, goToExternalUrl, requestsTo } =
      await loadAuthentication(backend.fakeBackend);

    await authentication.initialize();

    expect(authentication.getState().status).toBe("unavailable");
    expect(goToExternalUrl).not.toHaveBeenCalled();
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(1);
    expect(requestsTo("GET", "/me")).toHaveLength(1);
  });

  it("sends cookies and no Authorization header, keeps nothing in browser storage and never loads the legacy libraries", async () => {
    const evaluatedLegacyLibraries: string[] = [];
    legacyLibraryNames.forEach((libraryName) =>
      vi.doMock(libraryName, () => {
        evaluatedLegacyLibraries.push(libraryName);
        return {};
      })
    );
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");

    const { authentication, receivedRequests, releaseRefresh } =
      await loadSignedInIamAuthentication({ refreshStatus: 204 });
    releaseRefresh();

    await authentication.apiClient.post(
      `${apiBaseUrl}/project`,
      { name: "New project" },
      { headers: { Authorization: "Bearer must-not-be-sent" } }
    );
    await authentication.signOut();

    expect(receivedRequests.length).toBeGreaterThan(4);
    receivedRequests.forEach((request) => {
      expect(request.authorizationHeader).toBeUndefined();
    });
    receivedRequests
      .filter((request) => request.path !== "/auth/config")
      .forEach((request) => expect(request.withCredentials).toBe(true));
    expect(storageWrite).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");
    expect(evaluatedLegacyLibraries).toEqual([]);
  });

  it("follows a role changed at the IAM: reads the user again after a refresh and publishes it", async () => {
    let accessTokenIsValid = true;
    let roleAtTheIam = 1;
    const { authentication, requestsTo, goToExternalUrl } =
      await loadAuthentication((request) => {
        if (request.path === "/auth/config")
          return { status: 200, data: { mode: "iam" } };
        if (request.path === "/auth/refresh") {
          accessTokenIsValid = true;
          return { status: 204 };
        }
        if (!accessTokenIsValid) return { status: 401 };
        if (request.path === "/me")
          return { status: 200, data: { ...signedInAdmin, role: roleAtTheIam } };
        return { status: 200, data: { path: request.path } };
      });
    await authentication.initialize();
    expect(authentication.isAdmin()).toBe(true);
    const publishedRoles: (number | undefined)[] = [];
    authentication.subscribe(() =>
      publishedRoles.push(authentication.getCurrentUser()?.role)
    );

    // The admin role is removed in the console, then the access token expires
    roleAtTheIam = 0;
    accessTokenIsValid = false;
    const response = await authentication.apiClient.get(`${apiBaseUrl}/user`);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(response.data.path).toBe("/user");
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(1);
    expect(requestsTo("GET", "/me")).toHaveLength(2);
    expect(authentication.isAdmin()).toBe(false);
    expect(authentication.getCurrentUser()).toMatchObject({
      email: signedInAdmin.email,
      role: 0,
    });
    expect(publishedRoles).toEqual([0]);
    expect(goToExternalUrl).not.toHaveBeenCalled();
  });

  it("publishes nothing after a refresh when the user did not change, and does not refresh again when reading the user fails", async () => {
    const { authentication, requestsTo, releaseRefresh } =
      await loadSignedInIamAuthentication({ refreshStatus: 204 });
    releaseRefresh();
    const stateListener = vi.fn();
    authentication.subscribe(stateListener);

    await authentication.apiClient.get(`${apiBaseUrl}/task`);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(requestsTo("GET", "/me")).toHaveLength(2);
    expect(stateListener).not.toHaveBeenCalled();

    const failing = await loadSignedInIamAuthentication({
      refreshStatus: 204,
      refreshRestoresSession: false,
    });
    failing.releaseRefresh();
    await expect(
      failing.authentication.apiClient.get(`${apiBaseUrl}/task`)
    ).rejects.toMatchObject({ response: { status: 401 } });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(failing.requestsTo("POST", "/auth/refresh")).toHaveLength(1);
    expect(failing.requestsTo("GET", "/me")).toHaveLength(2);
    expect(failing.authentication.getCurrentUser()).toMatchObject({ role: 1 });
    expect(failing.goToExternalUrl).not.toHaveBeenCalled();
  });

  it("removes what a legacy session left in the browser, and nothing else", async () => {
    localStorage.setItem("@secure.s.access_token", "legacy-access-token");
    localStorage.setItem("@secure.s.refresh_token", "legacy-refresh-token");
    localStorage.setItem("layout-theme", "light");
    document.cookie = "login=true; path=/";
    document.cookie = "language=en; path=/";

    const backend = createIamBackend({
      refreshStatus: 204,
      startSignedIn: true,
    });
    const { authentication } = await loadAuthentication(backend.fakeBackend);
    await authentication.initialize();

    expect(Object.keys(localStorage)).toEqual(["layout-theme"]);
    expect(document.cookie).toBe("language=en");
    expect(authentication.getCurrentUser()).toMatchObject(signedInAdmin);
  });

  it("signs in with a full-page navigation to the backend, returnTo being a frontend path", async () => {
    const { authentication, goToExternalUrl } =
      await loadSignedInIamAuthentication({ refreshStatus: 204 });

    authentication.signIn("/projects");
    authentication.signIn("https://evil.example/steal");
    authentication.signIn("/auth/login?signInAttempt=1");

    const signInUrlFor = (returnToPath: string) =>
      `${apiBaseUrl}/auth/login?returnTo=${encodeURIComponent(returnToPath)}`;
    expect(goToExternalUrl.mock.calls).toEqual([
      [signInUrlFor("/projects?signInAttempt=1")],
      [signInUrlFor("/?signInAttempt=1")],
      [signInUrlFor("/?signInAttempt=1")],
    ]);
  });

  it("signs out with POST /api/auth/logout asking for JSON, then goes to redirectUrl", async () => {
    const { authentication, requestsTo, goToExternalUrl } =
      await loadSignedInIamAuthentication({ refreshStatus: 204 });

    await authentication.signOut();

    const signOutRequests = requestsTo("POST", "/auth/logout");
    expect(signOutRequests).toHaveLength(1);
    expect(signOutRequests[0].acceptHeader).toBe("application/json");
    expect(signOutRequests[0].withCredentials).toBe(true);
    expect(goToExternalUrl).toHaveBeenCalledTimes(1);
    expect(goToExternalUrl).toHaveBeenCalledWith(
      "https://auth.example.test/logout?state=1"
    );
  });

  describe("sign in with another account, after a refused sign-in", () => {
    /** Nobody is signed in to the application; the IAM may still know the refused account. */
    const loadSignedOutIamAuthentication = async () => {
      const loaded = await loadAuthentication((request) => {
        if (request.path === "/auth/config")
          return { status: 200, data: { mode: "iam" } };
        return { status: 401 };
      });
      await loaded.authentication.initialize();
      expect(loaded.authentication.getState()).toMatchObject({
        status: "ready",
        currentUser: null,
      });
      return loaded;
    };

    it("goes straight to the backend sign-in with prompt=login, back to the start page", async () => {
      const { authentication, goToExternalUrl, goToFrontendPath } =
        await loadSignedOutIamAuthentication();

      await authentication.signInWithAnotherAccount();

      expect(goToExternalUrl.mock.calls).toEqual([
        [
          `${apiBaseUrl}/auth/login?returnTo=${encodeURIComponent(
            "/?signInAttempt=1"
          )}&prompt=login`,
        ],
      ]);
      expect(goToFrontendPath).not.toHaveBeenCalled();
    });

    it("does not pass through the IAM sign-out: no request to POST /api/auth/logout", async () => {
      const { authentication, receivedRequests, requestsTo } =
        await loadSignedOutIamAuthentication();
      const requestCountBefore = receivedRequests.length;

      await authentication.signInWithAnotherAccount();

      expect(requestsTo("POST", "/auth/logout")).toHaveLength(0);
      expect(receivedRequests).toHaveLength(requestCountBefore);
    });

    it("leaves the normal sign-in without a prompt", async () => {
      const { authentication, goToExternalUrl } =
        await loadSignedOutIamAuthentication();

      authentication.signIn("/");

      expect(goToExternalUrl.mock.calls).toEqual([
        [
          `${apiBaseUrl}/auth/login?returnTo=${encodeURIComponent(
            "/?signInAttempt=1"
          )}`,
        ],
      ]);
    });
  });

  it("never sends create user, delete user or change role: those belong to the VTK IAM console", async () => {
    const { requestsTo, receivedRequests, releaseRefresh } =
      await loadSignedInIamAuthentication({ refreshStatus: 204 });
    releaseRefresh();
    const { createUser, deleteUser, changeRoleUser, editUser } = await import(
      "../services/userService"
    );
    const person = { id: "12", name: "Person", email: "person@example.test" };
    const requestCountBefore = receivedRequests.length;

    expect(await deleteUser("12")).toBe(false);
    expect(await createUser({ ...person, password: "secret" })).toBe(false);
    expect(await changeRoleUser({ ...person, role: 0 })).toBe(false);

    expect(receivedRequests).toHaveLength(requestCountBefore);
    expect(requestsTo("DELETE", "/user")).toHaveLength(0);

    // Editing a user stays available
    await editUser(person);
    expect(requestsTo("PUT", "/user").length).toBeGreaterThan(0);
  });

  it("loads the page again when the back button restores it from the history cache, so a signed-out user is not shown", async () => {
    const { authentication } = await loadSignedInIamAuthentication({
      refreshStatus: 401,
    });
    const { browserNavigation } = await import("./browserNavigation");
    const reloadPage = vi
      .spyOn(browserNavigation, "reloadPage")
      .mockImplementation(() => {});
    const showPage = (persisted: boolean) => {
      const pageShowEvent = new Event("pageshow");
      Object.defineProperty(pageShowEvent, "persisted", { value: persisted });
      window.dispatchEvent(pageShowEvent);
    };

    // An ordinary page load: nothing to do
    showPage(false);
    expect(reloadPage).not.toHaveBeenCalled();

    // Restored as it was left, still holding the user in memory
    expect(authentication.getCurrentUser()).toMatchObject(signedInAdmin);
    showPage(true);
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});

describe("legacy mode", () => {
  const firstRefreshToken = createLegacyRefreshToken({
    name: "Normal Person",
    email: "person@example.test",
    role: 0,
  });
  const secondRefreshToken = createLegacyRefreshToken({
    name: "Normal Person",
    email: "person@example.test",
    role: 1,
  });

  const legacyBackend: FakeBackend = (request) => {
    if (request.path === "/auth/config")
      return { status: 200, data: { mode: "legacy" } };
    if (request.path === "/login") {
      return {
        status: 200,
        data: {
          access_token: "first-access-token",
          refresh_token: firstRefreshToken,
        },
      };
    }
    if (request.path === "/refresh-token") {
      return request.authorizationHeader === `Bearer ${firstRefreshToken}`
        ? {
            status: 200,
            data: {
              access_token: "second-access-token",
              refresh_token: secondRefreshToken,
            },
          }
        : { status: 401 };
    }
    return request.authorizationHeader === "Bearer second-access-token"
      ? { status: 200, data: { path: request.path } }
      : { status: 401, data: { message: "expired" } };
  };

  const loadSignedInLegacyAuthentication = async () => {
    const loaded = await loadAuthentication(legacyBackend);
    await loaded.authentication.initialize();
    const { signInWithPassword } = await import(
      "./legacyAuthenticationProvider"
    );
    expect(
      await signInWithPassword("person@example.test", "password", false)
    ).toBe(true);
    return loaded;
  };

  it("keeps the session where it was: the login cookie and the tokens in secure storage", async () => {
    const { authentication } = await loadSignedInLegacyAuthentication();

    expect(document.cookie).toContain("login=true");
    expect(localStorage.length).toBeGreaterThan(0);
    expect(authentication.getState().currentUser).toEqual({
      name: "Normal Person",
      email: "person@example.test",
      role: 0,
    });
    expect(authentication.isAdmin()).toBe(false);
    expect(authentication.isSessionPresent()).toBe(true);
  });

  it("reads the signed-in user back from the stored refresh token on the next page load", async () => {
    await loadSignedInLegacyAuthentication();

    const { authentication } = await loadAuthentication(legacyBackend);
    await authentication.initialize();

    expect(authentication.getState().currentUser?.email).toBe(
      "person@example.test"
    );
  });

  it("attaches the bearer access token and refreshes the old way on a 401", async () => {
    const { authentication, requestsTo } =
      await loadSignedInLegacyAuthentication();

    const response = await authentication.apiClient.get(`${apiBaseUrl}/task`);

    expect(response.data.path).toBe("/task");
    const taskRequests = requestsTo("GET", "/task");
    expect(
      taskRequests.map((request) => request.authorizationHeader)
    ).toEqual(["Bearer first-access-token", "Bearer second-access-token"]);
    expect(taskRequests[0].withCredentials).toBe(false);
    const refreshRequests = requestsTo("GET", "/refresh-token");
    expect(refreshRequests).toHaveLength(1);
    expect(refreshRequests[0].authorizationHeader).toBe(
      `Bearer ${firstRefreshToken}`
    );
    expect(requestsTo("POST", "/auth/refresh")).toHaveLength(0);
    // The renewed refresh token carries the new role
    expect(authentication.getState().currentUser?.role).toBe(1);
  });

  it("signs out by clearing the browser session and showing the login form", async () => {
    const { authentication, goToFrontendPath, goToExternalUrl, requestsTo } =
      await loadSignedInLegacyAuthentication();

    await authentication.signOut();

    expect(document.cookie).not.toContain("login=");
    expect(localStorage.length).toBe(0);
    expect(authentication.getState().currentUser).toBeNull();
    expect(authentication.isSessionPresent()).toBe(false);
    expect(goToFrontendPath).toHaveBeenCalledWith("/auth/login");
    expect(goToExternalUrl).not.toHaveBeenCalled();
    expect(requestsTo("POST", "/auth/logout")).toHaveLength(0);
  });

  it("still deletes, creates and changes the role of users in this application", async () => {
    const { requestsTo } = await loadSignedInLegacyAuthentication();
    const { createUser, deleteUser, changeRoleUser } = await import(
      "../services/userService"
    );
    const person = { id: "12", name: "Person", email: "person@example.test" };

    expect(await deleteUser("12")).toBeTruthy();
    expect(await createUser({ ...person, password: "secret" })).toBeTruthy();
    expect(await changeRoleUser({ ...person, role: 0 })).toBeTruthy();

    const deleteRequests = requestsTo("DELETE", "/user");
    expect(deleteRequests.length).toBeGreaterThan(0);
    expect(
      deleteRequests[deleteRequests.length - 1].authorizationHeader
    ).toBe("Bearer second-access-token");
    expect(requestsTo("POST", "/user")).toHaveLength(1);
    expect(requestsTo("PUT", "/user/changerole")).toHaveLength(1);
  });

  it("sends a person who wants another account to the login form, without calling the backend", async () => {
    const { authentication, goToFrontendPath, goToExternalUrl, requestsTo } =
      await loadSignedInLegacyAuthentication();

    await authentication.signInWithAnotherAccount();

    expect(goToFrontendPath).toHaveBeenCalledWith("/auth/login");
    expect(goToExternalUrl).not.toHaveBeenCalled();
    expect(requestsTo("POST", "/auth/logout")).toHaveLength(0);
  });
});
