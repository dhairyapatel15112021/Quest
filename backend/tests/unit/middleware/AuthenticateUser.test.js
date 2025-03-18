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