import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json({ limit: "16kb", extended: true }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));

// import routes
import userRouter from "./routes/user.route.js";
import bookRouter from "./routes/book.route.js";
import adminRouter from "./routes/admin.route.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/books", bookRouter);

export default app;
