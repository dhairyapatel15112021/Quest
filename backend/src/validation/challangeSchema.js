const { z } = require("zod");
const mongoose = require("mongoose");

const challengeSchema = z.object({
  like_video_count: z.number()
    .min(0, { message: "Like count must be 0 or greater" }),
  
  share_video_count: z.number()
    .min(0, { message: "Share count must be 0 or greater" }),
  
  fk_quest_id: z.string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid Quest ID",
    }),
  Title: z.string(),
}).refine((data) => data.like_video_count > 0 || data.share_video_count > 0, {
  message: "At least one of Like or Share count must be greater than 0",
  path: ["like_video_count", "share_video_count"]
});

module.exports = challengeSchema;