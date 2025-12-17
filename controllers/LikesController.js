const Recipe = require('../models/recipe');
const mongoose = require('mongoose');



const postLike = async (req, res) => {
  try {
    const userId = req.user._id;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user already liked
    if (recipe.likes.includes(userId)) {
      return res.status(400).json({ message: "You already liked this recipe" });
    }

    recipe.likes.push(userId);
    await recipe.save();

    res.json({ likes: recipe.likes.length });
  } catch (err) {
    console.error("Post like error:", err);
    res.status(500).json({ message: "Server error" , error: err.message});
  }
};



// const deleteLike = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) {
//       return res.status(404).json({ message: "Recipe not found" });
//     }

//     const likeIndex = recipe.likes.indexOf(userId);
//     if (likeIndex === -1) {
//       return res.status(400).json({ message: "You have not liked this recipe" });
//     }

//     recipe.likes.splice(likeIndex, 1);
//     await recipe.save();

//     res.json({ likes: recipe.likes.length });
//   } catch (err) {
//     console.error("Delete like error:", err);
//     res.status(500).json({ message: "Server error" , error: err.message });
//   }
// };

const deleteLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const recipeId = req.params.id;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $pull: { likes: userId } },
      { new: true } // optional but useful
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ likes: updatedRecipe.likes.length });
  } catch (err) {
    console.error("Delete like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  postLike,
    deleteLike
};
