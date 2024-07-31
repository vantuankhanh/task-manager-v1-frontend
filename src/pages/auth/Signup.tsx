import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import { FormEvent, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createUser } from "../../services/userService";
import { setLoading } from "../../store/reducer/reducer";
import { useAppDispatch } from "../../store/store";
import { checkLoggedStorage } from "../../utils/checkLoggedStorage";

const Signup = () => {
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");

  if (checkLoggedStorage()) {
    return <Navigate to="/" />;
  }

  const containerClassName = classNames(
    "p-input-filled surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
  );

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailRef.current && nameRef.current) {
      const email = emailRef.current.value;
      const name = nameRef.current.value;

      if (!email || !name || !password) {
        toast.error("Please enter email, name and password");
        return;
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        toast.error("Please enter a valid email");
        return;
      }

      try {
        dispatch(setLoading(true));
        const res = await createUser({ email, name, password });
        if (res) {
          nav("/auth/login");
        }

        dispatch(setLoading(false));
      } catch {
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
              <div className="text-900 text-3xl font-bold mb-3">SIGN UP</div>
              <span className="text-600 font-medium">
                Be a part of our website
              </span>
            </div>

            <form onSubmit={handleLogin} autoComplete="off">
              <div>
                <label
                  htmlFor="email1"
                  className="block text-900 text-xl font-medium mb-2"
                >
                  Email
                </label>
                <InputText
                  ref={emailRef}
                  type="text"
                  autoComplete="off"
                  placeholder="Email address"
                  className="w-full md:w-30rem mb-5"
                  style={{ padding: "1rem" }}
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-900 text-xl font-medium mb-2"
                >
                  Name
                </label>
                <InputText
                  ref={nameRef}
                  type="text"
                  autoComplete="off"
                  placeholder="Your name"
                  className="w-full md:w-30rem mb-5"
                  style={{ padding: "1rem" }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-900 font-medium text-xl mb-2"
                >
                  Password
                </label>
                <Password
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  toggleMask
                  className="w-full mb-5"
                  inputClassName="w-full p-3 md:w-30rem"
                ></Password>
              </div>

              <div className="flex justify-content-between gap-4">
                <Button
                  label="Back"
                  severity="secondary"
                  className="w-full p-3 text-xl border-round-3xl"
                  onClick={() => nav("/auth/login")}
                />
                <Button
                  label="Sign Up"
                  className="w-full p-3 text-xl border-round-3xl"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
