const authController = require('../../../src/controllers/authController');
const User = require('../../../src/db/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock dependencies  
jest.mock('../../../src/db/models/User');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Auth Controller Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockUser;

  beforeEach(() => {
    mockUser = {
      _id: 'mockUserId',
      username: 'testuser',
      password: 'hashedPassword',
      is_admin: false
    };

    mockReq = {
      body: {
        username: 'testuser',
        password: 'password123'
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockToken',
        id: mockUser._id,
        role: mockUser.role,
        wallet: mockUser.wallet,
        username: mockUser.username,
        firstname: mockUser.firstname,
        lastname: mockUser.lastname,
      });
    });

    it('should fail with invalid credentials', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        errors : "Incorrect Password"
      });
    });

    it('should fail when user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        errors: 'User not found'
      });
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      mockReq.user = mockUser;
      jwt.sign.mockReturnValue('newToken');

      await authController.refresh(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        id: mockUser._id,
        role: mockUser.role,
        wallet: mockUser.wallet,
        username: mockUser.username,
        firstname: mockUser.firstname,
        lastname: mockUser.lastname,
      });
    });
    
  });
}); 