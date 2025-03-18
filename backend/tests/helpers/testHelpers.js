const mongoose = require('mongoose');
const User = require('../../src/db/models/User');
const Challenge = require('../../src/db/models/Challenge');
const UserVideo = require('../../src/db/models/UserVideo');
const UserChallenge = require('../../src/db/models/UserChallenge');
const { mockUser, mockChallenge, mockUserVideo, mockUserChallenge } = require('../__mocks__/video');

const createTestUser = async () => {
    return await User.create(mockUser);
};

const createTestChallenge = async () => {
    return await Challenge.create(mockChallenge);
};

const createTestUserVideo = async () => {
    return await UserVideo.create(mockUserVideo);
};

const createTestUserChallenge = async () => {
    return await UserChallenge.create(mockUserChallenge);
};

const createTestData = async () => {
    const user = await createTestUser();
    const challenge = await createTestChallenge();
    const userVideo = await createTestUserVideo();
    const userChallenge = await createTestUserChallenge();
    
    return {
        user,
        challenge,
        userVideo,
        userChallenge
    };
};

const clearTestData = async () => {
    await User.deleteMany({});
    await Challenge.deleteMany({});
    await UserVideo.deleteMany({});
    await UserChallenge.deleteMany({});
};

module.exports = {
    createTestUser,
    createTestChallenge,
    createTestUserVideo,
    createTestUserChallenge,
    createTestData,
    clearTestData
}; 