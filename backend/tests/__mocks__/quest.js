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
  quest_image: Buffer.from('mock-image-data'),
  is_Active: "created",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock User data
const mockAdmin = {
  _id: new mongoose.Types.ObjectId(),
  username: "admin@gmail.com",
  firstname: "Admin",
  lastname: "User",
  password: "Password@123",
  is_admin: true
};

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  username: "user@gmail.com",
  firstname: "User",
  lastname: "User",
  password: "Password@123",
  is_admin: false,
};

// Mock User Quest data
const mockUserQuest = {
  _id: new mongoose.Types.ObjectId(),
  fk_user_id: mockUser._id,
  fk_quest_id: mockQuest._id,
  status: "In Progress",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock Challenge data
const mockChallenge = {
  _id: new mongoose.Types.ObjectId(),
  like_video_count: 0,
  share_video_count: 0,
  Title: "Test Challenge",
  fk_quest_id: mockQuest._id
};

// Mock User Video data
const mockUserVideo = {
  _id: new mongoose.Types.ObjectId(),
  fk_challenge_id: mockChallenge._id,
  fk_user_id: mockUser._id,
  isLiked: true,
  isShared: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock Quest Creation Request
const mockQuestCreateRequest = {
  Title: "New Test Quest",
  Description: "New Test Quest Description",
  start_date: new Date(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  total_budget: 1000,
  is_Active: "created"
};

// Mock Error Responses
const mockErrorResponses = {
  questNotFound: {
    success: false,
    message: "Quest not found"
  },
  questAlreadyCompleted: {
    success: false,
    message: "Quest already completed"
  },
  questAlreadyEnded: {
    message: "Quest has already ended"
  },
  titleAlreadyExists: {
    success: false,
    message: "Quest with this title already exists"
  },
  invalidQuestId: {
    success: false,
    message: "Invalid quest ID"
  },
  serverError: {
    success: false,
    message: "Internal Server Error",
    errors: "Error message"
  }
};

module.exports = {
  mockQuest,
  mockAdmin,
  mockUser,
  mockUserQuest,
  mockChallenge,
  mockUserVideo,
  mockQuestCreateRequest,
  mockErrorResponses
};