import "dotenv/config";
import express from "express";
import cron from "node-cron";
import connectDB from "./db/index.js";
import app from "./app.js";
import { fetchBookData } from "./API/bookFetchAPI.js";
import { addBooksToDatabase } from "./utils/databaseCRUD/addBooksToDatabase.js";
import updateBookBorrowCount from "./scheduled_jobs/updateBookBorrowCount.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error in app: ", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running on port: ", process.env.port || 8000);
    });
  })
  .catch((error) => console.log("MongoDB connection FAILED!!", error));

fetchBookData()
  .then((books) => addBooksToDatabase(books))
  .catch((error) => console.log("Error while fetching books data: ", error));

cron.schedule("0 0 * * 1", updateBookBorrowCount); // update borrow count every week on Monday 00:00
