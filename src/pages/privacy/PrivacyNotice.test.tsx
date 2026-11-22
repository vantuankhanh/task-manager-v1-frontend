import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { initialize, retryInitialization, apiGet, apiPost } = vi.hoisted(() => ({
  initialize: vi.fn(),
  retryInitialization: vi.fn(),
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

// Replaces the whole authentication module, so any call that /privacy made to
// the backend would be recorded here (ADR-020 of VTK IAM section 1).
vi.mock("../../auth/authentication", () => ({
  authentication: {
    initialize,
    retryInitialization,
    getState: () => ({ status: "loading", currentUser: null }),
    subscribe: () => () => undefined,
    getCurrentUser: () => null,
    isAdmin: () => false,
    isSessionPresent: () => false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signInWithAnotherAccount: vi.fn(),
  },
}));
vi.mock("../../auth/apiClient", () => ({
  apiClient: { get: apiGet, post: apiPost },
}));
// The full-page layout only adds the theme panel, which needs the layout provider.
vi.mock("../../layout/full-page/layout-full-page", () => ({
  default: ({ children }: { children: JSX.Element }) => <>{children}</>,
}));

import Router from "../../routes/routes";
import PrivacyNotice from "./PrivacyNotice";
import { privacyNoticeVersion } from "./privacyNoticeLocation";

let container: HTMLDivElement;
let root: Root;

// A new root per call, because a mounted MemoryRouter ignores a new initialEntries.
const renderAt = async (frontendPath: string, page: JSX.Element) => {
  act(() => root.unmount());
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[frontendPath]}>{page}</MemoryRouter>
    );
  });
};

const waitUntil = async (condition: () => boolean) => {
  for (let attempt = 0; attempt < 50 && !condition(); attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  expect(condition()).toBe(true);
};

const summaryLabels = () =>
  Array.from(container.querySelectorAll("dt")).map((term) =>
    term.textContent?.trim()
  );

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  initialize.mockReset();
  apiGet.mockReset();
  apiPost.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("/privacy", () => {
  it("shows the Vietnamese notice by default, with its version and the five summary labels", async () => {
    await renderAt("/privacy", <PrivacyNotice />);

    expect(container.querySelector("h1")?.textContent).toBe(
      "Thông báo xử lý dữ liệu cá nhân của Task Manager"
    );
    expect(privacyNoticeVersion).toBe("2026-11-22");
    expect(container.textContent).toContain("Phiên bản 2026-11-22");
    expect(summaryLabels()).toEqual([
      "Dữ liệu",
      "Mục đích",
      "Bên nhận",
      "Thời gian lưu",
      "Cách xóa",
    ]);
    expect(container.querySelector("main")?.getAttribute("lang")).toBe("vi");
  });

  it("shows the English notice for ?lang=en", async () => {
    await renderAt("/privacy?lang=en", <PrivacyNotice />);

    expect(container.querySelector("h1")?.textContent).toBe(
      "Personal data notice of Task Manager"
    );
    expect(container.textContent).toContain("Version 2026-11-22");
    expect(summaryLabels()).toEqual([
      "Data",
      "Purpose",
      "Recipients",
      "Retention",
      "Deletion",
    ]);
    expect(container.querySelector("main")?.getAttribute("lang")).toBe("en");
  });

  it("falls back to Vietnamese for an unknown language and never shows text of the address bar", async () => {
    await renderAt("/privacy", <PrivacyNotice />);
    const defaultText = container.textContent;

    for (const language of [
      "xx",
      "EN",
      "<img src=x onerror=alert(1)>Call 0900 for help",
    ]) {
      await renderAt(
        `/privacy?lang=${encodeURIComponent(language)}&message=Injected`,
        <PrivacyNotice />
      );
      expect(container.textContent).toBe(defaultText);
      expect(container.querySelector("img")).toBeNull();
      expect(container.textContent).not.toContain("Injected");
    }
  });

  it("links to the shared notice of VTK IAM", async () => {
    await renderAt("/privacy", <PrivacyNotice />);

    const iamLink = Array.from(container.querySelectorAll("a")).find(
      (anchor) =>
        anchor.getAttribute("href") === "https://auth.vantuankhanh.com/privacy"
    );
    expect(iamLink).toBeDefined();
    expect(iamLink?.getAttribute("rel")).toBe("noopener");
  });

  it("switches the language through ?lang in both directions", async () => {
    await renderAt("/privacy", <PrivacyNotice />);
    expect(
      container.querySelector('a[hreflang="en"]')?.getAttribute("href")
    ).toBe("/privacy?lang=en");

    await renderAt("/privacy?lang=en", <PrivacyNotice />);
    expect(
      container.querySelector('a[hreflang="vi"]')?.getAttribute("href")
    ).toBe("/privacy?lang=vi");
  });

  it("sets the document title and restores the previous one on unmount", async () => {
    document.title = "Before";
    await renderAt("/privacy", <PrivacyNotice />);
    expect(document.title).toBe("Thông báo xử lý dữ liệu cá nhân – Task Manager");

    await renderAt("/privacy?lang=en", <PrivacyNotice />);
    expect(document.title).toBe("Personal data notice – Task Manager");

    act(() => root.unmount());
    expect(document.title).toBe("Before");
    // Mounts a new root so the shared afterEach can unmount it.
    root = createRoot(container);
  });

  it("renders through the application router without any authentication or API call", async () => {
    await renderAt("/privacy", <Router />);

    await waitUntil(() => container.querySelector("h1") !== null);
    expect(container.querySelector("h1")?.textContent).toBe(
      "Thông báo xử lý dữ liệu cá nhân của Task Manager"
    );
    expect(initialize).not.toHaveBeenCalled();
    expect(retryInitialization).not.toHaveBeenCalled();
    expect(apiGet).not.toHaveBeenCalled();
    expect(apiPost).not.toHaveBeenCalled();
  });
});
