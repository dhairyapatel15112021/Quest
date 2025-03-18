const mongoose = require('mongoose');

// Mock Challenge data
const mockChallenge = {
  _id: new mongoose.Types.ObjectId(),
  like_video_count: 5,
  share_video_count: 3,
  Title: "Test Challenge",
  fk_quest_id: new mongoose.Types.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock User Video data
const mockUserVideo = {
  _id: new mongoose.Types.ObjectId(),
  fk_user_id: new mongoose.Types.ObjectId(),
  fk_challenge_id: mockChallenge._id,
  video_filename: "test-video-123.mp4",
  isLiked: true,
  isShared: false,
  createdAt: new Date(),
  updatedAt: new Date()
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

// Mock Video Stats Response
const mockVideoStatsResponse = {
  success: true,
  data: {
    totalLikes: 5,
    totalShares: 3
  }
};

// Mock Toggle Video Like Request
const mockToggleLikeRequest = {
  video_filename: "test-video-123.mp4",
  challenge_id: mockChallenge._id.toString()
};

// Mock Toggle Video Like Response
const mockToggleLikeResponse = {
  success: true,
  isChallengeComplete: false,
  challengeMessage: "Challenge requirements not met.",
  data: {
    isLiked: true,
    stats: {
      totalLikes: 5,
      totalShares: 3
    }
  },
  message: "Video liked successfully"
};

// Mock Toggle Video Share Request
const mockToggleShareRequest = {
  video_filename: "test-video-123.mp4",
  challenge_id: mockChallenge._id.toString()
};

// Mock Toggle Video Share Response
const mockToggleShareResponse = {
  success: true,
  isChallengeComplete: true,
  challengeMessage: "Challenge completed! Rewards generated successfully.",
  data: {
    isShared: true,
    stats: {
      totalLikes: 5,
      totalShares: 4
    }
  },
  message: "Video shared successfully"
};

// Mock User Video Status Response
const mockUserVideoStatusResponse = {
  success: true,
  data: {
    is_liked: true,
    is_shared: false,
    stats: {
      totalLikes: 5,
      totalShares: 3
    }
  }
};

// Mock Challenge Progress Response
const mockChallengeProgressResponse = {
  success: true,
  data: {
    requirements: {
      like_video_count: mockChallenge.like_video_count,
      share_video_count: mockChallenge.share_video_count
    },
    progress: {
      likedVideos: 5,
      sharedVideos: 3
    }
  }
};

// Mock Challenge Completion Response
const mockChallengeCompletionResponse = {
  isComplete: true,
  message: "Challenge completed! Rewards generated successfully.",
  progress: {
    current: {
      likedVideos: 5,
      sharedVideos: 3
    },
    required: {
      likeVideoCount: mockChallenge.like_video_count,
      shareVideoCount: mockChallenge.share_video_count
    }
  }
};

// Mock Error Responses
const mockErrorResponses = {
  missingVideoFilename: {
    success: false,
    message: "Video filename is required"
  },
  missingChallengeId: {
    success: false,
    message: "Challenge ID is required"
  },
  invalidIds: {
    success: false,
    message: "Invalid challenge ID or user ID format"
  },
  challengeNotFound: {
    success: false,
    message: "Challenge not found"
  },
  alreadyShared: {
    success: false,
    message: "Video already shared"
  },
  serverError: {
    success: false,
    message: "Internal Server Error"
  }
};

module.exports = {
  mockChallenge,
  mockUserVideo,
  mockUserChallenge,
  mockVideoStatsResponse,
  mockToggleLikeRequest,
  mockToggleLikeResponse,
  mockToggleShareRequest,
  mockToggleShareResponse,
  mockUserVideoStatusResponse,
  mockChallengeProgressResponse,
  mockChallengeCompletionResponse,
  mockErrorResponses
}; 