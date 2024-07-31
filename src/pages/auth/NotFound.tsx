import { Button } from "primereact/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="h-screen flex flex-column align-items-center justify-content-center">
      <div
        style={{
          borderRadius: "56px",
          padding: "0.3rem",
          background: `
          linear-gradient(180deg, rgba(33, 150, 243, 0.4) 10%, rgba(33, 150, 243, 0) 30%),
          linear-gradient(360deg, rgba(33, 150, 243, 0.4) 10%, rgba(33, 150, 243, 0) 30%)
          `,
        }}
      >
        <div
          className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center"
          style={{ borderRadius: "53px" }}
        >
          <span className="text-blue-500 font-bold text-3xl">404</span>
          <h1 className="text-900 font-bold text-5xl mb-2">Not Found</h1>
          <div className="text-600 mb-5">
            The page you are looking for is not available
          </div>

          <div className="w-full flex align-items-center justify-content-center mb-5">
            <Link to="/">
              <Button icon="pi pi-home pi-fw text-50 text-2xl">
                <p>Home</p>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
