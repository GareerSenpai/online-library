import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    author: {
      type: [String],
      default: [],
      required: true,
    },
    coverImageURL: {
      type: String,
    },
    description: {
      type: String,
    },
    genre: {
      type: [String],
      default: [],
    },
    availabilityCount: {
      type: Number,
    },
    borrowedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    fine: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    reservationList: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);
// reservationList will act like a queue

bookSchema.index({ title: 1, author: 1 }, { unique: true });

export const Book = mongoose.model("Book", bookSchema);
