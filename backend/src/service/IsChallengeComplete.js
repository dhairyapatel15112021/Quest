const Challenge = require('../db/models/Challenge');
const UserVideo = require('../db/models/UserVideo');
const UserReward = require('../db/models/UserReward');
const ChallengeReward = require('../db/models/ChallengeReward');
const mongoose = require('mongoose');
const { UserChallenge } = require('../db/models');

/**
 * Checks if a challenge is complete and manages rewards accordingly
 * @param {string} challenge_id - The challenge ID
 * @param {string} user_id - The user ID
 * @param {mongoose.ClientSession} [existingSession] - Optional existing MongoDB session
 * @returns {Promise<{ isComplete: boolean, message: string, progress?: object }>}
 */
const checkChallengeCompletion = async (challenge_id, user_id, existingSession = null) => {
    const session = existingSession || await mongoose.startSession();
    if (!existingSession) {
        session.startTransaction();
    }

    try {
        // Get challenge requirements
        const challenge = await Challenge.findById(challenge_id).session(session);
        if (!challenge) {
            if (!existingSession) {
                await session.abortTransaction();
                session.endSession();
            }
            throw new Error('Challenge not found');
        }

        // Get user's progress
        const userProgress = await UserVideo.aggregate([
            {
                $match: {
                    fk_challenge_id: new mongoose.Types.ObjectId(challenge_id),
                    fk_user_id: new mongoose.Types.ObjectId(user_id)
                }
            },
            {
                $group: {
                    _id: null,
                    likedVideos: { 
                        $sum: { 
                            $cond: [{ $eq: ["$isLiked", true] }, 1, 0] 
                        } 
                    },
                    sharedVideos: { 
                        $sum: { 
                            $cond: [{ $eq: ["$isShared", true] }, 1, 0] 
                        } 
                    }
                }
            }
        ], { session });

        const progress = userProgress[0] || { likedVideos: 0, sharedVideos: 0 };
        const isComplete = progress.likedVideos >= challenge.like_video_count && 
                          progress.sharedVideos >= challenge.share_video_count;

        // Get current challenge status
        const userChallenge = await UserChallenge.findOne({
            fk_challenge_id: challenge_id,
            fk_user_id: user_id
        }).session(session);

        const wasCompleteBefore = userChallenge?.completed || false;

        if (isComplete) {
            // Update challenge completion status
            await UserChallenge.findOneAndUpdate(
                { 
                    fk_challenge_id: challenge_id, 
                    fk_user_id: user_id 
                },
                { 
                    $set: { 
                        completed: true, 
                        completion_date: new Date() 
                    }
                },
                { upsert: true, session }
            );

            // Only generate rewards if the challenge wasn't complete before
            if (!wasCompleteBefore) {
                // Get challenge rewards configuration
                const challengeRewards = await ChallengeReward.find({ 
                    fk_challenge_id: challenge_id 
                }).session(session);

                if (challengeRewards.length > 0) {
                    // Generate rewards
                    const rewards = challengeRewards.map(reward => ({
                        fk_challenge_id: challenge_id,
                        fk_user_id: user_id,
                        fk_reward_id: reward._id,
                        claimed: false,
                        claimed_date: null
                    }));

                    await UserReward.insertMany(rewards, { session });
                }
            }

            if (!existingSession) {
                await session.commitTransaction();
                session.endSession();
            }

            return {
                isComplete: true,
                message: wasCompleteBefore ? 
                    'Challenge already completed.' : 
                    'Challenge completed! Rewards generated successfully.',
                progress: {
                    current: {
                        likedVideos: progress.likedVideos,
                        sharedVideos: progress.sharedVideos
                    },
                    required: {
                        likeVideoCount: challenge.like_video_count,
                        shareVideoCount: challenge.share_video_count
                    }
                }
            };
        } else {
            // If challenge was complete before but isn't now, remove unclaimed rewards
            if (wasCompleteBefore) {
                await UserChallenge.findOneAndUpdate(
                    { 
                        fk_challenge_id: challenge_id, 
                        fk_user_id: user_id 
                    },
                    { 
                        $set: { 
                            completed: false, 
                            completion_date: null 
                        }
                    },
                    { session }
                );

                // Remove unclaimed rewards
                await UserReward.deleteMany({
                    fk_challenge_id: challenge_id,
                    fk_user_id: user_id,
                    claimed: false
                }, { session });
            }

            if (!existingSession) {
                await session.commitTransaction();
                session.endSession();
            }

            return {
                isComplete: false,
                message: wasCompleteBefore ? 
                    'Challenge no longer complete. Unclaimed rewards have been removed.' : 
                    'Challenge requirements not met.',
                progress: {
                    current: {
                        likedVideos: progress.likedVideos,
                        sharedVideos: progress.sharedVideos
                    },
                    required: {
                        likeVideoCount: challenge.like_video_count,
                        shareVideoCount: challenge.share_video_count
                    }
                }
            };
        }
    } catch (error) {
        if (!existingSession) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error in checkChallengeCompletion:', error);
        throw error;
    }
};

module.exports = {
    checkChallengeCompletion
};
