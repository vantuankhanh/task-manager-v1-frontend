import Cookies from "js-cookie";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import { FormEvent, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import { login } from "../../services/login";
import { setLoading } from "../../store/reducer/reducer";
import { useAppDispatch } from "../../store/store";
import { checkLoggedStorage } from "../../utils/checkLoggedStorage";

const Login = () => {
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const emailRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);

  if (checkLoggedStorage()) {
    return <Navigate to="/" />;
  }

  const containerClassName = classNames(
    "p-input-filled surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
  );

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailRef.current) {
      const email = emailRef.current.value;

      if (!email || !password) {
        toast.error("Please enter email and password");
        return;
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        toast.error("Please enter a valid email");
        return;
      }

      try {
        dispatch(setLoading(true));
        const data = await login(email, password);
        dispatch(setLoading(false));

        if (data) {
          if (checked) {
            Cookies.set("login", "true", {
              expires: 7 + 7 / 24,
            });
          } else {
            Cookies.set("login", "true");
          }
          secureLocalStorage.setItem("refresh_token", data.refresh_token);

          toast.success("Signed in");
          nav("/");
        } else {
          dispatch(setLoading(false));
          return;
        }
      } catch (e) {
        dispatch(setLoading(false));
      }
    }
  };

  return (
    <div className={containerClassName}>
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <div className="text-center mb-5">
              <div className="text-900 text-3xl font-bold mb-3">WELCOME!</div>
              <span className="text-600 font-medium">Sign in to continue</span>
            </div>

            <form onSubmit={handleLogin}>
              <label
                htmlFor="email1"
                className="block text-900 text-xl font-medium mb-2"
              >
                Email
              </label>
              <InputText
                ref={emailRef}
                id="email1"
                type="text"
                placeholder="Email address"
                className="w-full md:w-30rem mb-5"
                style={{ padding: "1rem" }}
              />

              <label
                htmlFor="password"
                className="block text-900 font-medium text-xl mb-2"
              >
                Password
              </label>
              <Password
                inputId="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                toggleMask
                className="w-full mb-5"
                inputClassName="w-full p-3 md:w-30rem"
                feedback={false}
                autoComplete="off"
              ></Password>

              <div className="flex align-items-center justify-content-between mb-5 gap-5">
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="rememberme1"
                    checked={checked}
                    onChange={(e) => setChecked(e.checked ?? false)}
                    className="mr-2"
                  ></Checkbox>
                  <label htmlFor="rememberme1">Remember me</label>
                </div>
                <a
                  className="font-medium no-underline ml-2 text-right cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                  onClick={() => alert("Try to remember!!!")}
                >
                  Forgot password?
                </a>
              </div>

              <Button
                label="Sign In"
                className="w-full p-3 text-xl border-round-3xl"
              />
            </form>
            <div className="mt-6 text-center">
              Don't have an account? <Link to="/auth/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
