import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  fetchAuthors,
  fetchBooks,
  fetchGenres,
} from "../controllers/book.controller.js";
import { borrowBook, returnBook } from "../controllers/book.controller.js";

const router = Router();
router.route("/fetch").get(fetchBooks);
router.route("/borrow-book/:bookId").post(verifyJWT, borrowBook);
router.route("/return-book/:bookId").post(verifyJWT, returnBook);
router.route("/filter/fetch-genres").get(fetchGenres);
router.route("/filter/fetch-authors").get(fetchAuthors);

export default router;
