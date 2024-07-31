import { memo } from "react";
import { useAppSelector } from "../../store/store";

const Loading = memo(() => {
  const { isLoading } = useAppSelector((s) => s.loadingStore);

  return (
    <div
      className={`h-screen w-screen ${
        isLoading ? "fixed top-0 left-0 bg-bluegray-300 opacity-50" : "hidden"
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="h-full w-full gap-3 flex justify-content-center align-items-center">
        <div className="pi pi-spin pi-spinner"></div>
        <p className="text-lg font-bold">Loading...</p>
      </div>
    </div>
  );
});

export default Loading;
