const { z } = require("zod");

const questSchema = z.object({
    Title: z.string(),
    Description: z.string(),
    start_date: z.preprocess((val) => new Date(val), z.date()),
    end_date: z.preprocess(
        (val) => {
            if (typeof val === "string" && val.trim() === "") return undefined; // Allow empty string
            const date = new Date(val);
            return isNaN(date.getTime()) ? new Error("Invalid date format") : date; // Reject invalid date
        },
        z.date()
    ).optional(),  
    total_budget: z.number().min(1, "Budget must be at least 1"),
    is_Active: z.enum(["created", "active", "completed"]).default("created")
});

module.exports = questSchema;
