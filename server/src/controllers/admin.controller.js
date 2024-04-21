import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const selectBooksToRemove = asyncHandler(async (req, res) => {
  //check if user is admin through tokens
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User needs to login as admin again");
  }

  if (user.loggedInAs.toLowerCase() !== "admin") {
    throw new ApiError(401, "User is not an admin");
  }

  // searching for book to delete
  const { bookId, title } = req.body;

  if (!bookId && !title) {
    throw new ApiError(400, "Either bookId or title is required");
  }

  const selectedBooks = await Book.find({
    $or: [{ _id: bookId }, { title }],
  });

  res
    .status(200)
    .json(new ApiResponse(200, selectedBooks, "Books fetched successfully"));
});

const removeBooks = asyncHandler(async (req, res) => {
  //check if user is admin through tokens
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User needs to login as admin again");
  }

  if (user.loggedInAs.toLowerCase() !== "admin") {
    throw new ApiError(401, "User is not logged in as admin");
  }

  const { books } = req.body;

  if (!books) {
    throw new ApiError(
      400,
      "No books selected. Please select at least one book"
    );
  }

  const booksToRemove = await Book.find({
    _id: {
      $in: books,
    },
  });

  if (!booksToRemove) {
    throw new ApiError(404, "No books found");
  }

  await Book.deleteMany({
    _id: {
      $in: books,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        booksToRemove,
        `${booksToRemove.length} Books removed successfully`
      )
    );
});

const addBooks = asyncHandler(async (req, res) => {});

const updateBooks = asyncHandler(async (req, res) => {});

export { selectBooksToRemove, removeBooks, addBooks, updateBooks };
