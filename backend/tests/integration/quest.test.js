const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index'); // Your app entry point
const Quest = require('../../src/db/models/Quest');
const User = require('../../src/db/models/User');
const UserQuest = require('../../src/db/models/UserQuest');
const bcrypt = require('bcrypt');
const { mockAdmin, mockUser, mockQuest, mockQuestCreateRequest } = require('../__mocks__/quest');

// Mock mongoose connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      once: jest.fn(),
      on: jest.fn()
    }
  };
});

describe('Quest Integration Tests', () => {
  let adminToken;
  let userToken;
  let questId;

  beforeAll(async () => {
    // Create a test database connection
    await mongoose.connect('mongodb://localhost:27017/test-db');
    
    // Clear collections
    await User.deleteMany({});
    await Quest.deleteMany({});
    await UserQuest.deleteMany({});
  });

  beforeEach(async () => {
    // Create admin and user accounts
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mockAdmin.password,salt);
    
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
      .post('/api/v1/auth/login')
      .send({
        username: mockAdmin.username,
        password: mockAdmin.password
      });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: mockUser.username,
        password: mockUser.password
      });
    userToken = userLogin.body.token;
    
    // Create a test quest
    const questResponse = await request(app)
      .post('/api/v1/quest/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(mockQuestCreateRequest);
    
    questId = questResponse.body.quest._id;
  });

  afterEach(async () => {
    // Clear collections after each test
    await User.deleteMany({});
    await Quest.deleteMany({});
    await UserQuest.deleteMany({});
  });

  afterAll(async () => {
    // Close the database connection
    await mongoose.connection.close();
  });

  describe('POST /api/v1/quest/create', () => {
    it('should create a new quest successfully as admin', async () => {
      const response = await request(app)
        .post('/api/v1/quest/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          Title: "Integration Test Quest",
          Description: "Integration Test Description",
          start_date: new Date(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          total_budget: 1500,
          is_Active: "created"
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Quest created successfully");
     
    });

    it('should fail when regular user tries to create quest', async () => {
      const response = await request(app)
        .post('/api/v1/quest/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockQuestCreateRequest);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain("Forbidden: You do not have access");
    });

    it('should fail when quest title already exists', async () => {
      // First create a quest
      await request(app)
        .post('/api/v1/quest/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockQuestCreateRequest);
      
      // Try to create another quest with the same title
      const response = await request(app)
        .post('/api/v1/quest/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockQuestCreateRequest);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Quest with this title already exists");
    });
  });

  describe('GET /api/v1/quest/get', () => {
    it('should get all quests successfully as admin', async () => {
      const response = await request(app)
        .get('/api/v1/quest/get')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.quests).toBeInstanceOf(Array);
      expect(response.body.quests.length).toBeGreaterThanOrEqual(1);
      expect(response.body.overallStats).toBeDefined();
    });

    it('should fail when regular user tries to get all quests', async () => {
      const response = await request(app)
        .get('/api/v1/quest/get')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Access denied");
    });
  });

  describe('PUT /api/v1/quest/status/:id', () => {
    it('should change quest status successfully as admin', async () => {
      const response = await request(app)
        .put(`/api/v1/quest/status/${questId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Successfully");
      expect(response.body.quest.is_Active).toBe("active");
    });

    it('should fail when regular user tries to update quest status', async () => {
      const response = await request(app)
        .put(`/api/v1/quest/status/${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Access denied");
    });

    it('should fail with invalid quest ID', async () => {
      const response = await request(app)
        .put(`/api/v1/quest/status/invalid-id`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Quest not found");
    });
  });

  describe('GET /api/v1/quest/active', () => {
    beforeEach(async () => {
      // Publish the quest to make it active
      await request(app)
        .put(`/api/v1/quest/status/${questId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should get active quests successfully as user', async () => {
      const response = await request(app)
        .get('/api/v1/quest/active')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Active quests fetched successfully");
      expect(response.body.quests).toBeInstanceOf(Array);
      expect(response.body.quests.length).toBeGreaterThanOrEqual(1);
    });

    it('should include user quest status for enrolled quests', async () => {
      // Enroll user in quest
      await UserQuest.create({
        fk_user_id: mockUser._id,
        fk_quest_id: questId,
        status: "In Progress"
      });

      const response = await request(app)
        .get('/api/v1/quest/active')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.quests[0].userQuestStatus).toBe("In Progress");
    });
  });

  describe('PUT /api/v1/quest/update/:id', () => {
    it('should update quest successfully as admin', async () => {
      const response = await request(app)
        .put(`/api/v1/quest/update/${questId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          Title: "Updated Integration Test Quest",
          Description: "Updated Integration Test Description",
          start_date: new Date(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          total_budget: 2000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Quest updated successfully");
      expect(response.body.quest).toMatchObject({
        Title: "Updated Integration Test Quest",
        Description: "Updated Integration Test Description"
      });
    });

    it('should fail when regular user tries to update quest', async () => {
      const response = await request(app)
        .put(`/api/v1/quest/update/${questId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          Title: "Updated Integration Test Quest"
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Access denied");
    });
  });

  describe('PUT /api/v1/quest/complete/:questId', () => {
    beforeEach(async () => {
      // Enroll user in quest
      await UserQuest.create({
        fk_user_id: mockUser._id,
        fk_quest_id: questId,
        status: "In Progress"
      });
    });

    it('should complete quest successfully as enrolled user', async () => {
      const response = await request(app)
        .put(`/api/v1/quest/complete/${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Quest marked as completed successfully");
    });

    it('should fail when user is not enrolled in quest', async () => {
      // Create a new quest that the user is not enrolled in
      const newQuestResponse = await request(app)
        .post('/api/v1/quest/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockQuestCreateRequest,
          Title: "Another Test Quest"
        });
      
      const newQuestId = newQuestResponse.body.quest._id;

      const response = await request(app)
        .put(`/api/v1/quest/complete/${newQuestId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User quest not found");
    });

    it('should fail when quest is already completed', async () => {
      // Complete the quest first
      await request(app)
        .put(`/api/v1/quest/complete/${questId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      // Try to complete it again
      const response = await request(app)
        .put(`/api/v1/quest/complete/${questId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Quest already completed");
    });
  });
});