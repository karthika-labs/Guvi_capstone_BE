const Recipe = require("../models/recipe");

const searchRecipes = async (req, res) => {
  try {
    const { search, type, mealType, foodPreference } = req.query;
    console.log("Search params:", { search, type, mealType, foodPreference });

    const filter = {};

    // Build base filters
    if (mealType) {
      filter.mealType = { $in: mealType.split(",").map(m => m.trim()) };
    }

    if (foodPreference) {
      filter.foodPreference = foodPreference;
    }

    // Search based on type parameter
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // Use "starts with" pattern (^) for performance - only matches beginning of string
      const regex = new RegExp(`^${searchTerm}`, "i");

      if (type === "ing") {
        // Search only in ingredients
        filter["ingredients.name"] = regex;
      } else if (type === "rcp") {
        // Search only in recipe name
        filter.recipeName = regex;
      } else {
        // Default: search both (for backward compatibility)
        filter.$or = [
          { recipeName: regex },
          { "ingredients.name": regex }
        ];
      }
    }

    console.log("MongoDB filter:", JSON.stringify(filter, null, 2));

    const recipes = await Recipe.find(filter)
      .populate('userId', 'username email avatar')
      .select('-__v')
      .lean();

    console.log(`Found ${recipes.length} recipes`);
    res.json(recipes);

  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = { searchRecipes };