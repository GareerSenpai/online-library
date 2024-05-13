import React from "react";
import AuthForm from "./AuthForm.jsx";
import { setAuthType } from "../features/auth/authSlice.js";
import { useSelector, useDispatch } from "react-redux";

function AuthPage() {
  const authType = useSelector((state) => state.auth.authType);
  const dispatch = useDispatch();
  return (
    <div className="auth-page">
      <div className="authbook-img">
        <img src="../auth-book.png" alt="auth-site" />
        <div className="form-page">
          {authType === "register" ? (
            <AuthForm
              key={"register"}
              type="Register"
              fields={[
                {
                  name: "fullName",
                  placeholder: "Fullname",
                  validations: { required: true },
                },
                {
                  name: "username",
                  placeholder: "Username",
                  validations: { required: true },
                },
                {
                  name: "email",
                  placeholder: "Email",
                  validations: { required: true },
                },
                {
                  name: "password",
                  placeholder: "Password",
                  validations: { required: true },
                },
                {
                  name: "confirmPassword",
                  placeholder: "Confirm Password",
                  validations: { required: true },
                },
              ]}
            />
          ) : (
            <AuthForm
              key={"login"}
              type="Login"
              fields={[
                {
                  name: "usernameOrEmail",
                  placeholder: "Username / Email",
                  validations: { required: true },
                },
                {
                  name: "password",
                  placeholder: "Password",
                  validations: { required: true },
                },
              ]}
            />
          )}
        </div>
        <div className="choose-auth-page">
          <div className="flex-wrapper">
            {authType === "register" ? (
              <>
                <p>Already have an account?</p>
                <button onClick={() => dispatch(setAuthType("login"))}>
                  Login
                </button>
              </>
            ) : (
              <>
                <p>Don't have an account?</p>
                <button onClick={() => dispatch(setAuthType("register"))}>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
