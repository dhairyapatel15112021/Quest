const request = require('supertest');
const app = require('../../index');
const { mockUser, mockAuthResponse } = require('../__mocks__/auth');
const User = require('../../src/db/models/User');
const bcrypt = require('bcrypt');

describe('Authentication Integration Tests', () => {
  beforeEach(async () => {
    // Create a test user before each test
    const hashedPassword = await bcrypt.hash(mockUser.password, 10);
    await User.create({
      ...mockUser,
      password: hashedPassword
    });
  });

  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: mockUser.username,
          password: mockUser.password // Original password before hashing
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('role');
      expect(response.body).toHaveProperty('wallet');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('firstname');
      expect(response.body).toHaveProperty('lastname');
      expect(response.body).toHaveProperty('is_admin');
    
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: mockUser.username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('errors', 'Incorrect Password');
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('errors', 'User not found');
    });
  });

  describe('POST /refresh', () => {
    let token;

    beforeEach(async () => {
      // Login to get a valid token
      const loginResponse = await request(app)
        .post('/login')
        .send({
          username: mockUser.username,
          password: mockUser.password
        });
      token = loginResponse.body.token;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/refresh')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', mockUser.username);
      expect(response.body).toHaveProperty('role', mockUser.role);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/refresh')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/refresh');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });
}); 