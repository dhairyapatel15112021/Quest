const { z } = require("zod");
const mongoose = require("mongoose");

const challengeRewardSchema = z.object({
  fk_challenge_id: z.string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid Challenge ID",
    }).optional(),
  
  reward_type: z.enum(["free coffee", "coupons"], {
    message: "Reward type must be either 'free coffee' or 'coupon'",
  }),

  points: z.number()
    .optional()
    .refine((val) => val === undefined || val > 0, {
      message: "Points must be greater than zero if provided",
    }),

  active_duration_days: z.number()
    .min(1, { message: "Active duration must be greater than zero" }),
});

const challengeRewardArraySchema = z.array(challengeRewardSchema);

module.exports = { challengeRewardSchema, challengeRewardArraySchema };