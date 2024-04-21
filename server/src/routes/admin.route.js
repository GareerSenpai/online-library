import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  removeBooks,
  addBooks,
  updateBooks,
  selectBooksToRemove,
} from "../controllers/admin.controller.js";

const router = Router();

// user db management routes

// book db management routes
router.route("/select-books-to-remove").post(verifyJWT, selectBooksToRemove);
router.route("/remove-books").post(verifyJWT, removeBooks);
router.route("/dashboard/add-books").post(verifyJWT, addBooks);
router.route("/dashboard/update-books").post(verifyJWT, updateBooks);

export default router;
