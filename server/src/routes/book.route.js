import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchBooks } from "../controllers/book.controller.js";
import { borrowBook, returnBook } from "../controllers/book.controller.js";

const router = Router();
router.route("/fetch").get(fetchBooks);
router.route("/borrow-book/:bookId").post(verifyJWT, borrowBook);
router.route("/return-book/:bookId").post(verifyJWT, returnBook);

export default router;
