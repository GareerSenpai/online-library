import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      // when we will use save() method it will always check if password is provided
      // even if just one field is modified. So while saving we can use {validateBeforeSave: false} as an option
      // in the save method to prevent this.
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    loggedInAs: {
      type: String,
      default: undefined,
    },
    borrowedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        returnDate: {
          type: String,
          required: [true, "Please enter the return date"],
        },
      },
    ],
    borrowCountThisWeek: {
      type: Number,
      default: 0,
    },
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
    refreshToken: {
      type: String,
      default: undefined,
    },
  },
  { timestamps: true, strict: false }
);
// strict: false helps us to add fields in the doc which are not defined in the schema
// timestamps will give us createdAt and updatedAt

// so that user saves password in encrypted form whenever only password is modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// to be used when user wants to login
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
      isAdmin: this.isAdmin,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
