const mongoose = require('mongoose');

// Mock Quest data
const mockQuest = {
  _id: new mongoose.Types.ObjectId(),
  Title: "Test Quest",
  Description: "Test Quest Description",
  start_date: new Date(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  create_by: new mongoose.Types.ObjectId(),
  total_budget: 1000,
  quest_image: Buffer.from('test-image-data'),
  is_Active: "created",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock Challenge data
const mockChallenge = {
  _id: new mongoose.Types.ObjectId(),
  like_video_count: 10,
  share_video_count: 5,
  Title: "Test Challenge",
  fk_quest_id: mockQuest._id,
};

// Mock Challenge Reward data
const mockChallengeReward = {
  _id: new mongoose.Types.ObjectId(),
  fk_challenge_id: mockChallenge._id,
  reward_type: "coupons",
  points: 100,
  active_duration_days: 30,
};

// Mock User Challenge data
const mockUserChallenge = {
  _id: new mongoose.Types.ObjectId(),
  fk_challenge_id: mockChallenge._id,
  fk_user_id: new mongoose.Types.ObjectId(),
  completed: false,
  start_date: new Date(),
  completion_date: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock User Quest data
const mockUserQuest = {
  _id: new mongoose.Types.ObjectId(),
  fk_user_id: new mongoose.Types.ObjectId(),
  fk_quest_id: mockQuest._id,
  status: "In Progress",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock User Reward data
const mockUserReward = {
  _id: new mongoose.Types.ObjectId(),
  fk_user_id: new mongoose.Types.ObjectId(),
  fk_challenge_id: mockChallenge._id,
  fk_reward_id: mockChallengeReward._id,
  claimed: false,
  claimed_date: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock Challenge Creation Request
const mockChallengeCreateRequest = {
  challenge: {
    fk_quest_id: mockQuest._id,
    like_video_count: 10,
    share_video_count: 5,
    Title: "Test Challenge"
  },
  reward: [
    {
      reward_type: "coupons",
      points: 100,
      active_duration_days: 30
    },
    {
      reward_type: "free coffee",
      active_duration_days: 7
    }
  ]
};

// Mock Challenge Response
const mockChallengeResponse = {
  success: true,
  message: "Challenge and rewards created successfully",
  challenge: mockChallenge
};

// Mock Get Challenges Response
const mockGetChallengesResponse = {
  success: true,
  message: "Challenges fetched successfully",
  data: {
    challenges: [{
      _id: mockChallenge._id,
      like_video_count: mockChallenge.like_video_count,
      share_video_count: mockChallenge.share_video_count,
      Title: mockChallenge.Title,
      quest: {
        _id: mockQuest._id,
        Title: mockQuest.Title,
        Description: mockQuest.Description,
        start_date: mockQuest.start_date,
        end_date: mockQuest.end_date,
        total_budget: mockQuest.total_budget,
        is_Active: mockQuest.is_Active
      },
      rewards: [mockChallengeReward],
      userChallenges: [mockUserChallenge]
    }],
    questStats: {
      totalChallenges: 1,
      totalParticipants: 1,
      fullyCompletedUsers: 0,
      fullyCompletedPercentage: 0,
      halfCompletedUsers: 0,
      halfCompletedPercentage: 0
    }
  }
};

// Mock User Quest Details Response
const mockUserQuestDetailsResponse = {
  success: true,
  message: "Quest details fetched successfully",
  data: {
    questTitle: mockQuest.Title,
    questImage: mockQuest.quest_image.toString('base64'),
    daysLeft: 7,
    isCompleted: false,
    progress: {
      totalChallenges: 1,
      completedChallenges: 0
    }
  }
};

// Mock User Challenge Details Response
const mockUserChallengeDetailsResponse = {
  success: true,
  message: "Challenges fetched successfully",
  isCompleted: false,
  data: [{
    _id: mockChallenge._id,
    Title: mockChallenge.Title,
    like_video_count: mockChallenge.like_video_count,
    share_video_count: mockChallenge.share_video_count,
    rewards: [{
      reward_type: mockChallengeReward.reward_type,
      points: mockChallengeReward.points,
      active_duration_days: mockChallengeReward.active_duration_days
    }],
    isCompleted: false
  }]
};

// Mock Quest Leaderboard Response
const mockQuestLeaderboardResponse = {
  success: true,
  message: "Leaderboard fetched successfully",
  data: {
    totalEnrolledUsers: 1,
    leaderboard: [{
      _id: new mongoose.Types.ObjectId(),
      firstname: "Test",
      lastname: "User",
      rewards: {
        points: 100,
        freeCoffee: 1,
        coupons: {
          description: "1 Free Coffee Coupon"
        }
      }
    }]
  }
};

// Mock Quest Participants Response
const mockQuestParticipantsResponse = {
  success: true,
  message: "Quest participants details retrieved successfully",
  data: {
    totalParticipants: 1,
    participants: [{
      _id: new mongoose.Types.ObjectId(),
      firstname: "Test",
      lastname: "User",
      challenges: [{
        _id: mockChallenge._id,
        title: mockChallenge.Title,
        isCompleted: false,
        like_video_count: 0,
        share_video_count: 0
      }],
      rewards: {
        points: 100,
        freeCoffee: 1
      }
    }]
  }
};

module.exports = {
  mockQuest,
  mockChallenge,
  mockChallengeReward,
  mockUserChallenge,
  mockUserQuest,
  mockUserReward,
  mockChallengeCreateRequest,
  mockChallengeResponse,
  mockGetChallengesResponse,
  mockUserQuestDetailsResponse,
  mockUserChallengeDetailsResponse,
  mockQuestLeaderboardResponse,
  mockQuestParticipantsResponse
}; 