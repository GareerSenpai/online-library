import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGODB connected at port: ${connectionInstance.connection.port}`
    );
  } catch (error) {
    console.log("MONGODB Connection FAILED!", error);
  }
};

export default connectDB;
