import React from "react";
import AppConfig from "../AppConfig";

interface SimpleLayoutProps {
  children: React.ReactNode;
}

const LayoutFull = ({ children }: SimpleLayoutProps) => {
  return (
    <>
      {children}
      <AppConfig simple />
    </>
  );
};

export default LayoutFull;
