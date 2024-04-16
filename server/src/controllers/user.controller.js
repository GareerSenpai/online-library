import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

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

  const { fullName, username, email, password } = req.body;
  if (
    [fullName, username, email, password].some((data) => data.trim() === "")
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

  const user = await User.create({
    fullName,
    username,
    email,
    password,
  });
  // console.log("User created successfully: ", user);

  const registeredUser = await User.findById(user._id).select(
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

  const { username, email, password, loginAs } = req.body;
  // console.log(username);

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  } else if (email && !email.includes("@")) {
    throw new ApiError(400, "Email is not valid");
  } // validate password

  const user = await User.findOne({
    $or: [{ username }, { email }],
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
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  // remove refresh Token from databae
  // remove cookies containing access and refresh tokens
  // send response

  const user = await User.findByIdAndUpdate(req.user.id, {
    refreshToken: undefined,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
