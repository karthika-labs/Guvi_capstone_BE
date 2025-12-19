const weekplans = require('../models/planner')

const postPlan = async (req, res) => {
    try {
        const { weekStartDate } = req.body;
        const userId = req.user._id;

        // Check duplicate
        // const existing = await weekplans.findOne({ userId, weekStartDate });
        // if (existing) {
        //     return res.status(400).json({
        //         message: "A plan already exists for this week",
        //         plan: existing
        //     });
        // }

        // Create
        const newPlan = await weekplans.create({
            userId,
            weekStartDate,
            plans: {}   // empty structure
        });

        res.json(newPlan);
    } catch (err) {
        console.error("createWeekPlan error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// get
const getPlan = async (req, res) => {
    try {
        const getPlan = await weekplans.find({ userId: req.user._id }).select("weekStartDate plans userId")

        if (!getPlan.length === 0) {
            res.json({ message: "No plans found" })
        }
        res.json({ getPlan })
    }
    catch (e) {
        res.json({ message: "something went wrong while getting plans", error: e.message })
    }
}

// const emptyDay = {
//   date: null,
//   breakfast: { recipeId: null },
//   lunch: { recipeId: null },
//   dinner: { recipeId: null }
// };

// const postPlan = async (req, res) => {
//   try {
//     const { weekStartDate } = req.body;
//     const userId = req.user._id;

//     const existing = await weekplans.findOne({ userId, weekStartDate });
//     if (existing) {
//       return res.status(400).json({
//         message: "A plan already exists for this week",
//         plan: existing
//       });
//     }

//     const newPlan = await weekplans.create({
//       userId,
//       weekStartDate,
//       plans: {
//         monday: emptyDay,
//         tuesday: emptyDay,
//         wednesday: emptyDay,
//         thursday: emptyDay,
//         friday: emptyDay,
//         saturday: emptyDay,
//         sunday: emptyDay
//       }
//     });

//     res.json(newPlan);
//   } catch (err) {
//     console.error("createWeekPlan error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getPlan = async (req, res) => {
//   try {
//     const getPlan = await weekplans
//       .find({ userId: req.user._id })
//       .select("weekStartDate plans userId");

//     if (getPlan.length === 0) {
//       return res.json({ message: "No plans found" });
//     }

//     res.json({ getPlan });
//   } catch (e) {
//     res.json({ message: "something went wrong while getting plans", error: e.message });
//   }
// };



//getPlan->id plans/:id
const getPlanById = async (req, res) => {
    try {
        const getOnePlan = await weekplans.findById(req.params.id).populate("plans.monday.breakfast.recipeId")
            .populate("plans.monday.lunch.recipeId")
            .populate("plans.monday.dinner.recipeId")

            .populate("plans.tuesday.breakfast.recipeId")

            .populate("plans.tuesday.lunch.recipeId")
            .populate("plans.tuesday.dinner.recipeId")

            .populate("plans.wednesday.breakfast.recipeId")

            .populate("plans.wednesday.lunch.recipeId")
            .populate("plans.wednesday.dinner.recipeId")

            .populate("plans.thursday.breakfast.recipeId")

            .populate("plans.thursday.lunch.recipeId")
            .populate("plans.thursday.dinner.recipeId")

            .populate("plans.friday.breakfast.recipeId")

            .populate("plans.friday.lunch.recipeId")
            .populate("plans.friday.dinner.recipeId")

            .populate("plans.saturday.breakfast.recipeId")

            .populate("plans.saturday.lunch.recipeId")
            .populate("plans.saturday.dinner.recipeId")

            .populate("plans.sunday.breakfast.recipeId")

            .populate("plans.sunday.lunch.recipeId")
            .populate("plans.sunday.dinner.recipeId")
            .populate("userId")
        if (!getOnePlan) {
            return res.json({ message: "No plans found for this week" })
        }
        res.json({ getOnePlan })
    }
    catch (e) {
        res.json({ message: "something went wrong while getting plans for this week", error: e.message })
    }
}

const updatePlan = async (req, res) => {
    try {
        const updated = await weekplans.findByIdAndUpdate(req.params.id, { $set: req.body },
            { new: true })
        if (!updated) {
            res.status(404).json({ message: "No plans found" })
        }
        res.json({ updated })
    }
    catch (e) {
        res.json({ message: "something went wrong while updating plans for this week", error: e.message })
    }
}

const deletePlan = async (req, res) => {
    try {
        const deleted = await weekplans.findByIdAndDelete(req.params.id)
        if (!deleted) {
            res.status(404).json({ message: "No plans found" })
        }
        res.json({ deleted })
    }
    catch (e) {
        res.json({ message: "something went wrong while updating plans for this week", error: e.message })
    }
}

const updateMeal = async (req, res) => {
  try {
    const { id, day, meal } = req.params;
    const { recipeId } = req.body;

    const path = `plans.${day}.${meal}.recipeId`;

    const updateQuery = recipeId
      ? { $set: { [path]: recipeId } }       // ADD / UPDATE
      : { $unset: { [path]: "" } };          // REMOVE ONLY recipeId

    const updated = await weekplans.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Week plan not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("updateMeal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};






module.exports = {
    postPlan,
    getPlan,
    getPlanById,
    updatePlan,
    deletePlan,
    updateMeal


}
