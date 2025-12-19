const mongoose = require("mongoose");

const dayPlanSchema = new mongoose.Schema({
  date: { type: Date },
  breakfast: {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
  },
  lunch: {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
  },
  dinner: {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
  }
})

const plannerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
 

  weekStartDate: {
    type: Date,
    required: true
  },

  plans: {
    monday: dayPlanSchema,
    tuesday: dayPlanSchema,
    wednesday: dayPlanSchema,
    thursday: dayPlanSchema,
    friday: dayPlanSchema,
    saturday: dayPlanSchema,
    sunday: dayPlanSchema
  },

  shoppingList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingList"
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model("WeekPlan", plannerSchema);
