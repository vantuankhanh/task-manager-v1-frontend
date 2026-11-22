import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutContext } from "../context/layoutcontext";

vi.mock("../../hooks/use-users", () => ({
  useUser: () => ({ name: "Alice", email: "alice@example.test" }),
}));

import AppTopbar from "./AppTopbar";

let container: HTMLDivElement;
let root: Root;

const layoutContextValue = {
  layoutState: { profileSidebarVisible: false },
  onMenuToggle: vi.fn(),
  showProfileSidebar: vi.fn(),
} as unknown as React.ContextType<typeof LayoutContext>;

// Shows where the router is, so a test can see a navigation.
const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

const currentPath = () =>
  container.querySelector('[data-testid="location"]')?.textContent;

beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <LayoutContext.Provider value={layoutContextValue}>
          <AppTopbar />
        </LayoutContext.Provider>
        <LocationProbe />
      </MemoryRouter>
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("AppTopbar account menu", () => {
  it("lists the privacy notice and goes to /privacy (ADR-020 of VTK IAM)", async () => {
    expect(currentPath()).toBe("/tasks");

    const accountButton = Array.from(
      container.querySelectorAll<HTMLElement>(".layout-topbar-button")
    ).find((candidate) => candidate.textContent?.includes("Alice"));
    expect(accountButton).toBeDefined();
    await act(async () => {
      accountButton?.click();
    });

    const noticeItem = Array.from(
      document.querySelectorAll<HTMLElement>(".p-menuitem-link")
    ).find((candidate) => candidate.textContent?.trim() === "Privacy notice");
    expect(noticeItem).toBeDefined();
    await act(async () => {
      noticeItem?.click();
    });

    expect(currentPath()).toBe("/privacy");
  });

  it("also offers the notice in the narrow-screen menu", async () => {
    const noticeButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button")
    ).find((candidate) => candidate.textContent?.trim() === "Privacy notice");
    expect(noticeButton).toBeDefined();

    await act(async () => {
      noticeButton?.click();
    });

    expect(currentPath()).toBe("/privacy");
  });
});
