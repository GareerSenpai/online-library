import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      index: true,
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
    language: {
      type: String,
    },
    genre: {
      type: [String],
      default: [],
    },
    availabilityCount: {
      type: Number,
    },
    readOnlineURL: {
      type: String,
      default: "",
    },
    borrowedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
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

export const Book = mongoose.model("Book", bookSchema);
