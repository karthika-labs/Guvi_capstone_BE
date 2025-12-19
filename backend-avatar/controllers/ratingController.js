const ratings = require("../models/rating")
const recipes = require("../models/recipe")
const mongoose = require("mongoose")
//  --->/recipes/:id/ratings
const postRating = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { _id: userId } = req.user;
        const { value } = req.body;

        if (!value || value < 1 || value > 5) {
            return res.status(400).json({ message: "Rating value must be between 1 and 5." });
        }

        const updatedRating = await ratings.findOneAndUpdate(
            { recipeId: recipeId, userId: userId },
            { value: value, recipeId: recipeId, userId: userId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await recipes.findByIdAndUpdate(recipeId, {
            $addToSet: { ratings: updatedRating._id }
        });

        const allRatings = await ratings.find({ recipeId: recipeId });
        const total = allRatings.reduce((acc, curr) => acc + curr.value, 0);
        const avgRating = total / allRatings.length;

        await recipes.findByIdAndUpdate(recipeId, { averageRating: avgRating });

        res.json({ message: "Rating updated successfully (v2)", rating: updatedRating });

    } catch (e) {
        res.status(500).json({ message: "Something went wrong while posting rating", error: e.message });
    }
};


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
