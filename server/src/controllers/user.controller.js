import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Book } from "../models/book.model.js";
import {
  RETURN_DATE_IN_DAYS,
  BORROW_LIMIT_PER_WEEK,
  DATE_OPTIONS,
} from "../constants.js";
import mongoose from "mongoose";

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

  const { usernameOrEmail, password, loginAs } = req.body;
  // console.log(username);

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
      maxAge: user.isAdmin ? undefined : 1000 * 60 * 60 * 24 * 12, // 12 days if user is not admin else cookie acts as session cookie
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
        maxAge: 1000 * 60 * 60 * 24 * 12, // 12 days
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

const borrowBook = asyncHandler(async (req, res) => {
  // validate user
  // validate book
  // check if book is available
  // check if user already borrows that book
  // check if user has reached Book_Limit_Per_Week
  // update book
  // update user
  // send response

  const user = req.user;
  const { bookId } = req.body;
  const book = await Book.findById(bookId);
  if (!book || book.availabilityCount === 0) {
    throw new ApiError(400, "Book is not available");
  }
  if (user.borrowCountThisWeek >= BORROW_LIMIT_PER_WEEK) {
    throw new ApiError(400, "User cannot borrow more than 3 books per week");
  }

  const isBookAlreadyBorrowed = user.borrowedBooks.some(
    (borrowedBook) => borrowedBook.bookId.toString() === bookId
  );
  if (isBookAlreadyBorrowed) {
    throw new ApiError(400, "User has already borrowed that book");
  }

  // session is being used to maintain atomicity, i.e.,
  // if any of the operations fail, the whole transaction will be rolled back
  // it is usually used where multiple operations (may involve multiple collections) are involved
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const date = new Date();
    date.setDate(date.getDate() + RETURN_DATE_IN_DAYS);
    user.borrowedBooks.push({
      bookId,
      returnDate: date.toLocaleString("en-IN", DATE_OPTIONS),
    });
    user.borrowCountThisWeek += 1;

    book.availabilityCount -= 1;
    book.borrowedBy.push(user._id);

    await user.save({ session, validateBeforeSave: false });
    await book.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          book,
          `Book (id: ${bookId}) borrowed successfully by user (id: ${user._id})`
        )
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(
      500,
      error?.message || "Internal Server Error",
      error?.errors
    );
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, borrowBook };
