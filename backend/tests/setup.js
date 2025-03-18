const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let isConnected = false;

// Connect to the in-memory database before running tests
beforeAll(async () => {
    if (!isConnected) {
        try {
            mongoServer = await MongoMemoryServer.create({
                instance: {
                    dbName: 'jest',
                    // Remove fixed port to use random port
                    storageEngine: 'wiredTiger'
                }
            });
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                // Disable transactions for local MongoDB
                autoIndex: false,
                autoCreate: false
            });
            isConnected = true;
            console.log('Test Database Connected');
        } catch (error) {
            console.error('Failed to connect to test database:', error);
            throw error;
        }
    }
});

// Clear all data between tests
afterEach(async () => {
    if (isConnected) {
        try {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                const collection = collections[key];
                await collection.deleteMany();
            }
            console.log('Test Database Cleared');
        } catch (error) {
            console.error('Failed to clear test database:', error);
            throw error;
        }
    }
});

// Disconnect and close the in-memory database after all tests
afterAll(async () => {
    if (isConnected) {
        try {
            await mongoose.disconnect();
            await mongoServer.stop();
            isConnected = false;
            console.log('Test Database Connection Closed');
        } catch (error) {
            console.error('Failed to close test database connection:', error);
            throw error;
        }
    }
});

// Global test timeout
jest.setTimeout(30000);

// Prevent server from starting during tests
process.env.NODE_ENV = 'test'; 