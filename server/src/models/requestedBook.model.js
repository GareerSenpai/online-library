import mongoose from "mongoose";

const requestedBookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      index: true,
    },
    author: {
      type: [String],
      default: [],
      required: [true, "Author is required"],
    },
    genre: {
      type: String,
    },
    requestedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      required: true,
    },
  },
  { timestamps: true }
);

requestedBookSchema.index({ title: 1, author: 1 }, { unique: true });

export const RequestedBook = mongoose.model(
  "RequestedBook",
  requestedBookSchema
);
