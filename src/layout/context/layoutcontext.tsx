import { createContext, useEffect, useState } from "react";
import {
  ChildContainerProps,
  LayoutConfig,
  LayoutContextProps,
  LayoutState,
} from "../../types";
export const LayoutContext = createContext({} as LayoutContextProps);

export const LayoutProvider = ({ children }: ChildContainerProps) => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    ripple: true,
    inputStyle: "outlined",
    menuMode: "static",
    colorScheme: "light",
    theme: "lara-light-cyan",
    scale: 14,
  });

  const [layoutState, setLayoutState] = useState<LayoutState>({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  });

  const onMenuToggle = () => {
    if (isOverlay()) {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        overlayMenuActive: !prevLayoutState.overlayMenuActive,
      }));
    }

    if (isDesktop()) {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive,
      }));
    } else {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive,
      }));
    }
  };

  const showProfileSidebar = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      profileSidebarVisible: !prevLayoutState.profileSidebarVisible,
    }));
  };

  const isOverlay = () => {
    return layoutConfig.menuMode === "overlay";
  };

  const isDesktop = () => {
    return window.innerWidth > 1159.9;
  };

  useEffect(() => {
    const closeProfileSidebar = () =>
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        profileSidebarVisible: false,
      }));

    window.addEventListener("resize", closeProfileSidebar);

    return () => window.removeEventListener("resize", closeProfileSidebar);
  }, []);

  const value: LayoutContextProps = {
    layoutConfig,
    setLayoutConfig,
    layoutState,
    setLayoutState,
    onMenuToggle,
    showProfileSidebar,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};
