import { asyncHandler } from "../utils/asyncHandler.js";
import { Book } from "../models/book.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const fetchBooks = asyncHandler(async (req, res) => {
  try {
    const { page, limit } = req.query;

    const startIndex = (parseInt(page) - 1) * 10;
    const maxLimit = parseInt(limit) || 10;

    if (isNaN(startIndex) || isNaN(maxLimit)) {
      throw new ApiError(400, "Invalid page or limit");
    }

    const bookList = await Book.find().skip(startIndex).limit(maxLimit);
    res
      .status(200)
      .json(new ApiResponse(200, bookList, "Books fetched successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Error while fetching books",
      error.errors
    );
  }
});

export { fetchBooks };
