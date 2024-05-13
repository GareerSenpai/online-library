import React, { useRef, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

function AuthForm({ fields, type }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors },
  } = useForm();

  const apiSuccessMessage = useRef("");
  const apiErrorMessage = useRef("");
  const registerButtonRef = useRef(null);
  const showVerificationContext = useRef(false);
  const watchPassword = useRef("");
  const loginAs = useRef("");

  if (Object.keys(formErrors).length > 0) {
    showVerificationContext.current = false;
  }

  const authMutation = useMutation({
    mutationFn: async (formData) => {
      let authURL = "/api/v1/users";
      if (type.toLowerCase() === "register") {
        authURL += "/register";
      } else {
        authURL += "/login";
      }
      return await axios.post(authURL, formData);
    },
    onSuccess: (response) => {
      console.log(response.data.message);
      apiSuccessMessage.current = response.data.message;
    },
    onError: (error) => {
      const regex = /Error:(.*?)<br>/;
      const match = error.response.data.match(regex);
      const errorMessage = match ? match[1].trim() : undefined;
      console.log(errorMessage);
      apiErrorMessage.current = errorMessage;
    },
  });

  const { isError, isSuccess, isPending, error } = authMutation;

  const onSubmit = (data) => {
    // e.preventDefault();
    data = { ...data, loginAs: loginAs.current };
    authMutation.mutate(data);
  };

  return (
    <div className="auth-form">
      <h1 className="auth-title">{type.toUpperCase()}</h1>
      <form action="" onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field) => (
          <div className="field" key={field.name}>
            <input
              type={
                field.name.toLowerCase().includes("password")
                  ? "password"
                  : "text"
              }
              id={field.name}
              placeholder={field.placeholder}
              // onChange is not working for some reason so onKeyUp is used
              onKeyUp={(e) => {
                if (field.name.toLowerCase() === "password") {
                  watchPassword.current = e.target.value;
                }
              }}
              // name={field.name}
              {...register(field.name, {
                ...(field.validations.required && {
                  required: `${field.placeholder} is required`,
                }),
                ...(field.name.toLowerCase() === "email" && {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }),
                ...(field.name.toLowerCase() === "password" && {
                  // min req: 1 number, 1 special character, length = 6
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  pattern: {
                    value:
                      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/i,
                    message:
                      "Password must contain atleast 1 number, 1 special character, and a minimum length of 6",
                  },
                }),
                ...(field.name.toLowerCase() === "confirmpassword" && {
                  validate: (value) => {
                    if (value !== watchPassword.current) {
                      return "Passwords do not match";
                    } else if (formErrors.password) {
                      return "Password must be valid";
                    }
                  },
                }),
              })}
            />
            <p className="field-error">{formErrors[field.name]?.message}</p>
          </div>
        ))}
        <div className="field">
          <button
            ref={registerButtonRef}
            type="submit"
            className="submit-button"
            name={type.toLowerCase() === "login" ? "loginAs" : ""}
            value={type.toLowerCase() === "login" ? "user" : ""}
            onClick={(e) => {
              loginAs.current = e.target.value;
              if (type.toLowerCase() === "register") {
                // setRegisterButtonClicked(true);
                showVerificationContext.current = true;
              }
            }}
            disabled={isPending}
          >
            {type.toLowerCase() === "login" ? "Login as USER" : "Register"}
          </button>
          {type.toLowerCase() === "login" && (
            <button
              type="submit"
              className="submit-button"
              name="loginAs"
              value="admin"
              onClick={(e) => (loginAs.current = e.target.value)}
              disabled={isPending}
            >
              Login as ADMIN
            </button>
          )}
        </div>
        {isError ? (
          <p
            className="field-error"
            style={{
              fontSize: "1.5vw",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {apiErrorMessage.current}
          </p>
        ) : (
          showVerificationContext.current && (
            <>
              <p>Please verify your email before continuing...</p>
              <p>
                Did not receive verification email?{" "}
                <a href="#" onClick={() => registerButtonRef.current.click()}>
                  Resend
                </a>
              </p>
            </>
          )
        )}
      </form>
      <DevTool control={control} />
    </div>
  );
}

export default AuthForm;
