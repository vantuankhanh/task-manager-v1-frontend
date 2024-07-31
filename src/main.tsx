import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.tsx";
import LoadingLazy from "./components/Loading/LoadingLazy.tsx";
import "./index.css";
import { LayoutProvider } from "./layout/context/layoutcontext.tsx";
import { store } from "./store/store.ts";
import "./style/layout/layout.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PrimeReactProvider>
      <LayoutProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingLazy />}>
            <App />
          </Suspense>
        </BrowserRouter>
      </LayoutProvider>
    </PrimeReactProvider>
  </Provider>
);
