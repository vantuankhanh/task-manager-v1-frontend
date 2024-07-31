import { useEffect } from "react";
import usePathname from "./use-pathname";

const useScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default useScrollToTop;
