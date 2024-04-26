import express from "express";
import { verifyJWT, verifyEmail } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  editProfile,
  deleteProfile,
  verifyUserEmailAndRegister,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(registerUser);
router
  .route("/register/verify-email/:verificationToken")
  .get(verifyEmail, verifyUserEmailAndRegister);

// secure routes
router.route("/login").post(loginUser); // this controls the admin login as well
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/edit-profile").post(verifyJWT, editProfile);
router.route("/delete-profile").post(verifyJWT, deleteProfile);

export default router;
