const videoController = require('../../../src/controllers/videoController');
const Video = require('../../../src/db/models/UserVideo');
const Challenge = require('../../../src/db/models/Challenge');
const User = require('../../../src/db/models/User');  

// Mock dependencies
jest.mock('../../../src/db/models/UserVideo');
jest.mock('../../../src/db/models/Challenge');
jest.mock('../../../src/db/models/User');

describe('Video Controller Unit Tests', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let mockVideo;
    let mockChallenge;
    let mockUser;

    beforeEach(() => {
        mockUser = {
            _id: 'mockUserId',
            username: 'testuser'
        };

        mockChallenge = {
            _id: 'mockChallengeId',
            title: 'Test Challenge',
            fk_quest_id: 'mockQuestId'
        };

        mockVideo = {
            _id: 'mockVideoId',
            fk_challenge_id: 'mockChallengeId',
            fk_user_id: 'mockUserId',
            video_filename: 'test-video.mp4',
            isLiked: false,
            isShared: false
        };

        mockReq = {
            body: {},
            params: {},
            user: mockUser
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockNext = jest.fn();
    });

    describe('getVideoStats', () => {
        it('should get video stats successfully', async () => {
            mockReq.query = { video_filename: 'test-video.mp4' };
            Video.findOne.mockResolvedValue(mockVideo);
            Challenge.findById.mockResolvedValue(mockChallenge);

            await videoController.getVideoStats(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    likes: 0,
                    shares: 0,
                    challenge: mockChallenge
                }
            });
        });

        it('should fail when video filename is missing', async () => {
            await videoController.getVideoStats(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Video filename is required'
            });
        });
    });

    describe('toggleVideoLike', () => {
        it('should toggle video like successfully', async () => {
            mockReq.body = {
                video_filename: 'test-video.mp4',
                challenge_id: 'mockChallengeId'
            };
            Video.findOne.mockResolvedValue(mockVideo);
            Video.findOneAndUpdate.mockResolvedValue({ ...mockVideo, isLiked: true });

            await videoController.toggleVideoLike(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    video: { ...mockVideo, isLiked: true }
                }
            });
        });

        it('should fail when challenge ID is missing', async () => {
            mockReq.body = { video_filename: 'test-video.mp4' };

            await videoController.toggleVideoLike(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Video filename and challenge ID are required'
            });
        });
    });

    describe('toggleVideoShare', () => {
        it('should toggle video share successfully', async () => {
            mockReq.body = {
                video_filename: 'test-video.mp4',
                challenge_id: 'mockChallengeId'
            };
            Video.findOne.mockResolvedValue(mockVideo);
            Video.findOneAndUpdate.mockResolvedValue({ ...mockVideo, isShared: true });

            await videoController.toggleVideoShare(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    video: { ...mockVideo, isShared: true }
                }
            });
        });

        it('should fail when challenge ID is missing', async () => {
            mockReq.body = { video_filename: 'test-video.mp4' };

            await videoController.toggleVideoShare(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Video filename and challenge ID are required'
            });
        });
    });
}); 