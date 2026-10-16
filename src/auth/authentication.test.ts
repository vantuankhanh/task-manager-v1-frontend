import type { InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiBaseUrl = "https://api.task-manager.test/api";

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
  vi.doUnmock("react-toastify");
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("page load", () => {
  it("asks GET /api/me once, whoever calls initialize", async () => {
    const { authentication, requestsTo } = await loadAuthentication(
      (request) => {
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
      currentUser: signedInAdmin,
    });
    expect(authentication.isAdmin()).toBe(true);
    expect(requestsTo("GET", "/me")).toHaveLength(1);
    expect(requestsTo("GET", "/auth/config")).toHaveLength(0);
  });

  it("reports unavailable on a server error", async () => {
    const serverError = await loadAuthentication(() => ({ status: 500 }));
    await serverError.authentication.initialize();
    expect(serverError.authentication.getState()).toEqual({
      status: "unavailable",
      currentUser: null,
    });
  });
});

describe("sign-in through VTK IAM", () => {
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

  it("sends cookies and no Authorization header, and keeps nothing in browser storage", async () => {
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
    receivedRequests.forEach((request) =>
      expect(request.withCredentials).toBe(true)
    );
    expect(storageWrite).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");
  });

  it("follows a role changed at the IAM: reads the user again after a refresh and publishes it", async () => {
    let accessTokenIsValid = true;
    let roleAtTheIam = 1;
    const { authentication, requestsTo, goToExternalUrl } =
      await loadAuthentication((request) => {
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

  it("removes what the old sign-in left in the browser, and nothing else", async () => {
    localStorage.setItem("@secure.s.access_token", "old-access-token");
    localStorage.setItem("@secure.s.refresh_token", "old-refresh-token");
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
      const loaded = await loadAuthentication(() => ({ status: 401 }));
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

  it("offers only editing a user: creating, deleting and roles belong to the VTK IAM console", async () => {
    const { requestsTo, releaseRefresh } = await loadSignedInIamAuthentication(
      { refreshStatus: 204 }
    );
    releaseRefresh();
    const userService = await import("../services/userService");
    const person = { id: "12", name: "Person", email: "person@example.test" };

    expect(Object.keys(userService).sort()).toEqual(["editUser", "getUser"]);

    await userService.editUser(person);
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
