const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    set: (value) =>
      typeof value === "string" && value.length > 0
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : value,
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
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
  },
  type: {
    type: String,
    required: [true, "Type is required"],
    enum: ["user", "admin", "doctor"], // optional: restrict values
  },
  notification: {
    type: Array,
    default: [],
  },
  seennotification: {
    type: Array,
    default: [],
  },
  isdoctor: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("user", userSchema);
