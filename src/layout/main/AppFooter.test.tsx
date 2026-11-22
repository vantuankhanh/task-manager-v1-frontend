import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import AppFooter from "./AppFooter";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("AppFooter", () => {
  it("links every page to the privacy notice of this application (ADR-020 of VTK IAM)", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AppFooter />
        </MemoryRouter>
      );
    });

    const noticeLink = container.querySelector('a[href="/privacy"]');
    expect(noticeLink?.textContent?.trim()).toBe("Privacy notice");
  });
});
