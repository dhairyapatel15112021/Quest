const mongoose = require('mongoose');

// Mock user data matching User model schema
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'test@example.com',
  password: 'Password@123', // bcrypt hashed password
  firstname: 'Test',
  lastname: 'User',
  is_admin: false,
  role: 'USER',
  wallet: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock admin data matching User model schema
const mockAdmin = {
  _id: new mongoose.Types.ObjectId(),
  username: 'admin@example.com',
  password: 'Password@123', // bcrypt hashed password
  firstname: 'Admin',
  lastname: 'User',
  is_admin: true,
  role: 'ADMIN',
  wallet: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock JWT token
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RAZXhhbXBsZS5jb20iLCJpZCI6IjY1ZjI5YjI5YjI5YjI5YjI5YjI5YjI5IiwiaWF0IjoxNzEwODI5MjAwLCJleHAiOjE3MTA4MzI4MDB9.YourJWTTokenHere';

// Mock successful auth response matching controller response
const mockAuthResponse = {
  success: true,
  token: mockToken,
  user: {
    id: mockUser._id,
    username: mockUser.username,
    firstname: mockUser.firstname,
    lastname: mockUser.lastname,
    role: 'USER', // from ROLES env variable
    wallet: mockUser.wallet,
    is_admin: mockUser.is_admin
  }
};

// Mock admin auth response
const mockAdminAuthResponse = {
  success: true,
  token: mockToken,
  user: {
    id: mockAdmin._id,
    username: mockAdmin.username,
    firstname: mockAdmin.firstname,
    lastname: mockAdmin.lastname,
    role: 'ADMIN', // from ROLES env variable
    wallet: mockAdmin.wallet,
    is_admin: mockAdmin.is_admin
  }
};

// Mock error response matching controller error format
const mockErrorResponse = {
  success: false,
  errors: 'Error message'
};

// Mock login request body matching controller validation
const mockLoginRequest = {
  username: 'test@example.com',
  password: 'password123'
};

// Mock invalid login request
const mockInvalidLoginRequest = {
  username: 'invalid@email',
  password: '' // empty password
};

module.exports = {
  mockUser,
  mockAdmin,
  mockToken,
  mockAuthResponse,
  mockAdminAuthResponse,
  mockErrorResponse,
  mockLoginRequest,
  mockInvalidLoginRequest
}; 