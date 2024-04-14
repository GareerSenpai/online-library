import express from "express";
import app from "../app.js";
import { registerUser } from "../controllers/user.register.js";

const router = express.Router();

router.route("/register").post(registerUser);
export default router;
