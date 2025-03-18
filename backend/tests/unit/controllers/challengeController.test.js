const challengeController = require('../../../src/controllers/challengeController');
const Challenge = require('../../../src/db/models/Challenge');
const Quest = require('../../../src/db/models/Quest');
const User = require('../../../src/db/models/User');

// Mock dependencies
jest.mock('../../../src/db/models/Challenge');
jest.mock('../../../src/db/models/Quest');
jest.mock('../../../src/db/models/User');

describe('Challenge Controller Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createChallenge', () => {
    const mockChallenge = {
      _id: 'mockChallengeId',
      title: 'Test Challenge',
      description: 'Test Description',
      fk_quest_id: 'mockQuestId',
      points: 100
    };

    it('should create challenge successfully', async () => {
      mockReq.body = {
        title: 'Test Challenge',
        description: 'Test Description',
        fk_quest_id: 'mockQuestId',
        points: 100
      };
      Quest.findById.mockResolvedValue({ _id: 'mockQuestId' });
      Challenge.create.mockResolvedValue(mockChallenge);

      await challengeController.createChallenge(mockReq, mockRes, mockNext);

      expect(Quest.findById).toHaveBeenCalledWith('mockQuestId');
      expect(Challenge.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          challenge: expect.objectContaining({
            title: mockChallenge.title,
            description: mockChallenge.description
          })
        })
      }));
    });

    it('should fail when quest not found', async () => {
      mockReq.body = {
        title: 'Test Challenge',
        fk_quest_id: 'nonexistent'
      };
      Quest.findById.mockResolvedValue(null);

      await challengeController.createChallenge(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Quest not found'
      });
    });
  });

  describe('getChallenges', () => {
    const mockChallenges = [{
      _id: 'mockChallengeId',
      title: 'Test Challenge',
      description: 'Test Description',
      fk_quest_id: 'mockQuestId'
    }];

    it('should get challenges successfully', async () => {
      mockReq.query.questId = 'mockQuestId';
      Challenge.find.mockResolvedValue(mockChallenges);
      Challenge.countDocuments.mockResolvedValue(1);

      await challengeController.getChallenges(mockReq, mockRes, mockNext);

      expect(Challenge.find).toHaveBeenCalledWith({ fk_quest_id: 'mockQuestId' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          challenges: expect.any(Array)
        })
      }));
    });

    it('should fail when questId not provided', async () => {
      await challengeController.getChallenges(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Quest ID is required'
      });
    });
  });

  describe('enrollChallenge', () => {
    const mockQuest = {
      _id: 'mockQuestId',
      participants: [],
      challenges: ['mockChallengeId']
    };

    it('should enroll user in quest successfully', async () => {
      mockReq.params.questId = 'mockQuestId';
      mockReq.user = { _id: 'mockUserId' };
      Quest.findById.mockResolvedValue(mockQuest);
      Quest.findByIdAndUpdate.mockResolvedValue({
        ...mockQuest,
        participants: ['mockUserId']
      });

      await challengeController.enrollChallenge(mockReq, mockRes, mockNext);

      expect(Quest.findById).toHaveBeenCalledWith('mockQuestId');
      expect(Quest.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String)
      }));
    });

    it('should fail when quest not found', async () => {
      mockReq.params.questId = 'nonexistent';
      Quest.findById.mockResolvedValue(null);

      await challengeController.enrollChallenge(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Quest not found'
      });
    });

    it('should fail when user already enrolled', async () => {
      mockReq.params.questId = 'mockQuestId';
      mockReq.user = { _id: 'mockUserId' };
      Quest.findById.mockResolvedValue({
        ...mockQuest,
        participants: ['mockUserId']
      });

      await challengeController.enrollChallenge(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Already enrolled in this quest'
      });
    });
  });

  describe('getUserQuestDetails', () => {
    const mockQuestDetails = {
      _id: 'mockQuestId',
      title: 'Test Quest',
      description: 'Test Description',
      challenges: ['mockChallengeId'],
      participants: ['mockUserId']
    };

    it('should get quest details successfully', async () => {
      mockReq.query.questId = 'mockQuestId';
      mockReq.user = { _id: 'mockUserId' };
      Quest.findById.mockResolvedValue(mockQuestDetails);

      await challengeController.getUserQuestDetails(mockReq, mockRes, mockNext);

      expect(Quest.findById).toHaveBeenCalledWith('mockQuestId');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          quest: expect.objectContaining({
            title: mockQuestDetails.title,
            description: mockQuestDetails.description
          })
        })
      }));
    });

    it('should fail when questId not provided', async () => {
      await challengeController.getUserQuestDetails(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Quest ID is required'
      });
    });
  });
}); 