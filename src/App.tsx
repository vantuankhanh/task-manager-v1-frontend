import { ToastContainer } from "react-toastify";
import Loading from "./components/Loading/Loading";
import useScrollToTop from "./hooks/use-scroll-to-top";
import Router from "./routes/routes";

const App = () => {
  useScrollToTop();

  return (
    <>
      {/* The authentication gate sits inside Router, so /privacy renders without it (ADR-020 of VTK IAM). */}
      <Router />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        limit={3}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
      />
      <Loading />
    </>
  );
};

export default App;
