import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    const verificationToken = req.params.verificationToken;

    if (!verificationToken) {
      throw new ApiError(400, "Invalid verification token");
    }

    const decodedToken = jwt.verify(
      verificationToken,
      process.env.VERIFICATION_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(400, "Invalid verification token");
    }

    const user = {
      fullName: decodedToken.fullName,
      email: decodedToken.email,
      username: decodedToken.username,
      password: decodedToken.password,
    };

    req.registerUser = user;
    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid verification token");
  }
});

export { verifyJWT, verifyEmail };
