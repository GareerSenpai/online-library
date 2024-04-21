import { User } from "../models/user.model.js";

const updateBookBorrowCount = async () => {
  try {
    await User.updateMany(
      {},
      {
        $set: {
          borrowCountThisWeek: 0,
        },
      }
    );
    console.log("Successfully updated borrowCountThisWeek for all users");
  } catch (error) {
    console.log("Error updating borrowCountThisWeek:", error);
  }
};

export default updateBookBorrowCount;
