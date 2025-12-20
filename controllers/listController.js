const ShoppingList = require("../models/shoppingList");
const WeekPlan = require('../models/planner');
const Recipe = require('../models/recipe');

const saveList = async (req, res) => {
    try {
        //  Get the week plan
        const weekPlan = await WeekPlan.findById(req.params.planId);
        if (!weekPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        //  Collect all recipeIds 
        const recipeIds = [];
        const days = Object.values(weekPlan.plans);

        for (const day of days) {
            if (!day) continue  //skip if any day(mon,tues..) is undefined
            if (day.breakfast?.recipeId) recipeIds.push(day.breakfast.recipeId);
            if (day.lunch?.recipeId) recipeIds.push(day.lunch.recipeId);
            if (day.dinner?.recipeId) recipeIds.push(day.dinner.recipeId);
        }



        // Count duplicates
        const recipeCount = recipeIds.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        // console.log("recipeIds", recipeIds);
        // console.log("recipeCount", recipeCount);



        // console.log("recipeIds", recipeIds.length)
        // Fetch all recipe documents
        const planRecipes = await Recipe.find({ _id: { $in: recipeIds } });
        if (planRecipes.length === 0) {
            return res.status(404).json({ message: "No recipes found" });
        }
        // console.log("planRecipes.length", planRecipes.length)
        //  Merge ingredients 
        const merged = {};

        for (const r of planRecipes) {
            const count = recipeCount[r._id.toString()] || 1;
            for (const ing of r.ingredients) {
                const key = `${ing.name}-${ing.unit || ""}` // if unit is unique ex: salt-kg, salt-g

                if (!merged[key]) { //merged = {"salt": { itemName: "salt", quantity: 1, purchased: false }}
                    merged[key] = {
                        itemName: ing.name,
                        quantity: Number(ing.quantity) || 1 * count,
                        unit: ing.unit || "",
                        purchased: false
                    }
                } else {
                    merged[key].quantity += Number(ing.quantity) || 1 * count;
                }
            }
        }
        const autoList = Object.values(merged);

        // ---------- MERGE WITH EXISTING ----------
        const existing = await ShoppingList.findOne({
            plannerId: req.params.planId,
        });

        let finalList = autoList;

        if (existing) {
            // Get current recipe IDs to identify which items are from recipes
            const currentRecipeIds = recipeIds.map(id => id.toString());
            
            // Filter manual items: keep only items that are NOT in the current autoList
            // AND were not from recipes (items that were manually added)
            const manualItems = existing.lists.filter(
                item => {
                    // Check if this item exists in the new autoList
                    const inAutoList = autoList.some(a => 
                        a.itemName === item.itemName && 
                        (a.unit || "") === (item.unit || "")
                    );
                    
                    // If it's in autoList, it's from a recipe, so don't keep it as manual
                    if (inAutoList) return false;
                    
                    // Check if this item was from a deleted recipe by checking if it's in the old recipes array
                    // If existing.recipes doesn't exist or item wasn't from recipes, it's a manual item
                    const wasFromRecipe = existing.recipes && existing.recipes.some(rid => 
                        currentRecipeIds.includes(rid.toString())
                    );
                    
                    // Keep if it's truly a manual item (not from any recipe)
                    // OR if it was from a recipe that's no longer in the plan
                    return !wasFromRecipe || !existing.recipes || existing.recipes.length === 0;
                }
            );

            // Update auto items: preserve quantity and purchased status from existing list
            const updatedAuto = autoList.map(a => {
                const prev = existing.lists.find(i => 
                    i.itemName === a.itemName && 
                    (i.unit || "") === (a.unit || "")
                );
                return prev
                    ? { ...a, quantity: prev.quantity, purchased: prev.purchased }
                    : a;
            });

            finalList = [...updatedAuto, ...manualItems];
        }




        // ---------- SAVE ----------
        const shoppingListDoc = await ShoppingList.findOneAndUpdate(
            { plannerId: req.params.planId },
            {
                userId: weekPlan.userId,
                plannerId: weekPlan._id,
                recipes: recipeIds,
                lists: finalList
            },
            { upsert: true, new: true }
        );

        await WeekPlan.findByIdAndUpdate(weekPlan._id, {
            $addToSet: { shoppingList: shoppingListDoc._id }
        });

        res.json({
            message: "Shopping list generated successfully",
            shoppingList: shoppingListDoc,
        });

    } catch (e) {
        res.status(500).json({
            message: "Something went wrong while generating shopping list",
            error: e.message
        });
    }
};


const getList = async (req, res) => {
    try {
        const allList = await ShoppingList.findById(req.params.listId)
        if (!allList) {
            return res.status(404).json({ message: "No lists found" });
        }
        res.json({ allList })
    }
    catch (e) {
        res.json({
            message: "Something went wrong while getting shopping list",
            error: e.message
        })
    }
}


// const updateList = async (req, res) => {
//     try {
//         const { listId } = req.params;
//         const { lists } = req.body;

//         if (!lists) {
//             return res.status(400).json({ message: "lists array required" });
//         }

//         // Fetch existing shopping list
//         const existing = await ShoppingList.findById(listId);
//         if (!existing) {
//             return res.status(404).json({ message: "Shopping list not found" });
//         }

//         // Only allow updating "lists" array, nothing else
//         existing.lists = lists;

//         const updated = await existing.save();

//         return res.json({
//             message: "List updated",
//             updated
//         });

//     } catch (e) {
//         return res.status(500).json({
//             message: "Error updating list",
//             error: e.message
//         });
//     }
// };



//delete->plans/:planId/lists/:listId
const updateList = async (req, res) => { try { const updated = await ShoppingList.findByIdAndUpdate(req.params.listId, { $set: req.body }, { new: true }); res.json({ message: "List updated", updated }); } catch (e) { res.json({ message: "Error updating list", error: e.message }); } }


const deleteList = async (req, res) => {
    try {
        const { planId, listId } = req.params
        const deleted = await ShoppingList.findByIdAndDelete(listId, { new: true })
        if (!deleted) {
            res.json({ message: "list not found" })
        }
        await WeekPlan.updateOne({ _id: planId }, { $pull: { shoppingList: listId } }, { new: true })
        res.json({ message: "list deleted successfull", deleted })
    }
    catch (e) {
        res.json({ message: "something went wrong while deleting list " })
    }
}

const removeIngredient = async (req, res) => {
    try {
        const { listId } = req.params;
        const { itemName } = req.body;
        const removed = await ShoppingList.findByIdAndUpdate(listId, { $pull: { lists: { itemName: itemName } } }, { new: true })
        res.json({ message: "Ingredient removed", removed });
    }
    catch (e) {
        res.json({ message: "something went wrong while deleting ingredients ", error: e.message })
    }



}



const addManualItem = async (req, res) => {
  try {
    const { itemName, quantity, unit } = req.body;

    const updated = await ShoppingList.findByIdAndUpdate(
      req.params.listId,
      {
        $push: {
          lists: {
            itemName,
            quantity: quantity || 1,
            unit: unit || "",
            purchased: false
          }
        }
      },
      { new: true }
    );

    res.json({ message: "Manual item added", updated });
  } catch (e) {
    res.status(500).json({ message: "Error adding manual item", error: e.message });
  }
};

module.exports = { addManualItem,saveList, getList, deleteList, removeIngredient, updateList }    