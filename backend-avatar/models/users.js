const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordToken: { type: String },
  expiry: { type: Date },

   //  PROFILE FIELDS
  name: { type: String },           // Display name
  bio: { type: String, maxLength: 150 },
  avatar: { type: String },         // image URL
  location: { type: String },


  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  
  followings: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  recipes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
  ],
   avatar: [{ type: String }],
  recipeCount: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
