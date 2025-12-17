const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  recipeName: { type: String, },
  videoUrl: { type: String }, 
  photoUrl: [{ type: String }], 
  instructions: { type: String, },
  ingredients: [
    {
      name: { type: String, required: true },
    quantity: { type: Number, default: 0, min: 0 },
      unit: { type: String,default: "" },
    },
  ],
  description: { type: String },
  timeDuration: { type: String }, 
  mealType: {
    type: [String],
    enum: ["Breakfast", "Lunch", "Dinner"],
  },
  foodPreference: {
    type: String,
    enum: ["Veg", "Non-Veg"],
  },
  comments: [
   { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  ],
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ],
  ratings: [
  { type: mongoose.Schema.Types.ObjectId, ref: "Rating" },
  ],
  averageRating: { type: Number, default: 0 },
  
},{timestamps: true});

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
