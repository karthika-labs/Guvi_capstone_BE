const favorites = require("../models/favorites")
const recipes = require("../models/recipe")
const post = async (req, res) => {
    try {
        const existing = await favorites.findOne({ userId: req.user._id, recipeId: req.body.recipeId })
        if (existing) {
            return res.status(400).json({
                message: "Recipe already added to favorites"
            })
        }
        const newFavorite = await favorites.create({
            userId: req.user._id,
            recipeId: req.body.recipeId

        })



        res.json({ message: "added to favorites", newFavorite })
    }
    catch (e) {
        res.json({ message: "something went wrong while adding to favorites", error: e.message })
    }

}


const getByUser = async (req, res) => {
    try {
        const favoriteByUser = await favorites.find({ userId: req.params.id }).populate("recipeId").populate("userId")

        res.json({ favoriteByUser })
    }
    catch (e) {
        res.json({ message: "something went wrong while getting favorites", error: e.message })
    }
}

const deleteFavorite = async (req, res) => {
    try {
        const deleted = await favorites.findOneAndDelete({ userId: req.user._id, recipeId: req.params.recipeId })
        if (!deleted) {
            return res.status(404).json({ message: " not found in favorites" })
        }

     

        res.json({ message: "removed from favorites", deleted })
    }
    catch (e) {
        res.json({ message: "something went wrong while deleting favorite", error: e.message })
    }
}

module.exports = { post, getByUser, deleteFavorite }