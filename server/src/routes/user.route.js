import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(registerUser);

// secure routes
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
