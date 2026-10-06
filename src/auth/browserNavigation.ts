type FrontendNavigator = (frontendPath: string) => void;

let frontendNavigator: FrontendNavigator | null = null;

/**
 * Every navigation the authentication module starts goes through here, so
 * the router can take over in-application moves and tests can observe them.
 */
export const browserNavigation = {
  /** Lets the router move inside the application without a page reload. */
  registerFrontendNavigator(navigator: FrontendNavigator | null) {
    frontendNavigator = navigator;
  },

  goToFrontendPath(frontendPath: string) {
    if (frontendNavigator) {
      frontendNavigator(frontendPath);
    } else {
      window.location.assign(frontendPath);
    }
  },

  /** Full-page navigation, for the sign-in and sign-out round trips. */
  goToExternalUrl(externalUrl: string) {
    window.location.assign(externalUrl);
  },

  /** Starts the application again from the server, dropping everything it holds in memory. */
  reloadPage() {
    window.location.reload();
  },

  currentFrontendPath() {
    return window.location.pathname + window.location.search;
  },
};
