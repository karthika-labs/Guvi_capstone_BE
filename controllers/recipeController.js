
const recipes = require("../models/recipe.js")

const User = require("../models/users.js")




//POST /recipes
const addRecipes = async (req, res) => {
  try {
    const newrecipe = await recipes.create({...req.body,  userId:req.user._id})

     await User.findByIdAndUpdate(
      req.user._id,
      { $push: { recipes: newrecipe._id } },
      { new: true }
    );
  
    res.json({ message: "Recipe added", newrecipe })
  }
  catch (e) {
    res.json({ message: e.message })
  }

}

//ediit recipe....PUT /recipes/:id
const editRecipes = async (req, res) => {

  try {

    const updateRecipe = await recipes.findByIdAndUpdate(req.params.id, {
      $set: {
        ...req.body
      }
    }, { new: true }

    )
    if (!updateRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({ message: "updated successfully", updateRecipe: updateRecipe })
  }
  catch (err) {
    res.json({ message: err.message })
  }
}

//delete
//DELETE /recipes/:id
const deleteRecipes = async (req, res) => {
  try {
    const recipe = await recipes.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    //  Ownership check (critical)
    if (recipe.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await recipes.findByIdAndDelete(req.params.id);

    //  Remove recipe from user posted recipes
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recipes: req.params.id }
    });

    //  Remove from all users' likes & saves
    await User.updateMany(
      {},
      {
        $pull: {
          likedRecipes: req.params.id,
          savedRecipes: req.params.id
        }
      }
    );

    res.json({ message: "Recipe deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET /recipes/:id
const getRecipeById = async (req, res) => {
  try {
    const recipe = await recipes.findById(req.params.id)
    .populate({
      path: 'userId',
      select: 'username avatar name'
    })
    .populate({
      path: 'ratings',
      populate: {
        path: 'userId',
        select: 'name avatarUrl'
      }
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'userId',
        select: 'name avatarUrl'
      }
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}



//All Recipeby User GET/users/:userId/recipes
const getRecipesByUser = async (req, res) => {
  try {
    const recipeList = await recipes.find({ userId: req.params.userId })
      .populate({
        path: 'userId',
        select: 'username avatar' // Populate userId with username and avatar
      });

    // Return empty array instead of error if no recipes found
    res.json({ recipeList: recipeList || [] });
  } catch (err) {
    res.status(500).json({ message: err.message, recipeList: [] });
  }
};


//All Recipes....GET /recipes
const Allrecipes = async (req, res) => {
  try {
    const recipe = await recipes.find()
      .populate({
        path: 'userId',
        select: 'username avatar' // Populate userId with username and avatar
      })

    if (!recipe || recipe.length === 0) {
      res.status(400).json({ message: "recipes are found" })
    }

    res.json({ recipe })
  }
  catch (e) {
    res.json({ message: "something went wrong during get all recipes" ,error:e.message })
  }

}

module.exports = {
  addRecipes,
  editRecipes,
  deleteRecipes,
  getRecipeById,
  getRecipesByUser,
  Allrecipes
}

