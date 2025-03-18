const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { User } = require("../db/models");
const loginSchema = require("../validation/loginSchema");
const UserReward = require("../db/models/UserReward");
const ChallengeReward = require("../db/models/ChallengeReward");

const signupUser = async (req, res) => {
    try {
        const { username, password, firstname, lastname } = req.body;

        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
                errors: result.error.errors.map(err => err.message).join(", ")
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(401).json({ success: false, message: "Username already exists" });
        }

        const salts = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salts);

        const newUser = new User({
            username,
            password: hashedPassword,
            firstname,
            lastname
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully",success: true });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", errors: err.message.join(", ") });
    }
}

const getUserRewards = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Get user rewards with challenge reward details
        const userRewards = await UserReward.aggregate([
            {
                $match: {
                    fk_user_id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'ChallengeReward',
                    localField: 'fk_reward_id',
                    foreignField: '_id',
                    as: 'rewardDetails'
                }
            },
            {
                $unwind: '$rewardDetails'
            },
            {
                $project: {
                    _id: 1,
                    claimed: 1,
                    claimed_date: 1,
                    reward_type: '$rewardDetails.reward_type',
                    points: '$rewardDetails.points',
                    active_duration_days: '$rewardDetails.active_duration_days'
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        // Calculate summary statistics
        const summary = {
            total_rewards: userRewards.length,
            total_points: userRewards.reduce((sum, reward) => sum + (reward.points || 0), 0),
            total_free_coffee: userRewards.filter(reward => reward.reward_type === 'free coffee').length,
            claimed_rewards: userRewards.filter(reward => reward.claimed).length,
            active_rewards: userRewards.filter(reward => !reward.claimed).length,
            expired_rewards: userRewards.filter(reward => 
                reward.claimed && 
                new Date(reward.claimed_date.getTime() + (reward.active_duration_days * 24 * 60 * 60 * 1000)) <= new Date()
            ).length
        };

        // Add status to each reward
        const rewardsWithStatus = userRewards.map(reward => {
            let status = 'active';
            
            if (reward.claimed) {
                const expiryDate = new Date(reward.claimed_date.getTime() + (reward.active_duration_days * 24 * 60 * 60 * 1000));
                status = expiryDate <= new Date() ? 'expired' : 'claimed';
            }

            return {
                _id: reward._id,
                reward_type: reward.reward_type,
                is_claimed: reward.claimed,
                claimed_at: reward.claimed_date,
                status: status,
                ...(reward.points && { reward_amount: reward.points })
            };
        });

        return res.json({
            success: true,
            data: {
                summary,
                rewards: rewardsWithStatus
            }
        });

    } catch (error) {
        console.error('Error fetching user rewards:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user rewards',
            error: error.message
        });
    }
};

const claimReward = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        // Find the user reward with reward details
        const userReward = await UserReward.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'ChallengeReward',
                    localField: 'fk_reward_id',
                    foreignField: '_id',
                    as: 'rewardDetails'
                }
            },
            {
                $unwind: '$rewardDetails'
            },
        ]).session(session);

        if (userReward.length === 0) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Reward not found" });
        }

        const reward = userReward[0];

        if (reward.claimed) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Reward already claimed" });
        }

        // Update user's wallet with points
        const updateUserResult = await User.updateOne(
            { _id: reward.fk_user_id },
            { $inc: { wallet: reward.rewardDetails.points || 0 } },
            { session }
        );

        if (updateUserResult.modifiedCount === 0) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update reward status
        const updateRewardResult = await UserReward.updateOne(
            { _id: id },
            {
                $set: {
                    claimed: true,
                    claimed_date: new Date()
                }
            },
            { session }
        );

        if (updateRewardResult.modifiedCount === 0) {
            await session.abortTransaction();
            return res.status(500).json({ success: false, message: "Failed to update reward status" });
        }

        // Commit the transaction
        await session.commitTransaction();

        res.json({ 
            success: true, 
            message: "Reward claimed successfully",
            data: {
                points_added: reward.rewardDetails.points || 0,
                reward_type: reward.rewardDetails.reward_type
            }
        });

    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        console.error('Error claiming reward:', error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    } finally {
        // End the session
        session.endSession();
    }
};

module.exports = {
    signup: signupUser,
    rewards: getUserRewards,
    claimReward: claimReward
}