import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signInWithAnotherAccount, toastError } = vi.hoisted(() => ({
  signIn: vi.fn(),
  signInWithAnotherAccount: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../../hooks/use-authentication", () => ({
  useAuthentication: () => ({
    isSignedIn: false,
    signIn,
    signInWithAnotherAccount,
  }),
}));
vi.mock("react-toastify", () => ({ toast: { error: toastError } }));

import IamSignIn from "./IamSignIn";
import IamSignInFailed from "./IamSignInFailed";

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

// Shows where the router is, so a test can see a navigation.
const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

const currentPath = () =>
  container.querySelector('[data-testid="location"]')?.textContent;

const buttonLabelled = (label: string) => {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.trim() === label
  );
  if (!button) {
    throw new Error(`No button labelled "${label}"`);
  }
  return button;
};

const click = async (button: HTMLButtonElement) => {
  await act(async () => {
    button.click();
  });
};

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  signIn.mockReset();
  signInWithAnotherAccount.mockReset().mockResolvedValue(undefined);
  toastError.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("/auth/access in iam mode", () => {
  it("explains a refused account for reason=access_denied", async () => {
    await renderAt("/auth/access?reason=access_denied", <IamSignInFailed />);

    expect(container.querySelector("h1")?.textContent).toBe("Access Denied");
    expect(container.textContent).toContain(
      "Your account has no role in Task Manager"
    );
  });

  it("explains a failed sign-in for reason=sign_in_failed", async () => {
    await renderAt("/auth/access?reason=sign_in_failed", <IamSignInFailed />);

    expect(container.querySelector("h1")?.textContent).toBe("Sign-in Failed");
    expect(container.textContent).toContain(
      "Something went wrong while signing you in"
    );
  });

  it("shows the generic message for a missing or unknown reason and never text of the address bar", async () => {
    await renderAt("/auth/access", <IamSignInFailed />);
    expect(container.querySelector("h1")?.textContent).toBe("Not Signed In");
    const genericText = container.textContent;

    for (const reason of [
      "constructor",
      "ACCESS_DENIED",
      "<img src=x onerror=alert(1)>Call 0900 for help",
    ]) {
      await renderAt(
        `/auth/access?reason=${encodeURIComponent(reason)}&message=Injected`,
        <IamSignInFailed />
      );
      expect(container.textContent).toBe(genericText);
      expect(container.querySelector("img")).toBeNull();
    }
  });

  it("starts nothing by itself: no sign-in and no sign-out on arrival", async () => {
    await renderAt("/auth/access?reason=access_denied", <IamSignInFailed />);

    expect(signIn).not.toHaveBeenCalled();
    expect(signInWithAnotherAccount).not.toHaveBeenCalled();
  });

  it("tries again with the normal sign-in, back to the start page", async () => {
    await renderAt("/auth/access?reason=sign_in_failed", <IamSignInFailed />);

    await click(buttonLabelled("Try again"));

    expect(signIn.mock.calls).toEqual([["/"]]);
    expect(signInWithAnotherAccount).not.toHaveBeenCalled();
  });

  it("signs in with another account through the authentication module", async () => {
    await renderAt("/auth/access?reason=access_denied", <IamSignInFailed />);

    await click(buttonLabelled("Sign in with another account"));

    expect(signInWithAnotherAccount).toHaveBeenCalledTimes(1);
    expect(signIn).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("shows an error and stays usable when switching the account fails", async () => {
    signInWithAnotherAccount.mockRejectedValue(new Error("unreachable"));
    await renderAt("/auth/access?reason=access_denied", <IamSignInFailed />);

    await click(buttonLabelled("Sign in with another account"));

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(buttonLabelled("Try again").disabled).toBe(false);
  });
});

describe("/auth/access in iam mode, the personal data notice (ADR-020 of VTK IAM)", () => {
  const readTheNoticeLabel = "Read the notice";
  const hasButtonLabelled = (label: string) =>
    Array.from(container.querySelectorAll("button")).some(
      (candidate) => candidate.textContent?.trim() === label
    );

  it("offers the notice for reason=access_denied and goes to /privacy", async () => {
    await renderAt(
      "/auth/access?reason=access_denied",
      <>
        <IamSignInFailed />
        <LocationProbe />
      </>
    );
    expect(currentPath()).toBe("/auth/access");

    await click(buttonLabelled(readTheNoticeLabel));

    expect(currentPath()).toBe("/privacy");
    expect(signIn).not.toHaveBeenCalled();
  });

  it("starts the normal sign-in again from Try again on access_denied", async () => {
    await renderAt("/auth/access?reason=access_denied", <IamSignInFailed />);

    await click(buttonLabelled("Try again"));

    expect(signIn.mock.calls).toEqual([["/"]]);
  });

  it("does not offer the notice for sign_in_failed, a missing reason or an unknown one", async () => {
    for (const search of [
      "?reason=sign_in_failed",
      "",
      "?reason=ACCESS_DENIED",
      "?reason=unknown_reason",
    ]) {
      await renderAt(`/auth/access${search}`, <IamSignInFailed />);
      expect(hasButtonLabelled(readTheNoticeLabel)).toBe(false);
      expect(hasButtonLabelled("Try again")).toBe(true);
    }
  });
});

describe("/auth/login in iam mode, signed out (where the IAM sign-out comes back)", () => {
  it("shows only the sign-in button and never goes to the IAM by itself", async () => {
    await renderAt("/auth/login", <IamSignIn />);

    expect(signIn).not.toHaveBeenCalled();
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.querySelector(".p-message")).toBeNull();

    await click(buttonLabelled("Sign in with VTK IAM"));
    expect(signIn.mock.calls).toEqual([["/"]]);
  });

  it("links to the privacy notice without adding a second button", async () => {
    await renderAt("/auth/login", <IamSignIn />);

    const noticeLink = container.querySelector('a[href="/privacy"]');
    expect(noticeLink?.textContent?.trim()).toBe("Privacy notice");
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });
});
