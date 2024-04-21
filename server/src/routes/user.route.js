import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  borrowBook,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(registerUser);

// secure routes
router.route("/login").post(loginUser); // this controls the admin login as well
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/borrow-book").post(verifyJWT, borrowBook);

export default router;
