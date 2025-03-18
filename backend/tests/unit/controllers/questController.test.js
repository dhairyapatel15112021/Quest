const questController = require('../../../src/controllers/questController');
const Quest = require('../../../src/db/models/Quest');
const User = require('../../../src/db/models/User');
const UserQuest = require('../../../src/db/models/UserQuest');
const Challenge = require('../../../src/db/models/Challenge');
const UserVideo = require('../../../src/db/models/UserVideo');
const UserReward = require('../../../src/db/models/UserReward');
const { mockQuest, mockUser, mockUserQuest, mockQuestCreateRequest, mockErrorResponses } = require('../../__mocks__/quest');

// Mock dependencies
jest.mock('../../../src/db/models/Quest');
jest.mock('../../../src/db/models/User');
jest.mock('../../../src/db/models/UserQuest');
jest.mock('../../../src/db/models/Challenge');
jest.mock('../../../src/db/models/UserVideo');
jest.mock('../../../src/db/models/UserReward');
jest.mock('../../../src/validation/questSchema', () => ({
  safeParse: jest.fn().mockReturnValue({ success: true, data: mockQuestCreateRequest })
}));

describe('Quest Controller Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: { id: mockUser._id.toString() },
      file: null
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('questCreate', () => {
    it('should create quest successfully', async () => {
      mockReq.body = mockQuestCreateRequest;
      mockReq.file = { buffer: Buffer.from('test-image') };
      
      // Mock Quest.findOne to return null (no existing quest)
      Quest.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock the save method
      const saveMock = jest.fn().mockResolvedValue(mockQuest);
      Quest.prototype.save = saveMock;
      
      await questController.questCreate(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Quest created successfully",
        quest: expect.objectContaining({
          Title: expect.any(String)
        })
      });
    });

    it('should fail when title already exists', async () => {
      mockReq.body = mockQuestCreateRequest;
      
      // Mock Quest.findOne to return an existing quest
      Quest.findOne = jest.fn().mockResolvedValue(mockQuest);
      
      await questController.questCreate(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Quest with this title already exists"
      });
    });
  });

  describe('getQuest', () => {
    it('should get all quests successfully', async () => {
      // Mock Quest.find to return an array of quests
      Quest.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockQuest])
      });
      
      // Mock UserQuest.countDocuments
      UserQuest.countDocuments = jest.fn().mockResolvedValue(5);
      
      // Mock Challenge.find
      Challenge.find = jest.fn().mockResolvedValue([{ _id: 'challenge1' }]);
      
      // Mock UserVideo.aggregate
      UserVideo.aggregate = jest.fn().mockResolvedValue([{
        totalLikes: 10,
        totalShares: 5
      }]);
      
      // Mock UserReward.aggregate
      UserReward.aggregate = jest.fn().mockResolvedValue([{
        totalPointsDistributed: 1000
      }]);

      await questController.getQuest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        quests: expect.arrayContaining([
          expect.objectContaining({
            analytics: expect.objectContaining({
              totalParticipants: 5,
              totalLikedVideos: 10,
              totalSharedVideos: 5
            })
          })
        ]),
        overallStats: expect.objectContaining({
          totalParticipants: 5,
          totalLikedVideos: 10,
          totalSharedVideos: 5,
          totalRewardsDistributed: 1000
        })
      });
    });
  });

  describe('changeQuestActiveStatus', () => {
    it('should toggle quest status successfully from created to active', async () => {
      mockReq.params.id = mockQuest._id.toString();
      
      // Mock quest with status "created"
      const questToUpdate = {
        ...mockQuest,
        is_Active: "created",
        save: jest.fn().mockResolvedValue({ ...mockQuest, is_Active: "active" })
      };
      
      Quest.findById = jest.fn().mockResolvedValue(questToUpdate);

      await questController.changeQuestActiveStatus(mockReq, mockRes);

      expect(questToUpdate.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Quest Published Successfully",
        quest: expect.objectContaining({
          is_Active: "active"
        })
      });
    });

    it('should fail when quest not found', async () => {
      mockReq.params.id = 'nonexistentId';
      
      Quest.findById = jest.fn().mockResolvedValue(null);

      await questController.changeQuestActiveStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Quest not found"
      });
    });

    it('should fail when quest is already completed', async () => {
      mockReq.params.id = mockQuest._id.toString();
      
      // Mock completed quest
      Quest.findById = jest.fn().mockResolvedValue({
        ...mockQuest,
        is_Active: "completed"
      });

      await questController.changeQuestActiveStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Quest Is Completed,Can Not Do Changes"
      });
    });

    it('should fail when quest has already ended', async () => {
      mockReq.params.id = mockQuest._id.toString();
      
      // Mock quest with past end date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      Quest.findById = jest.fn().mockResolvedValue({
        ...mockQuest,
        end_date: pastDate
      });

      await questController.changeQuestActiveStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Quest has already ended"
      });
    });
  });

  describe('getActiveQuests', () => {
    it('should get active quests successfully', async () => {
      // Mock active quests
      const mockActiveQuests = [{
        ...mockQuest,
        is_Active: "active"
      }];
      
      Quest.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockActiveQuests)
      });
      
      UserQuest.countDocuments = jest.fn().mockResolvedValue(10);
      UserQuest.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ status: "In Progress" })
      });

      await questController.getActiveQuests(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Active quests fetched successfully",
        quests: expect.arrayContaining([
          expect.objectContaining({
            totalParticipants: 10,
            userQuestStatus: "In Progress"
          })
        ])
      });
    });
  });

  describe('updateQuest', () => {
    it('should update quest successfully', async () => {
      mockReq.params.id = mockQuest._id.toString();
      mockReq.body = {
        Title: "Updated Test Quest",
        Description: "Updated Test Quest Description",
        total_budget: 2000,
        start_date: new Date(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };
      
      // Mock existing quest
      Quest.findById = jest.fn().mockResolvedValue({
        ...mockQuest,
        is_Active: "created"
      });
      
      // No title conflict
      Quest.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock findByIdAndUpdate
      const updatedQuest = {
        ...mockQuest,
        ...mockReq.body,
        toObject: jest.fn().mockReturnValue({
          ...mockQuest,
          ...mockReq.body
        })
      };
      
      Quest.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedQuest);

      await questController.updateQuest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Quest updated successfully",
        quest: expect.objectContaining({
          Title: "Updated Test Quest"
        })
      });
    });

    it('should fail when quest not found', async () => {
      mockReq.params.id = 'nonexistentId';
      mockReq.body = {
        Title: "Updated Test Quest"
      };
      
      Quest.findById = jest.fn().mockResolvedValue(null);

      await questController.updateQuest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Quest not found"
      });
    });

    it('should fail when title already exists', async () => {
      mockReq.params.id = mockQuest._id.toString();
      mockReq.body = {
        Title: "Existing Quest Title"
      };
      
      Quest.findById = jest.fn().mockResolvedValue(mockQuest);
      
      // Mock title conflict
      Quest.findOne = jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(), // different ID
        Title: "Existing Quest Title"
      });

      await questController.updateQuest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Quest with this title already exists"
      });
    });
  });

  describe('completeQuest', () => {
    it('should complete quest successfully', async () => {
      mockReq.params.questId = mockQuest._id.toString();
      
      // Mock valid ObjectId
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      // Mock userQuest finding
      const mockUserQuestToUpdate = {
        ...mockUserQuest,
        status: "In Progress",
        save: jest.fn().mockResolvedValue({ ...mockUserQuest, status: "Completed" })
      };
      
      UserQuest.findOne = jest.fn().mockResolvedValue(mockUserQuestToUpdate);

      await questController.completeQuest(mockReq, mockRes);

      expect(mockUserQuestToUpdate.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Quest marked as completed successfully"
      });
    });

    it('should fail with invalid quest ID', async () => {
      mockReq.params.questId = 'invalid-id';
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await questController.completeQuest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid quest ID"
      });
    });

    it('should fail when user quest not found', async () => {
      mockReq.params.questId = mockQuest._id.toString();
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      UserQuest.findOne = jest.fn().mockResolvedValue(null);

      await questController.completeQuest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User quest not found"
      });
    });

    it('should fail when quest already completed', async () => {
      mockReq.params.questId = mockQuest._id.toString();
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      UserQuest.findOne = jest.fn().mockResolvedValue({
        ...mockUserQuest,
        status: "Completed"
      });

      await questController.completeQuest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Quest already completed"
      });
    });
  });
});