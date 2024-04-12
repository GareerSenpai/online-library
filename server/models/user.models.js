import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    borrowedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        returnDate: {
          type: Date,
          required: [true, "Please enter the return date"],
        },
        currentFine: {
          type: Number,
          default: 0,
        },
      },
    ],

    history: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        returnStatus: {
          type: Boolean,
          default: false,
        },
      },
    ],
    downloadedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
      },
    ],
    currentSubscription: {
      type: String,
      default: "Free",
    },
  },
  { timestamps: true }
);
// timestamps will give us createdAt and updatedAt

userSchema.index({ username: 1, email: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
