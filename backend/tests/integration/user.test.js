const request = require('supertest');
const app = require('../../index');
const { mockUserProfile, mockUserRewards, mockSignupRequest, mockSignupResponse } = require('../__mocks__/user');
const { mockUser } = require('../__mocks__/auth');
const User = require('../../src/db/models/User');
const bcrypt = require('bcrypt');
const { UserReward } = require('../../src/db/models');

describe('User Integration Tests', () => {
  let userToken;

  beforeEach(async () => {
    // Create user account
    const hashedPassword = await bcrypt.hash(mockUser.password, 10);
    await User.create({
      ...mockUser,
      password: hashedPassword
    });

    // Login as user to get token
    const userLogin = await request(app)
      .post('/login')
      .send({
        username: mockUser.username,
        password: mockUser.password
      });
    userToken = userLogin.body.token;
  });

  describe('POST /api/v1/user/signup', () => {
    it('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(mockSignupRequest);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should fail when username already exists', async () => {
      // First registration
      await request(app)
        .post('/api/v1/user/signup')
        .send(mockSignupRequest);

      // Second registration attempt
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(mockSignupRequest);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Username already exists');
    });

    it('should fail with invalid input data', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send({
          username: 'invalid-email',
          password: '123', // Too short
          firstname: '',
          lastname: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid input data');
    });
  });

  describe('GET /api/v1/user/rewards', () => {
    it('should get user rewards successfully', async () => {
     
      const response = await request(app)
        .get('/api/v1/user/rewards')
        .set('authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('rewards');
      expect(response.body.data).toHaveProperty('summary');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/user/rewards');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });
  });
}); 