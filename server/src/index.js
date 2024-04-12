import "dotenv/config";
import express from "express";
import connectDB from "../db/index.js";

const app = express();

connectDB();

// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
