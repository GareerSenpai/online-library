import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { sendMailVerification } from "../utils/sendMailVerification.js";
// import { Book } from "../models/book.model.js";

// this function also saves the new refresh token in user db
const generateAccessAndRefreshToken = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  // validate user
  // check if user exists in database
  // add user to database
  // remove password and refresh token from response
  // send response

  if (req.cookies?.accessToken) {
    throw new ApiError(401, "User is already logged in");
  }

  const { fullName, username, email, password, confirmPassword } = req.body;
  if (
    [fullName, username, email, password, confirmPassword].some(
      (data) => data.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  } else if (!email.includes("@")) {
    throw new ApiError(400, "Email is not valid");
  } // set password validations if any

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  const verificationURL =
    "http://localhost:3000/api/v1/users/register/verify-email";
  await sendMailVerification(
    {
      fullName,
      username,
      email,
      password,
    },
    verificationURL
  );

  if (!req.verifiedUser) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Please verify your email before continuing..."
        )
      );
  }

  // const user = await User.create({
  //   fullName,
  //   username,
  //   email,
  //   password,
  // });

  // const registeredUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );

  // res
  //   .status(201) // we are using status here as well because postman looks for the status code exactly here instead of like in ApiResponse we are sending
  //   .json(new ApiResponse(201, registeredUser, "User created successfully"));
});

const verifyUserEmailAndRegister = asyncHandler(async (req, res) => {
  const user = req.verifiedUser;
  if (!user) {
    throw new ApiError(404, "Email verification failed! Try again...");
  }
  const { fullName, username, email, password } = user;

  const newUser = await User.create({
    fullName,
    username,
    email,
    password,
  });

  const registeredUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  res
    .status(201) // we are using status here as well because postman looks for the status code exactly here instead of like in ApiResponse we are sending
    .json(new ApiResponse(201, registeredUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  // validate user
  // check password
  // check if user exists in database
  // generate access and refresh tokens
  // set access and refresh tokens in cookie
  // set refresh token to database
  // remove password and refresh token from response
  // send cookie and response

  if (req.cookies?.accessToken) {
    throw new ApiError(401, "User is already logged in");
  }

  const { usernameOrEmail, password, loginAs } = req.body;

  if (!usernameOrEmail) {
    throw new ApiError(400, "Username or email is required");
  } // TODO: validate password

  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!user) {
    throw new ApiError(401, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  /* note that the user defined functions can be only used by an instance of the model ("user" in this case)
   and not on the model ("User" in this case) itself. The model itself can only use pre-defined functions like
   insertMany, updateMany, find, etc.
   That is why we did user.isPasswordCorrect(password) and not User.isPasswordCorrect(password)
  */

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (loginAs.toLowerCase() === "admin") {
    if (!user.isAdmin) {
      throw new ApiError(401, "User is not an admin");
    }
    user.loggedInAs = "admin";
  } else {
    user.loggedInAs = "user";
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user
  );

  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: user.isAdmin ? undefined : 1000 * 60 * 60 * 24 * 10, // 10 days if user is not admin else cookie acts as session cookie
    })
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: user.isAdmin ? undefined : 1000 * 60 * 60 * 24 * 1, // 1 day if user is not admin else cookie acts as session cookie
    })
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  // remove refresh Token from databae
  // remove cookies containing access and refresh tokens
  // send response

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { loggedInAs: "" },
      refreshToken: undefined,
    },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(
      new ApiResponse(
        200,
        {},
        `${req.user.loggedInAs.toUpperCase()} logged out successfully`
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // validate refresh token
  // re-generate access and refresh tokens (the function for this also updates the refresh token in the database)
  // send response

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "User has to log in again");
  }

  try {
    // decoding this instead of directly searching db through refresh token because of 2 main reasons:
    // Efficiency: after decoding we can search for user in db by id (indexed) instead of using refresh Token (non-indexed) to search
    // Security: in case that refresh token is tampered after it reaches backend server
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token: User does not exist");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid Refresh Token: User is not logged in");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user);

    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
      })
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken, refreshToken: newRefreshToken },
          "Access and Refresh token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const editProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    newFullName,
    newEmail,
    oldPassword,
    newPassword,
    confirmNewPassword,
  } = req.body;
  if (newFullName) user.fullName = newFullName;
  if (newEmail) {
    if (!newEmail.includes("@")) {
      throw new ApiError(400, "Invalid Email");
    }

    // implement email verification by sending verification link to new email
    user.email = newEmail;
  }
  if (oldPassword) {
    // do password verifications later (regex and stuff)
    //verify old password
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid old password");
    }

    // do password verifications later (regex and stuff)
    if (newPassword.trim() === "") {
      throw new ApiError(400, "New Password cannot be empty");
    }
    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, "New Password and Confirm Password do not match");
    }

    user.password = newPassword;
  }

  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});

const deleteProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { password } = req.body;
  if (!password) {
    throw new ApiError(400, "Password required to delete account!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  await User.deleteOne({ _id: user._id });
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse(200, user, "User account deleted successfully"));
});

const enterRecoveryEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email required");
  }
  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid Email");
  }

  const user = await User.findOne({ email }).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User with given email not found");
  }

  // TODO: implement email verification for password reset
  // for reset password --> change the url to something that the front-end would use...
  // the front-end can then make a post request to backend reset-password api route
  // handle the jwt carefully here as it may be vulnerable if provided in the url
  const verificationURL = "http://localhost:3000/api/v1/users/reset-password";
  await sendMailVerification(
    {
      username: user.username,
      email: user.email,
    },
    verificationURL
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Email sent successfully. Please verify email."
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = req.verifiedUser;
  if (!user) {
    throw new ApiError(404, "Email verification failed! Try again...");
  }

  const { password, confirmPassword } = req.body;
  if (!password) {
    throw new ApiError(400, "Password required");
  } // add more regex validations
  if (password !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password do not match");
  }

  const updatedUser = await User.findOne({
    username: user.username,
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  updatedUser.password = password;

  await updatedUser.save({ validateBeforeSave: false });

  updatedUser.password = undefined;
  updatedUser.refreshToken = undefined;

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Password updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  editProfile,
  deleteProfile,
  verifyUserEmailAndRegister,
  enterRecoveryEmail,
  resetPassword,
};
