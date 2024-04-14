import express from "express";

const app = express();

app.use(express.json({ limit: "16kb", extended: true }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));

// import routes
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);

export default app;
