const router = require("express").Router()
const { register,
    login,
    forget_password,
    reset_password, getUser, currentUser,updateProfile, getUserById, followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/userController')

const { addRecipes,
    editRecipes,
    deleteRecipes,
    getRecipeById,
    getRecipesByUser,
    Allrecipes } = require('../controllers/recipeController')

const { postPlan,
    getPlan,
    getPlanById,
    updatePlan,
    deletePlan,
    updateMeal } = require('../controllers/plansController')

const { postRating, getRating, getRatingByRecipe, updatedRating, deleteRating } = require('../controllers/ratingController')
const { addManualItem,saveList, getList, deleteList, removeIngredient, updateList } = require('../controllers/listController')
const { postComment,
    getComment,
    getAllComment,
    putComment,
    deleteComment } = require('../controllers/commentController')
const { post, getByUser, deleteFavorite } = require('../controllers/favoriteController')
const { postLike, deleteLike } = require('../controllers/LikesController')
const { searchRecipes } = require('../controllers/searchRecipes')
const auth = require('../middleware/authMiddleware')

router.post('/users/register', register)
router.post('/users/login', login)
router.post('/users/forgetPasswords', forget_password)
router.post('/users/resetPasswords/:token', reset_password)
router.get('/users', auth, getUser)
router.get('/users/current', auth, currentUser)
router.get('/users/:userId', auth, getUserById)

router.put("/users/me", auth, updateProfile);

// Follow/Unfollow routes
router.post('/users/:userId/follow', auth, followUser)
router.delete('/users/:userId/follow', auth, unfollowUser)
router.get('/users/:userId/followers', auth, getFollowers)
router.get('/users/:userId/following', auth, getFollowing)



router.post('/recipes', auth, addRecipes)

router.get('/recipes/search', auth, searchRecipes)

router.put('/recipes/:id', auth, editRecipes)
router.delete('/recipes/:id', auth, deleteRecipes)
router.get('/recipes/:id', getRecipeById) // Public route - allows viewing shared recipes without authentication
router.get('/recipes', auth, Allrecipes)
router.get('/users/:userId/recipes', auth, getRecipesByUser)

router.post('/plans', auth, postPlan)
router.get('/plans', auth, getPlan)
router.get('/plans/:id', auth, getPlanById)
router.put('/plans/:id', auth, updatePlan)
router.delete('/plans/:id', auth, deletePlan)
router.put('/plans/:id/day/:day/meal/:meal', auth, updateMeal)

router.post('/recipes/:recipeId/ratings', auth, postRating)
router.get('/ratings/:ratingId', auth, getRating)
router.get('/recipes/:recipeId/ratings', auth, getRatingByRecipe)
router.put('/ratings/:ratingId', auth, updatedRating)
router.delete('/ratings/:ratingId', auth, deleteRating)

router.post('/plans/:planId/lists', auth, saveList)
router.get('/plans/:planId/lists/:listId', auth, getList)
router.delete('/plans/:planId/lists/:listId', auth, deleteList)
router.put('/plans/:planId/lists/:listId', auth, updateList)
router.delete('/plans/:planId/lists/:listId/ingredient', auth, removeIngredient)
router.post('/plans/:planId/lists/:listId/manual', auth, addManualItem);


router.post('/favorites', auth, post)
router.get('/favorites/user/:id', auth, getByUser)
router.delete('/favorites/:recipeId', auth, deleteFavorite)

router.post('/recipes/:recipeId/comments', auth, postComment)
router.get('/recipes/:recipeId/comments', auth, getAllComment)
router.get('/comments/:id', auth, getComment)
router.put('/comments/:id', auth, putComment)
router.delete('/comments/:id', auth, deleteComment)


router.post("/recipes/:id/like", auth, postLike)
router.delete("/recipes/:id/like", auth, deleteLike)

module.exports = router