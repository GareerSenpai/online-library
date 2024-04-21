const DB_NAME = "libraryDB";
const BOOKS_API_BASE_URL = "https://gutendex.com/";
const MONGODB_LOCAL_URI = "mongodb://127.0.0.1:27017";
const RETURN_DATE_IN_DAYS = 14;
const BORROW_LIMIT_PER_WEEK = 3;
const FINE_PER_DAY = 5;
const DATE_OPTIONS = {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
}; // log -> dd/mm/yyyy, hh:mm:ss

export {
  DB_NAME,
  BOOKS_API_BASE_URL,
  MONGODB_LOCAL_URI,
  RETURN_DATE_IN_DAYS,
  FINE_PER_DAY,
  BORROW_LIMIT_PER_WEEK,
  DATE_OPTIONS,
};
