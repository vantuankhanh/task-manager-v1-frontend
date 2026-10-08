# Task manager Frontend

## Install required packages

```cmd
pnpm install
```

## Build project

```cmd
pnpm build
```

## Running project

```cmd
pnpm dev
```

## Tests

```cmd
pnpm test
```

## Sign-in modes

The backend decides the sign-in mode at runtime. On every page load the frontend calls `GET {VITE_BASE_URL}/auth/config` once and gets `{ "mode": "legacy" }` or `{ "mode": "iam" }`. One build serves both modes, so switching or rolling back is only a backend change (`AUTH_MODE` in the backend `.env`, then a restart): the frontend is not rebuilt or redeployed.

| | legacy | iam |
| --- | --- | --- |
| Sign in | Email and password form at `/auth/login`, signup at `/auth/signup` | Full-page navigation to `{VITE_BASE_URL}/auth/login?returnTo=<path>`; the sign-in itself happens at VTK IAM |
| Session | `access_token` and `refresh_token` in react-secure-storage (localStorage) and a `login` cookie | httpOnly cookies on the API host; the browser code never holds a token and writes nothing to localStorage, sessionStorage or cookies. On load it removes what a legacy session left behind (the `@secure.*` keys of localStorage and the `login` cookie) |
| API calls | `Authorization: Bearer <access token>` | `withCredentials`, no `Authorization` header |
| On a 401 | `GET /refresh-token` with the refresh token, then one retry | `POST /auth/refresh` once (shared by concurrent requests), then one retry; a 401 from the refresh goes to the sign-in, a 503 shows an error |
| Current user | Decoded from the stored refresh token | `GET /me` (`{ id, name, email, role }`), fetched on page load and again after every session refresh, so a role changed in the VTK IAM console reaches the menu and the pages without a reload (at most one access token lifetime later) |
| Sign out | Clears the browser session | `POST /auth/logout`, then the browser goes to the `redirectUrl` of the answer; the IAM sends it back to `/auth/login`, which shows the sign-in button and never goes to the IAM by itself |
| Failed sign-in | A message on the login form | The backend sends the browser to `/auth/access?reason=access_denied` (the account has no role in this application) or `/auth/access?reason=sign_in_failed` (anything else). The page is public, shows a fixed message per reason (never text of the address bar) and offers "Try again" and "Sign in with another account" (full-page navigation to `{VITE_BASE_URL}/auth/login?returnTo=/&prompt=login`, so the IAM shows its sign-in form instead of reusing the refused account) |
| Create user, signup, change role, delete user | In this application | Hidden: accounts, roles and access are managed in the VTK IAM console. Editing a user stays |

The code is in `src/auth`: `authentication.ts` is the one interface the pages use (current user, isAdmin, signIn, signOut, the axios instance), `iamAuthenticationProvider.ts` and `legacyAuthenticationProvider.ts` implement it for each mode. react-secure-storage, jwt-decode and js-cookie are only loaded in legacy mode and can be removed together with `legacyAuthenticationProvider.ts`, `pages/auth/Login.tsx` and `pages/auth/Signup.tsx` once legacy mode is retired.

A backend that answers 404 on `/auth/config` (one from before the dual mode) is treated as a legacy backend. Any other failure shows a "Sign-in is unavailable" page with a retry button.

### Build-time environment

The mode is not a build-time setting. The build needs the same variables as before (`.env`, read by Vite):

| Name | Meaning |
| --- | --- |
| `VITE_BASE_URL` | API base including `/api`, for example `https://api-taskmanager-v1.vantuankhanh.com/api`. The frontend and the API must be on the same site (same registrable domain, both `https`) for iam mode. |
| `VITE_API_LOGIN` | Path of the legacy login (legacy mode only) |
| `VITE_API_CHANGE_PASSWORD` | Path of the change password route |
| `VITE_API_USER` | Path of the user routes |
| `VITE_API_PROJECT` | Path of the project routes |
| `VITE_API_TASK` | Path of the task routes |
| `VITE_API_GET_TASK_BY_PROJECT`, `VITE_API_GET_TASK_BY_USER`, `VITE_API_GET_PROJECT_BY_USER` | Paths of the lookup routes |

A variable set in the environment wins over `.env`, so a local backend needs no edit of `.env`: `VITE_BASE_URL=http://localhost:8000/api pnpm exec vite --port 5174 --strictPort` (the port must be the one in the backend's `FRONTEND_BASE_URL`).

### What to check in the browser after switching the backend to iam

1. Open the frontend in a private window of Chrome or Edge. The network tab shows `auth/config` answering `{ "mode": "iam" }`, then `me` and `auth/refresh` answering 401, and the browser lands on the VTK IAM sign-in without a login form of this application flashing by.
2. After signing in, the browser is back on the page that was asked for, and the `?signInAttempt=1` marker is gone from the address bar. If it stays on the VTK IAM sign-in page after a correct password and the console shows a `form-action` Content Security Policy error, the IAM does not allow the frontend host yet: see "Before you start" in the backend's `docs/IAM-MIGRATION.md`.
3. DevTools, Application tab: Local Storage and Session Storage of the frontend origin are empty, and the frontend origin has no cookie, also in a browser that had a legacy session before the switch. The API host has httpOnly cookies only (`document.cookie` in the console shows no token).
4. Network tab: API requests carry cookies and no `Authorization` header, and their responses have `Access-Control-Allow-Origin` equal to the frontend origin and `Access-Control-Allow-Credentials: true`.
5. The name in the top bar and the menu match the role given in the VTK IAM console: an admin sees the User page, a user does not. After a role change in the console the menu follows at the next `auth/refresh` (the request after it is `me`), without a reload.
6. The User page shows the note about the VTK IAM console and has no "Create" button, no change-role button and no delete button; the edit button is still there. `/auth/signup` shows the not found page.
7. Delete the `access_token` cookie of the API host, then click around: one `auth/refresh` request appears and the page keeps working.
8. Logout goes through the VTK IAM sign-out and comes back to the frontend at `/auth/login`, which shows only the "Sign in with VTK IAM" button and stays there: no request to the IAM starts until the button is clicked. The back button ends on `/auth/login` again: a page that the browser brings back from its history cache is loaded again (`pageshow` with `persisted`), so it never shows the name, the menu or the data of the person who signed out. A direct visit to a private page ends on the VTK IAM sign-in page.
9. Sign in at VTK IAM with an account that has no role in this application: the IAM shows its "Access denied" page, and its "Return to ..." button ends on `/auth/access?reason=access_denied` of the frontend with the "Access Denied" message, not on a JSON answer of the API host and not in a redirect loop. "Sign in with another account" goes straight to the VTK IAM sign-in form, without a "Sign out" page in between; signing in there with an account that has a role replaces the refused account at the IAM and ends on the start page of the frontend. "Try again" goes to the VTK IAM, which shows "Access denied" again until the account has a role. Changing the address to `/auth/access?reason=anything` shows the generic message only.
10. If the browser ends on `/auth/login?signInAttempt=1` with a warning, the session cookie did not reach the API: check that both hosts are on the same site and that the cookies are `Secure` with `SameSite=Lax`.

Rolling back: set the backend to legacy and restart it. Users reload the page, get the login form again and sign in with their old password.
