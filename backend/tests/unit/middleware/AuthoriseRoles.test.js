const AuthoriseRoles = require('../../../src/middleware/AuthoriseRoles');

describe('AuthoriseRoles Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should fail when user role not provided', () => {
    const allowedRoles = ['ADMIN', 'USER'];
    mockReq.user = {};

    AuthoriseRoles(allowedRoles)(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Access denied. Role not found.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle multiple allowed roles', () => {
    const allowedRoles = ['ADMIN', 'USER'];
    mockReq.user.role = 'USER';

    AuthoriseRoles(allowedRoles)(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should handle case-insensitive role comparison', () => {
    const allowedRoles = ['ADMIN', 'USER'];
    mockReq.user.role = 'admin';

    AuthoriseRoles(allowedRoles)(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });
}); 