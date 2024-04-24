import mongoose from "mongoose";
import {
  DB_NAME,
  MONGODB_LOCAL_URI_STANDALONE,
  MONGODB_LOCAL_URI_REPL_ENABLED,
} from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGODB_LOCAL_URI_REPL_ENABLED}`,
      {
        dbName: DB_NAME,
        replicaSet: "rs",
      }
    );
    console.log(
      `\n MONGODB connected at host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB Connection FAILED!", error);
  }
};

export default connectDB;
