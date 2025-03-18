const request = require('supertest');
const app = require('../../index');
const { createTestData, clearTestData } = require('../helpers/testHelpers');
const { mockVideoStatsResponse, mockToggleLikeRequest, mockToggleLikeResponse } = require('../__mocks__/video');
const { mockVideo, mockVideoResponse, mockVideoStatus, mockChallengeProgress } = require('../__mocks__/video');
const { mockChallenge } = require('../__mocks__/challenge');
const { mockQuest } = require('../__mocks__/quest');
const { mockUser } = require('../__mocks__/auth');
const Video = require('../../../src/db/models/Video');
const Challenge = require('../../../src/db/models/Challenge');
const Quest = require('../../../src/db/models/Quest');
const User = require('../../../src/db/models/User');
const bcrypt = require('bcrypt');

describe('Video Controller Tests', () => {
    let testData;
    let authToken;

    beforeAll(async () => {
        // Create test data
        testData = await createTestData();
        // Get auth token (you'll need to implement this based on your auth system)
        authToken = 'your-test-auth-token';
    });

    afterAll(async () => {
        await clearTestData();
    });

    describe('GET /api/videos/stats', () => {
        it('should get video stats', async () => {
            const response = await request(app)
                .get('/api/videos/stats')
                .query({ video_filename: testData.userVideo.video_filename })
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockVideoStatsResponse);
        });

        it('should return error for missing video filename', async () => {
            const response = await request(app)
                .get('/api/videos/stats')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: 'Video filename is required'
            });
        });
    });

    describe('POST /api/videos/like', () => {
        it('should toggle video like status', async () => {
            const response = await request(app)
                .post('/api/videos/like')
                .set('Authorization', `Bearer ${authToken}`)
                .send(mockToggleLikeRequest);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockToggleLikeResponse);
        });
    });

    // Add more test cases for other endpoints
});

describe('Video Integration Tests', () => {
  let userToken;
  let questId;
  let challengeId;
  let videoId;

  beforeEach(async () => {
    // Create user account
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      ...mockUser,
      password: hashedPassword
    });

    // Login as user to get token
    const userLogin = await request(app)
      .post('/login')
      .send({
        username: mockUser.username,
        password: 'password123'
      });
    userToken = userLogin.body.token;

    // Create test quest and challenge
    const quest = await Quest.create(mockQuest);
    questId = quest._id;

    const challenge = await Challenge.create({
      ...mockChallenge,
      questId
    });
    challengeId = challenge._id;

    // Create test video
    const video = await Video.create({
      ...mockVideo,
      challengeId,
      userId: mockUser._id
    });
    videoId = video._id;
  });

  describe('GET /api/v1/video/stats', () => {
    it('should get video statistics successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/video/stats?videoId=${videoId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toMatchObject({
        totalLikes: 0,
        totalComments: 0,
        engagementRate: 0
      });
    });

    it('should fail when videoId is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/video/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Video ID is required');
    });
  });

  describe('GET /api/v1/video/status', () => {
    it('should get user video status successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/video/status?videoId=${videoId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        hasLiked: false,
        hasCommented: false,
        isCompleted: false
      });
    });

    it('should fail when videoId is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/video/status')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Video ID is required');
    });
  });

  describe('GET /api/v1/video/progress/:challenge_id', () => {
    it('should get challenge progress successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/video/progress/${challengeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        challengeId,
        userId: mockUser._id,
        status: 'in_progress'
      });
    });

    it('should fail when challenge_id is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/video/progress/')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/video/like', () => {
    it('should like video successfully', async () => {
      const response = await request(app)
        .post('/api/v1/video/like')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ videoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Video liked successfully');
    });

    it('should fail when videoId is not provided', async () => {
      const response = await request(app)
        .post('/api/v1/video/like')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Video ID is required');
    });

    it('should fail when user has already liked the video', async () => {
      // First like
      await request(app)
        .post('/api/v1/video/like')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ videoId });

      // Second like attempt
      const response = await request(app)
        .post('/api/v1/video/like')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ videoId });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Already liked this video');
    });
  });
}); 