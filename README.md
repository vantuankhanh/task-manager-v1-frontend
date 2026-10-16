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

## Sign-in

VTK IAM signs people in, through the backend:

| | |
| --- | --- |
| Sign in | Full-page navigation to `{VITE_BASE_URL}/auth/login?returnTo=<path>`; the sign-in itself happens at VTK IAM |
| Session | httpOnly cookies on the API host; the browser code never holds a token and writes nothing to localStorage, sessionStorage or cookies. On load it removes what the old sign-in may have left behind (the `@secure.*` keys of localStorage and the `login` cookie) |
| API calls | `withCredentials`, no `Authorization` header |
| On a 401 | `POST /auth/refresh` once (shared by concurrent requests), then one retry; a 401 from the refresh goes to the sign-in, a 503 shows an error |
| Current user | `GET /me` (`{ id, name, email, role }`), fetched on page load and again after every session refresh, so a role changed in the VTK IAM console reaches the menu and the pages without a reload (at most one access token lifetime later) |
| Sign out | `POST /auth/logout`, then the browser goes to the `redirectUrl` of the answer; the IAM sends it back to `/auth/login`, which shows the sign-in button and never goes to the IAM by itself |
| Failed sign-in | The backend sends the browser to `/auth/access?reason=access_denied` (the account has no role in this application) or `/auth/access?reason=sign_in_failed` (anything else). The page is public, shows a fixed message per reason (never text of the address bar) and offers "Try again" and "Sign in with another account" (full-page navigation to `{VITE_BASE_URL}/auth/login?returnTo=/&prompt=login`, so the IAM shows its sign-in form instead of reusing the refused account) |
| Create user, signup, change role, delete user | Managed in the VTK IAM console. Editing a user stays here |

The code is in `src/auth`: `authentication.ts` is the one interface the pages use (current user, isAdmin, signIn, signOut, the axios instance), `iamAuthenticationProvider.ts` implements it. A failure to load the current user shows a "Sign-in is unavailable" page with a retry button.

The sign-in this application did itself (the login and signup forms, the tokens in react-secure-storage, the `GET /api/auth/config` mode switch) was removed in milestone M9 of VTK IAM, on 2026-10-16.

### Build-time environment

The build reads `.env` (Vite):

| Name | Meaning |
| --- | --- |
| `VITE_BASE_URL` | API base including `/api`, for example `https://api-taskmanager-v1.vantuankhanh.com/api`. The frontend and the API must be on the same site (same registrable domain, both `https`). |
| `VITE_API_USER` | Path of the user routes |
| `VITE_API_PROJECT` | Path of the project routes |
| `VITE_API_TASK` | Path of the task routes |
| `VITE_API_GET_TASK_BY_PROJECT`, `VITE_API_GET_TASK_BY_USER`, `VITE_API_GET_PROJECT_BY_USER` | Paths of the lookup routes |

A variable set in the environment wins over `.env`, so a local backend needs no edit of `.env`: `VITE_BASE_URL=http://localhost:8000/api pnpm exec vite --port 5174 --strictPort` (the port must be the one in the backend's `FRONTEND_BASE_URL`).

### What to check in the browser

1. Open the frontend in a private window of Chrome or Edge. The network tab shows `me` and `auth/refresh` answering 401, and the browser lands on the VTK IAM sign-in without a login form of this application flashing by.
2. After signing in, the browser is back on the page that was asked for, and the `?signInAttempt=1` marker is gone from the address bar. If it stays on the VTK IAM sign-in page after a correct password and the console shows a `form-action` Content Security Policy error, the IAM does not allow the frontend host yet: see "Before you start" in the backend's `docs/IAM-MIGRATION.md`.
3. DevTools, Application tab: Local Storage and Session Storage of the frontend origin are empty, and the frontend origin has no cookie, also in a browser that had a session of the old sign-in. The API host has httpOnly cookies only (`document.cookie` in the console shows no token).
4. Network tab: API requests carry cookies and no `Authorization` header, and their responses have `Access-Control-Allow-Origin` equal to the frontend origin and `Access-Control-Allow-Credentials: true`.
5. The name in the top bar and the menu match the role given in the VTK IAM console: an admin sees the User page, a user does not. After a role change in the console the menu follows at the next `auth/refresh` (the request after it is `me`), without a reload.
6. The User page shows the note about the VTK IAM console and has no "Create" button, no change-role button and no delete button; the edit button is still there. `/auth/signup` shows the not found page.
7. Delete the `access_token` cookie of the API host, then click around: one `auth/refresh` request appears and the page keeps working.
8. Logout goes through the VTK IAM sign-out and comes back to the frontend at `/auth/login`, which shows only the "Sign in with VTK IAM" button and stays there: no request to the IAM starts until the button is clicked. The back button ends on `/auth/login` again: a page that the browser brings back from its history cache is loaded again (`pageshow` with `persisted`), so it never shows the name, the menu or the data of the person who signed out. A direct visit to a private page ends on the VTK IAM sign-in page.
9. Sign in at VTK IAM with an account that has no role in this application: the IAM shows its "Access denied" page, and its "Return to ..." button ends on `/auth/access?reason=access_denied` of the frontend with the "Access Denied" message, not on a JSON answer of the API host and not in a redirect loop. "Sign in with another account" goes straight to the VTK IAM sign-in form, without a "Sign out" page in between; signing in there with an account that has a role replaces the refused account at the IAM and ends on the start page of the frontend. "Try again" goes to the VTK IAM, which shows "Access denied" again until the account has a role. Changing the address to `/auth/access?reason=anything` shows the generic message only.
10. If the browser ends on `/auth/login?signInAttempt=1` with a warning, the session cookie did not reach the API: check that both hosts are on the same site and that the cookies are `Secure` with `SameSite=Lax`.
