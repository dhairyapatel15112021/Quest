const mongoose = require("mongoose");
const UserVideo = require("../db/models/UserVideo");
const Challenge = require("../db/models/Challenge");
const isChallengeComplete = require("../service/IsChallengeComplete");
// Get total likes and shares for a video
const getVideoStats = async (req, res) => {
    try {
        const { video_filename } = req.query;

        if (!video_filename) {
            return res.status(400).json({
                success: false,
                message: "Video filename is required"
            });
        }

        // Updated aggregation to ensure we're counting correctly
        const stats = await UserVideo.aggregate([
            { $match: { video_filename } },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: { $cond: ["$isLiked", 1, 0] } },
                    totalShares: { $sum: { $cond: ["$isShared", 1, 0] } }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: stats[0] || { totalLikes: 0, totalShares: 0 }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Toggle video like status
const toggleVideoLike = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { video_filename, challenge_id } = req.body;
        const user_id = req.user.id;

        if (!video_filename || !challenge_id) {
            return res.status(400).json({
                success: false,
                message: "Video filename and challenge ID are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(challenge_id) || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID or user ID format"
            });
        }

        // Find or create user video record
        let userVideo = await UserVideo.findOne({
            video_filename,
            fk_challenge_id: challenge_id,
            fk_user_id: user_id
        }).session(session);

        if (!userVideo) {
            userVideo = new UserVideo({
                video_filename,
                fk_challenge_id: challenge_id,
                fk_user_id: user_id,
                isLiked: true,
                isShared: false
            });
        } else {
            // Toggle like status
            userVideo.isLiked = !userVideo.isLiked;
        }

        await userVideo.save({ session });

        // Check challenge completion status
        const challengeComplete = await isChallengeComplete.checkChallengeCompletion(challenge_id, user_id, session);

        // Get updated stats after toggle
        const stats = await UserVideo.aggregate([
            { $match: { video_filename } },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: { $cond: ["$isLiked", 1, 0] } },
                    totalShares: { $sum: { $cond: ["$isShared", 1, 0] } }
                }
            }
        ], { session });

        await session.commitTransaction();
        
        return res.status(200).json({
            success: true,
            isChallengeComplete: challengeComplete.isComplete,
            challengeMessage: challengeComplete.message,
            data: {
                isLiked: userVideo.isLiked,
                stats: stats[0] || { totalLikes: 0, totalShares: 0 }
            },
            message: `Video ${userVideo.isLiked ? 'liked' : 'unliked'} successfully`
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

// Toggle video share status
const toggleVideoShare = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { video_filename, challenge_id } = req.body;
        const user_id = req.user.id;

        if (!video_filename || !challenge_id) {
            return res.status(400).json({
                success: false,
                message: "Video filename and challenge ID are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(challenge_id) || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID or user ID format"
            });
        }

        // Find or create user video record
        let userVideo = await UserVideo.findOne({
            video_filename,
            fk_challenge_id: challenge_id,
            fk_user_id: user_id
        }).session(session);

        if (!userVideo) {
            userVideo = new UserVideo({
                video_filename,
                fk_challenge_id: challenge_id,
                fk_user_id: user_id,
                isLiked: false,
                isShared: true
            });
        } else {
            // For share, we only allow sharing once
            if (userVideo.isShared) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Video already shared"
                });
            }
            userVideo.isShared = true;
        }

        await userVideo.save({ session });

        // Check challenge completion status
        const challengeComplete = await isChallengeComplete.checkChallengeCompletion(challenge_id, user_id, session);

        // Get updated stats after toggle
        const stats = await UserVideo.aggregate([
            { $match: { video_filename } },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: { $cond: ["$isLiked", 1, 0] } },
                    totalShares: { $sum: { $cond: ["$isShared", 1, 0] } }
                }
            }
        ], { session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            isChallengeComplete: challengeComplete.isComplete,
            challengeMessage: challengeComplete.message,
            data: {
                isShared: userVideo.isShared,
                stats: stats[0] || { totalLikes: 0, totalShares: 0 }
            },
            message: "Video shared successfully"
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

// Get user's video status (liked/shared)
const getUserVideoStatus = async (req, res) => {
    try {
        const { video_filename, challenge_id } = req.query;
        const user_id = req.user.id;

        if (!video_filename || !challenge_id) {
            return res.status(400).json({
                success: false,
                message: "Video filename and challenge ID are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(challenge_id) || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID or user ID format"
            });
        }

        const userVideo = await UserVideo.findOne({
            video_filename,
            fk_challenge_id: challenge_id,
            fk_user_id: user_id
        });

        // Get total stats for the video
        const stats = await UserVideo.aggregate([
            { $match: { video_filename } },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: { $cond: ["$isLiked", 1, 0] } },
                    totalShares: { $sum: { $cond: ["$isShared", 1, 0] } }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                is_liked: userVideo?.isLiked || false,
                is_shared: userVideo?.isShared || false,
                stats: stats[0] || { totalLikes: 0, totalShares: 0 }
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's progress for a challenge
const getChallengeProgress = async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const user_id = req.user.id; // Assuming user is in request from auth middleware

        if (!challenge_id) {
            return res.status(400).json({
                success: false,
                message: "Challenge ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(challenge_id) || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID or user ID format"
            });
        }

        // Get challenge requirements
        const challenge = await Challenge.findById(challenge_id);
        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: "Challenge not found"
            });
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
                    likedVideos: { $sum: { $cond: ["$isLiked", 1, 0] } },
                    sharedVideos: { $sum: { $cond: ["$isShared", 1, 0] } }
                }
            }
        ]);

        const progress = userProgress[0] || { likedVideos: 0, sharedVideos: 0 };

        return res.status(200).json({
            success: true,
            data: {
                requirements: {
                    like_video_count: challenge.like_video_count,
                    share_video_count: challenge.share_video_count
                },
                progress: {
                    likedVideos: progress.likedVideos,
                    sharedVideos: progress.sharedVideos
                }
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getVideoStats,
    getUserVideoStatus,
    getChallengeProgress,
    toggleVideoLike,
    toggleVideoShare
}; 