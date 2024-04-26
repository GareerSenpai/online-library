import { asyncHandler } from "../utils/asyncHandler.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  RETURN_DATE_IN_DAYS,
  BORROW_LIMIT_PER_WEEK,
  DATE_FORMAT,
  FINE_PER_DAY,
} from "../constants.js";
import {
  format as formatDate,
  parse as parseDate,
  differenceInDays,
  addDays,
} from "date-fns";
import mongoose from "mongoose";

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
  const bookId = req.body.bookId || req.params.bookId;

  const book = await Book.findById(bookId);
  if (!book || book.availabilityCount === 0) {
    throw new ApiError(400, "Book is not available");
  }
  if (
    user.subscription.toLowerCase() === "free" &&
    user.borrowCountThisWeek >= BORROW_LIMIT_PER_WEEK
  ) {
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
    const issueDate = formatDate(new Date(), DATE_FORMAT);
    const returnDate = formatDate(
      addDays(new Date(), RETURN_DATE_IN_DAYS),
      DATE_FORMAT
    );

    user.borrowedBooks.push({
      bookId,
      returnDate,
    });
    user.history.unshift({
      bookId,
      dateIssued: issueDate,
    });
    user.borrowCountThisWeek += 1;

    book.availabilityCount -= 1;
    // throw new Error("Transaction failed (deliberate error)");
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

const returnBook = asyncHandler(async (req, res) => {
  //
  // check for fine
  // if no fine, then return book, else pay fine first
  // update borrowedBy field in book model
  // update borrowedBooks and history field in user model
  //send res

  const user = req.user;
  const { bookId } = req.body || req.params;

  const borrowedBookInDB = await Book.findById(bookId);
  if (!borrowedBookInDB) {
    throw new ApiError(404, "Book not found in db");
  }

  const borrowedBookThatUserHas = user.borrowedBooks.find(
    (book) => book.bookId.toString() === bookId
  );
  if (!borrowedBookThatUserHas) {
    throw new ApiError(400, "User has not borrowed that book");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentDate = new Date();
    const returnDate = parseDate(
      borrowedBookThatUserHas.returnDate,
      DATE_FORMAT,
      new Date()
    );
    const daysToBeFined = differenceInDays(currentDate, returnDate);
    const fine = daysToBeFined > 0 ? daysToBeFined * FINE_PER_DAY : 0;
    if (fine > 0) {
      // pay fine logic
      throw new ApiError(402, `User has to pay the fine first: Rs. ${fine}`);
    }

    user.borrowedBooks = user.borrowedBooks.filter(
      (book) => book.bookId.toString() !== bookId
    );
    user.history.find(
      (book) => book.bookId.toString() === bookId
    ).returnStatus = true;

    borrowedBookInDB.borrowedBy = borrowedBookInDB.borrowedBy.filter(
      (userId) => userId.toString() !== user._id.toString()
    );
    borrowedBookInDB.availabilityCount += 1;

    await user.save({ session, validateBeforeSave: false });
    await borrowedBookInDB.save({ session, validateBeforeSave: false });
    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          borrowedBookInDB,
          `Book (id: ${bookId}) returned successfully by User (id: ${user._id})`
        )
      );
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw new ApiError(
      500,
      error?.message || "Internal Server Error",
      error?.errors
    );
  }
});

export { fetchBooks, borrowBook, returnBook };
