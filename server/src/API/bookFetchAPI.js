import { BOOKS_API_BASE_URL } from "../constants.js";
import ApiError from "../utils/ApiError.js";

// Gutenberg API (Gutendex)
const fetchBookData = async () => {
  try {
    const res = await fetch(`${BOOKS_API_BASE_URL}/books`);
    if (!res.ok) throw new Error("Error while fetching books data from API");
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.log(
      new ApiError(
        500,
        "Error while fetching books data from API",
        error.errors
      )
    );
  }
};

// Google Books API

export { fetchBookData };
