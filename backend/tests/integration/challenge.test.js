const request = require('supertest');
const app = require('../../index');
const { mockChallenge,mockChallengeReward, mockChallengeResponse, mockChallengesList, mockQuestDetails } = require('../__mocks__/challenge');
const { mockQuest } = require('../__mocks__/quest');
const { mockAdmin, mockUser } = require('../__mocks__/auth');
const Challenge = require('../../src/db/models/Challenge');
const Quest = require('../../src/db/models/Quest');
const User = require('../../src/db/models/User');
const bcrypt = require('bcrypt');

describe('Challenge Integration Tests', () => {
  let adminToken;
  let userToken;
  let questId;

  beforeEach(async () => {
    // Create admin and user accounts
    const hashedPassword = await bcrypt.hash(mockUser.password, 10);
    await User.create({
      ...mockAdmin,
      password: hashedPassword
    });
    await User.create({
      ...mockUser,
      password: hashedPassword
    });

    // Login as admin and user to get tokens
    const adminLogin = await request(app)
      .post('/login')
      .send({
        username: mockAdmin.username,
        password: 'Password@123'
      });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/login')
      .send({
        username: mockUser.username,
        password: 'Password@123'
      });
    userToken = userLogin.body.token;

    // Create a test quest
    const quest = await Quest.create(mockQuest);
    questId = quest._id;
  });

  describe('POST /api/v1/challenge/create', () => {
    it('should create a new challenge successfully', async () => {
      const response = await request(app)
        .post('/api/v1/challenge/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
         challenge: {...mockChallenge,fk_quest_id: questId},
        reward : [{mockChallengeReward}]
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Challenge and rewards created successfully');
      expect(response.body.data.challenge).toMatchObject({
        Title: mockChallenge.Title,
        like_video_count: mockChallenge.like_video_count,
        share_video_count: mockChallenge.share_video_count,
        fk_quest_id: questId
      });
    });

    it('should fail when non-admin tries to create challenge', async () => {
      const response = await request(app)
        .post('/api/v1/challenge/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          challenge: {...mockChallenge,fk_quest_id: questId},
         reward : [{...mockChallengeReward}]
         });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden: You do not have access');
    });
  });

  describe('GET /api/v1/challenges', () => {
    beforeEach(async () => {
      // Create a test challenge
      await Challenge.create({
        challenge: {...mockChallenge,fk_quest_id: questId},
       reward : [{...mockChallengeReward}]
       });
    });

    it('should get all challenges for a quest successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/challenges?questId=${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.challenges).toHaveLength(1);
    });

    it('should fail when questId is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/challenges')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid quest ID format');
    });
  });

  describe('POST /api/v1/challenge/enroll/:questId', () => {
    it('should enroll user in quest successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/challenge/enroll/${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully enrolled in quest');
    });

    it('should fail when user is already enrolled', async () => {
      // First enrollment
      await request(app)
        .post(`/api/v1/challenge/enroll/${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      // Second enrollment attempt
      const response = await request(app)
        .post(`/api/v1/challenge/enroll/${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('You are already enrolled in this quest');
    });
  });

  describe('GET /api/v1/challenge/questDetails', () => {
    beforeEach(async () => {
      // Create a test challenge
      await Challenge.create({
        challenge: {...mockChallenge,fk_quest_id: questId},
       reward : [{...mockChallengeReward}]
       });
    });

    it('should get quest details successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/challenge/questDetails?questId=${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quest).toMatchObject({
        questTitle: mockQuest.Title
      });
      expect(response.body.data.quest).toHaveProperty('progress');
      expect(response.body.data.quest.progress).toHaveProperty('totalChallenges');
      expect(response.body.data.quest.progress).toHaveProperty('completedChallenges');
    });

    it('should fail when questId is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/challenge/questDetails')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Quest ID is required');
    });
  });
}); 