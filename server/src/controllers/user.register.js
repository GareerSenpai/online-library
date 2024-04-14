import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  // validate user
  // check if user exists in database
  // add user to database
  // remove password and refresh token from response
  // send response

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
  console.log("User created successfully: ", user);

  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(201) // we are using status here as well because postman looks for the status code exactly here instead of like in ApiResponse we are sending
    .send(new ApiResponse(201, responseUser, "User created successfully"));
});

export { registerUser };
