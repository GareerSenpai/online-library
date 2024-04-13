import mongoose from "mongoose";
import { DB_NAME, MONGODB_LOCAL_URI } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${MONGODB_LOCAL_URI}`, {
      dbName: DB_NAME,
    });
    console.log(
      `\n MONGODB connected at host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB Connection FAILED!", error);
  }
};

export default connectDB;
