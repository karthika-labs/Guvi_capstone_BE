const mongoose = require("mongoose")
const ratingSchema = new mongoose.Schema({
  
        
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
             recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
            value: { type: Number, min: 1, max: 5 },
      
    
})
module.exports=mongoose.model("Rating",ratingSchema)
