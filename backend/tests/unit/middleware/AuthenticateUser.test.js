const AuthenticateUser = require('../../../src/middleware/AuthenticateUser');
const jwt = require('jsonwebtoken');
const User = require('../../../src/db/models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../src/db/models/User');

describe('AuthenticateUser Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate user successfully with valid token', async () => {
    const mockUser = {
      _id: 'mockUserId',
      username: 'test@example.com',
      role: 'USER'
    };
    const mockToken = 'valid.jwt.token';

    mockReq.headers.authorization = `Bearer ${mockToken}`;
    jwt.verify.mockReturnValue({ id: mockUser._id });
    User.findById.mockResolvedValue(mockUser);

    await AuthenticateUser(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_KEY);
    expect(User.findById).toHaveBeenCalledWith(mockUser._id);
    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should fail when no token provided', async () => {
    await AuthenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should fail with invalid token', async () => {
    mockReq.headers.authorization = 'Bearer invalid.token';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await AuthenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false, message: 'Invalid token'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

}); 