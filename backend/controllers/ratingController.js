const ratings = require("../models/rating")
const recipes = require("../models/recipe")
const mongoose = require("mongoose")
//  --->/recipes/:id/ratings
const postRating = async (req, res) => {
    try {
        const newrating = await ratings.create({
            ...req.body,
            userId: req.user._id,
            recipeId: req.params.recipeId
        })
        //rating in recipe model
        await recipes.updateOne(
            { _id: req.params.recipeId },
            { $push: { ratings: newrating._id } }
        )

        //avg rating calc
        const allRatings = await ratings.find({ recipeId: req.params.recipeId })
        const total = allRatings.reduce((acc, curr) => acc + curr.value, 0)
        const avgRating = total / allRatings.length

        await recipes.findByIdAndUpdate(req.params.recipeId, { averageRating: avgRating })

        res.json({ message: "rated successfull", newrating })
    }
    catch (e) {
        res.json({ message: "something went wrong while posting rating", error: e.message })
    }
}


//get /ratings/:id
const getRating = async (req, res) => {
    try {

        const rating = await ratings.findById(req.params.ratingId)

        if (!rating) {
            return res.status(400).json({ message: "rating not found " })
        }

        res.json({ rating })

    }
    catch (e) {
        res.json({ message: "something went wrong while getting rating", error: e.message })
    }
}


//get /recipes/:id/ratings/ /doubt =if we give recipeid it will get all recipe details right?
const getRatingByRecipe = async (req, res) => {
    try {
        const ratingByRecipe = await ratings.find({ recipeId: req.params.recipeId })
        //.populate("userId").populate("recipeId")

        if (!ratingByRecipe || ratingByRecipe.length === 0) {
            return res.status(404).json({ message: "rating not found for this recipe" })
        }

        res.json({ ratingByRecipe })

    }
    catch (e) {
        res.json({ message: "something went wrong while getting rating", error: e.message })
    }
}

//
const updatedRating = async (req, res) => {
    try {
        const updated = await ratings.findByIdAndUpdate(req.params.ratingId, { $set: req.body }, { new: true })

        if (!updated) {
            return res.status(404).json({ message: "rating not found for this recipe" })
        }

        const allRatings = await ratings.find({ recipeId: updated.recipeId })
        const total = allRatings.reduce((acc, curr) => acc + curr.value, 0)
        const avgRating = total / allRatings.length 

        await recipes.findByIdAndUpdate(updated.recipeId, { averageRating: avgRating })


        res.json({ message: "Rating updated", updated })

    }
    catch (e) {
        res.json({ message: "something went wrong while updating rating", error: e.message })
    }
}

//
const deleteRating = async (req, res) => {
    try {
        const deleted = await ratings.findByIdAndDelete(req.params.ratingId)

        if (!deleted) {
            return res.status(404).json({ message: "rating not found " })
        }

        await recipes.updateOne(
            { _id: deleted.recipeId },
            { $pull: { ratings: new mongoose.Types.ObjectId(req.params.ratingId) } }
        )

        //avg rating calc
        const allRatings = await ratings.find({ recipeId: deleted.recipeId })
        const total = allRatings.reduce((acc, curr) => acc + curr.value, 0)     
        const avgRating = allRatings.length === 0 ? 0 : total / allRatings.length

        await recipes.findByIdAndUpdate(deleted.recipeId, { averageRating: avgRating })

        res.json({ message: "deleted successfully" ,deleted})

    }
    catch (e) {
        res.json({ message: "something went wrong while updating rating", error: e.message })
    }
}

module.exports = { postRating, getRating, getRatingByRecipe, updatedRating, deleteRating }
