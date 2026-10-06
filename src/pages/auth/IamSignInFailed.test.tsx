import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
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

const renderAt = async (frontendPath: string, page: JSX.Element) => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[frontendPath]}>{page}</MemoryRouter>
    );
  });
};

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

describe("/auth/login in iam mode, signed out (where the IAM sign-out comes back)", () => {
  it("shows only the sign-in button and never goes to the IAM by itself", async () => {
    await renderAt("/auth/login", <IamSignIn />);

    expect(signIn).not.toHaveBeenCalled();
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.querySelector(".p-message")).toBeNull();

    await click(buttonLabelled("Sign in with VTK IAM"));
    expect(signIn.mock.calls).toEqual([["/"]]);
  });
});
