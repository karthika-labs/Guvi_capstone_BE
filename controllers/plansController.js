const weekplans = require('../models/planner')

const postPlan = async (req, res) => {
    try {
        const { weekStartDate } = req.body;
        const userId = req.user._id;

        // Validate weekStartDate
        if (!weekStartDate) {
            return res.status(400).json({ message: "weekStartDate is required" });
        }

        // Validate date format (should be YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(weekStartDate)) {
            return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD" });
        }

        // Parse the new week start date
        const dateParts = weekStartDate.split('-');
        if (dateParts.length !== 3) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const [year, month, day] = dateParts.map(Number);
        
        // Validate date values
        if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
            return res.status(400).json({ message: "Invalid date values" });
        }

        const newWeekStart = new Date(year, month - 1, day);
        
        // Validate the date object
        if (isNaN(newWeekStart.getTime())) {
            return res.status(400).json({ message: "Invalid date" });
        }

        const newWeekEnd = new Date(newWeekStart);
        newWeekEnd.setDate(newWeekEnd.getDate() + 6);

        // Get all existing plans for this user
        const existingPlans = await weekplans.find({ userId });

        // Check for date overlaps
        for (const existing of existingPlans) {
            if (!existing || !existing.weekStartDate) continue;

            try {
                let existingWeekStart;
                
                // Handle different date formats: Date object, ISO string, or YYYY-MM-DD string
                if (existing.weekStartDate instanceof Date) {
                    existingWeekStart = new Date(existing.weekStartDate);
                } else if (typeof existing.weekStartDate === 'string') {
                    // Check if it's an ISO string (contains 'T' or 'Z')
                    if (existing.weekStartDate.includes('T') || existing.weekStartDate.includes('Z')) {
                        existingWeekStart = new Date(existing.weekStartDate);
                    } else {
                        // Assume it's YYYY-MM-DD format
                        const existingDateParts = existing.weekStartDate.split('-');
                        if (existingDateParts.length !== 3) continue;
                        const [existingYear, existingMonth, existingDay] = existingDateParts.map(Number);
                        if (isNaN(existingYear) || isNaN(existingMonth) || isNaN(existingDay)) continue;
                        existingWeekStart = new Date(existingYear, existingMonth - 1, existingDay);
                    }
                } else {
                    continue; // Skip if not a valid date format
                }
                
                // Validate the date object
                if (isNaN(existingWeekStart.getTime())) {
                    console.warn("Invalid date object for existing plan:", existing.weekStartDate);
                    continue;
                }

                // Normalize to start of day to avoid time issues
                existingWeekStart.setHours(0, 0, 0, 0);
                const existingWeekEnd = new Date(existingWeekStart);
                existingWeekEnd.setDate(existingWeekEnd.getDate() + 6);
                existingWeekEnd.setHours(23, 59, 59, 999);
                
                // Normalize new week dates too
                newWeekStart.setHours(0, 0, 0, 0);
                newWeekEnd.setHours(23, 59, 59, 999);

                // Check if dates overlap
                if (
                    (newWeekStart >= existingWeekStart && newWeekStart <= existingWeekEnd) ||
                    (newWeekEnd >= existingWeekStart && newWeekEnd <= existingWeekEnd) ||
                    (newWeekStart <= existingWeekStart && newWeekEnd >= existingWeekEnd)
                ) {
                    // Format dates for response (YYYY-MM-DD)
                    const formatDate = (date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    return res.status(400).json({
                        message: "This date already exists in another week plan",
                        existingPlan: {
                            _id: existing._id,
                            weekStartDate: formatDate(existingWeekStart),
                            startDate: formatDate(existingWeekStart),
                            endDate: formatDate(existingWeekEnd)
                        }
                    });
                }
            } catch (parseErr) {
                // Skip this existing plan if there's an error parsing its date
                console.warn("Error parsing existing plan date:", existing.weekStartDate, parseErr);
                continue;
            }
        }

        // Create
        const newPlan = await weekplans.create({
            userId,
            weekStartDate,
            plans: {}   // empty structure
        });

        res.json(newPlan);
    } catch (err) {
        console.error("createWeekPlan error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
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
