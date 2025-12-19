const { error } = require('console')
const comments = require('../models/comments.js')
const recipes = require('../models/recipe.js')
//post
const postComment = async (req, res) => {
    try {
        const addRecipe = await comments.create({
            ...req.body,
            userId: req.user._id,
            recipeId: req.params.recipeId,
        }
        )
        await recipes.updateOne(
            { _id: req.params.recipeId },
            { $push: { comments: addRecipe._id } }
        )

        res.json({ addRecipe })

    }
    catch (e) {
        res.json({ message: "something went wrong while posting comments", error: e.message })
    }


}

//get byId
const getComment = async (req, res) => {
    try {
        const getComments = await comments.findById(req.params.id).populate("userId").populate("recipeId")
        if (!getComments) {
            res.status(404).json({ message: "No comments found" })
        }
        res.json({ getComments })
    }
    catch (e) {
        res.json({ message: "something went wrong while getting comments", error: e.message })
    }
}

//get All recipes/:id/comments
const getAllComment = async (req, res) => {
    try {
        const getAllComments = await comments.find({ recipeId: req.params.recipeId }).populate("userId").populate("recipeId")

        if (!getAllComments || getAllComments.length === 0) {
            return res.status(400).json({ message: "No comments found  for this recipe" })
        }
        
        

        res.json({ getAllComments })
    }
    catch (e) {
        res.json({ message: "something went wrong while getting comments", error: e.message })
    }
}

//put
const putComment = async (req, res) => {
    try {
        const editComments = await comments.findByIdAndUpdate(req.params.id, { text: req.body.text }, { new: true })
        if (!editComments) {
            return res.status(404).json({ message: "Comment not found" });
        }

     

        res.json({ editComments })
    }
    catch (e) {
        res.json({ message: "something went wrong while updating comments", error: e.message })
    }


}

//delete
const deleteComment = async (req, res) => {
    try {


        const deleteComments = await comments.findByIdAndDelete(req.params.id)
        if (!deleteComments) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await recipes.updateOne(
            { _id: deleteComments.recipeId },
            { $pull: { comments: deleteComments._id } }
        )
        
        res.json({ message: "Comment deleted", deleteComments })
    }
    catch (e) {
        res.json({ message: "something went wrong while updating comments", error: e.message })
    }


}

module.exports = {
    postComment,
    getComment,
    getAllComment,
    putComment,
    deleteComment
}