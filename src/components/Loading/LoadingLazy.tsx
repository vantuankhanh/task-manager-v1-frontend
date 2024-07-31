import { memo } from "react";

const LoadingLazy = memo(() => {
  return (
    <div
      className="h-screen w-screen fixed top-0 left-0 bg-bluegray-300 opacity-50"
      style={{ zIndex: 999 }}
    >
      <div className="h-full w-full gap-3 flex justify-content-center align-items-center">
        <div className="pi pi-spin pi-spinner"></div>
        <p className="text-lg font-bold">Loading...</p>
      </div>
    </div>
  );
});

export default LoadingLazy;
