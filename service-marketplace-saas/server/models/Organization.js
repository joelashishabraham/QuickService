const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["customer","provider","admin"], default: "customer" },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetToken: String,
  resetTokenExpire: Date,
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [0,0] }
  }
},{timestamps:true});

schema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", schema);