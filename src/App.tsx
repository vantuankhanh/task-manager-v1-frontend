import { ToastContainer } from "react-toastify";
import Loading from "./components/Loading/Loading";
import useScrollToTop from "./hooks/use-scroll-to-top";
import Router from "./routes/routes";

const App = () => {
  useScrollToTop();

  return (
    <>
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
