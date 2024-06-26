const DB_NAME = "libraryDB";
const BOOKS_API_BASE_URL = "https://gutendex.com/";
const MONGODB_LOCAL_URI_STANDALONE = "mongodb://127.0.0.1:27017";
const MONGODB_LOCAL_URI_REPL_ENABLED =
  "mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019";
const RETURN_DATE_IN_DAYS = 14;
const BORROW_LIMIT_PER_WEEK = 3;
const FINE_PER_DAY = 5;
const DATE_FORMAT = "dd/MM/yyyy, HH:mm:ss";

export {
  DB_NAME,
  BOOKS_API_BASE_URL,
  MONGODB_LOCAL_URI_STANDALONE,
  RETURN_DATE_IN_DAYS,
  FINE_PER_DAY,
  BORROW_LIMIT_PER_WEEK,
  DATE_FORMAT,
  MONGODB_LOCAL_URI_REPL_ENABLED,
};
