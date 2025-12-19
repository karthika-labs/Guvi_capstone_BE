const mongoose = require("mongoose");

const shoppingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plannerId: { type: mongoose.Schema.Types.ObjectId, ref: "WeekPlan", required: true },
  recipes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe"
    }
  ],
  lists: [
    {
      itemName: { type: String, required: true },
      quantity: { type: Number, default: 1 },
       unit: { type: String, default: "" },
      purchased: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("ShoppingList", shoppingListSchema);
