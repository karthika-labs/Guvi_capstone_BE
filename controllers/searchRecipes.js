// const Recipe = require("../models/recipe");

// const searchRecipes = async (req, res) => {
//   try {
//     const { mealType, foodPreference, ingredients, recipeName } = req.query;

//     let filter = {};


//     if (mealType) {
//       const mealArray = mealType.split(",");
//       filter.mealType = { $in: mealArray };
//     }

//     if (foodPreference) {
//       filter.foodPreference = foodPreference;
//     }

//     if (recipeName) {
//       filter.recipeName = { $regex: `^${recipeName}`, $options: "i" };
//     }

// if (ingredients) {
//   const ingredientArray = ingredients.split(",");
//   filter["ingredients.name"] = {
//     $in: ingredientArray.map(i => new RegExp(i.trim(), "i"))
//   };
// }


//     const recipes = await Recipe.find(filter);
//     res.json(recipes);

//   } catch (e) {
//     console.error("Search error:", e);
//     res.status(500).json({ message: e.message });
//   }
// };

// module.exports = { searchRecipes };



// const Recipe = require("../models/recipe");

// // GET /recipes/search
// const searchRecipes = async (req, res) => {
  

//   try {
//     console.log("QUERY PARAMS:", req.query);
//     const { q, mealType, foodPreference } = req.query;

//     const query = {};

//     //  MAIN SEARCH (recipeName + ingredients)
//     if (q) {
//       const regex = new RegExp(`^${q}`, "i"); // STARTS WITH

//       query.$or = [
//         { recipeName: regex },
//         { ingredients: { $elemMatch: { $regex: regex } } }
//       ];
//     }

//     // filters
//     if (mealType) query.mealType = mealType;
//     if (foodPreference) query.foodPreference = foodPreference;

//     const recipes = await Recipe.find(query);
//     res.json(recipes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Search failed" });
//   }
// };


// module.exports = { searchRecipes };


const Recipe = require("../models/recipe");

const searchRecipes = async (req, res) => {
  console.log("Search Query Params:", req.query);
  try {

    const { search, mealType, foodPreference } = req.query;
    console.log(search, mealType, foodPreference);

    const filter = {};

  if (mealType) {
      filter.mealType = { $in: mealType.split(",") };
      console.log("Meal Type Filter:", filter.mealType);
    }

    if (foodPreference) {
      filter.foodPreference = foodPreference;
    }

if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { recipeName: regex },           // recipe name
        { "ingredients.name": regex },   // ingredient name
      ];
    }

    console.log("FINAL FILTER:", JSON.stringify(filter));

    const recipes = await Recipe.find(filter);
    res.json(recipes);

  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ message: e.message });
  }ī
};

module.exports = { searchRecipes };