import { Router } from "express";
import { fetchBooks } from "../controllers/book.controller.js";

const router = Router();
router.route("/fetch").post(fetchBooks);

export default router;
