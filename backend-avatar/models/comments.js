 const mongoose=require("mongoose")
 const commentsSchema=new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      text: { type: String },
     
 },{ timestamps: true})
module.exports=mongoose.model("Comment",commentsSchema)