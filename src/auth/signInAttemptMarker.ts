/**
 * The IAM sign-in comes back to "returnTo". The marker is added to that path
 * so that, when the browser is back and still not signed in (cookies blocked,
 * wrong cookie attributes), the application stops instead of sending the
 * browser to the sign-in again and again. It lives in the URL only: nothing
 * is written to any storage.
 */
const signInAttemptParameterName = "signInAttempt";

const splitFrontendPath = (frontendPath: string) => {
  const queryStartIndex = frontendPath.indexOf("?");
  return queryStartIndex === -1
    ? { pathname: frontendPath, search: "" }
    : {
        pathname: frontendPath.slice(0, queryStartIndex),
        search: frontendPath.slice(queryStartIndex + 1),
      };
};

export const hasSignInAttemptMarker = (search: string) =>
  new URLSearchParams(search).has(signInAttemptParameterName);

export const addSignInAttemptMarker = (frontendPath: string) => {
  const { pathname, search } = splitFrontendPath(frontendPath);
  const searchParameters = new URLSearchParams(search);
  searchParameters.set(signInAttemptParameterName, "1");
  return `${pathname}?${searchParameters.toString()}`;
};

export const removeSignInAttemptMarker = (frontendPath: string) => {
  const { pathname, search } = splitFrontendPath(frontendPath);
  const searchParameters = new URLSearchParams(search);
  searchParameters.delete(signInAttemptParameterName);
  const remainingSearch = searchParameters.toString();
  return remainingSearch ? `${pathname}?${remainingSearch}` : pathname;
};

export const signInPagePath = "/auth/login";

export const signInPagePathAfterFailedAttempt = addSignInAttemptMarker(signInPagePath);
