const mongoose = require('mongoose');

// Mock User data
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'test@example.com',
  password: '$2b$10$YourHashedPasswordHere', // bcrypt hashed password
  firstname: 'Test',
  lastname: 'User',
  is_admin: false,
  wallet: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock Challenge Reward data
const mockChallengeReward = {
  _id: new mongoose.Types.ObjectId(),
  fk_challenge_id: new mongoose.Types.ObjectId(),
  reward_type: 'coupons',
  points: 100,
  active_duration_days: 30,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock User Reward data
const mockUserReward = {
  _id: new mongoose.Types.ObjectId(),
  fk_user_id: mockUser._id,
  fk_challenge_id: new mongoose.Types.ObjectId(),
  fk_reward_id: mockChallengeReward._id,
  claimed: false,
  claimed_date: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock User Signup Request
const mockSignupRequest = {
  username: 'newuser@gmail.com',
  password: 'Password@123',
  firstname: 'New',
  lastname: 'User'
};

// Mock User Signup Response
const mockSignupResponse = {
  message: 'User registered successfully'
};

// Mock User Rewards Response
const mockUserRewardsResponse = {
  success: true,
  data: {
    summary: {
      total_rewards: 2,
      total_points: 200,
      total_free_coffee: 1,
      claimed_rewards: 1,
      active_rewards: 1,
      expired_rewards: 0
    },
    rewards: [
      {
        _id: mockUserReward._id,
        reward_type: 'coupons',
        is_claimed: false,
        claimed_at: null,
        status: 'active',
        reward_amount: 100
      },
      {
        _id: new mongoose.Types.ObjectId(),
        reward_type: 'free coffee',
        is_claimed: true,
        claimed_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'claimed'
      }
    ]
  }
};

// Mock Claim Reward Response
const mockClaimRewardResponse = {
  success: true,
  message: 'Reward claimed successfully',
  data: {
    points_added: 100,
    reward_type: 'coupons'
  }
};

// Mock Error Responses
const mockErrorResponses = {
  usernameExists: {
    success: false,
    message: 'Username already exists'
  },
  invalidUserId: {
    success: false,
    message: 'Invalid user ID format'
  },
  rewardNotFound: {
    success: false,
    message: 'Reward not found'
  },
  rewardAlreadyClaimed: {
    success: false,
    message: 'Reward already claimed'
  },
  userNotFound: {
    success: false,
    message: 'User not found'
  },
  updateFailed: {
    success: false,
    message: 'Failed to update reward status'
  },
  serverError: {
    success: false,
    message: 'Internal Server Error',
    error: 'Error message'
  }
};

// Mock User with Updated Wallet
const mockUserWithUpdatedWallet = {
  ...mockUser,
  wallet: 100 // After claiming reward
};

module.exports = {
  mockUser,
  mockChallengeReward,
  mockUserReward,
  mockSignupRequest,
  mockSignupResponse,
  mockUserRewardsResponse,
  mockClaimRewardResponse,
  mockErrorResponses,
  mockUserWithUpdatedWallet
}; 