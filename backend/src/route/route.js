const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const authController = require("../controllers/authController");
const AuthenticateUser = require("../middleware/AuthenticateUser");
const AuthoriseRoles = require("../middleware/AuthoriseRoles");
const questController = require("../controllers/questController");
const userController = require("../controllers/userController");
const challengeController = require("../controllers/challengeController");
const {
    getVideoStats,
    getUserVideoStatus,
    getChallengeProgress,
    toggleVideoLike,
    toggleVideoShare
} = require('../controllers/videoController');

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Roles = process.env.ROLES.split(",");

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:  
 *     summary: Authenticate User
 *     description: Authenticates user credentials and returns an access token with user details
 *     tags: [Authentication]   
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - username
 *               - password
 *             example:
 *               username: "test@test.com"
 *               password: "password"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 username:
 *                   type: string
 *                   description: User's email address
 *                 is_admin:
 *                   type: boolean
 *                   description: User's admin status
 *                 id:
 *                   type: string
 *                   description: Unique user identifier
 *                 role:
 *                   type: string
 *                   description: User's role (ADMIN/USER)
 *                 firstname:   
 *                   type: string
 *                   description: User's first name
 *                 lastname:
 *                   type: string
 *                   description: User's last name
 *                 wallet:
 *                   type: number
 *                   description: User's wallet balance
 * 
 *       401:
 *         description: Authentication failed - Invalid credentials
 *       404:
 *         description: User account not found
 */
router.post("/login",authController.login);

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh Access Token
 *     description: Generates a new access token for the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refresh successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: User's email address
 *                 is_admin:
 *                   type: boolean
 *                   description: Whether the user is an admin
 *                 id:
 *                   type: string
 *                   description: Unique user identifier
 *                 role:
 *                   type: string
 *                   description: User's role (ADMIN/USER)
 *                 firstname:   
 *                   type: string
 *                   description: User's first name
 *                 lastname:
 *                   type: string
 *                   description: User's last name
 *                 wallet:
 *                   type: string
 *                   description: User's wallet balance
 *       401:
 *         description: Token refresh failed - Invalid or expired token
 *       404:
 *         description: User account not found
 */
router.post("/refresh",AuthenticateUser,authController.refresh);

// Quest Controllers
/**
 * @swagger
 * /api/v1/quest/create:
 *   post:
 *     summary: Create New Quest
 *     description: Creates a new quest with image, title, description , timeline and budget of the quest
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               quest_image:
 *                 type: string
 *                 format: binary
 *                 description: Quest cover image
 *               Title:
 *                 type: string
 *                 description: Quest title
 *               Description:
 *                 type: string
 *                 description: Detailed quest description
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Quest start date
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Quest end date
 *               total_budget:
 *                 type: number
 *                 description: Total reward budget for the quest
 *     responses:
 *       201:
 *         description: Quest created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post("/api/v1/quest/create",AuthenticateUser,AuthoriseRoles([Roles[0]]),upload.single("quest_image"),questController.questCreate);
/**
 * @swagger
 * /api/v1/quest/get:
 *   get:
 *     summary: Get All Quests
 *     description: Retrieves a comprehensive list of all quests with detailed statistics
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved quests and statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 overallStats:    
 *                   type: object
 *                   properties:
 *                     totalActiveQuests:
 *                       type: number
 *                       description: Number of currently active quests
 *                     totalParticipants:
 *                       type: number
 *                       description: Total number of quest participants
 *                     totalLikedVideos:
 *                       type: number
 *                       description: Total number of video likes
 *                     totalSharedVideos:
 *                       type: number
 *                       description: Total number of video shares
 *                     totalRewardsDistributed:
 *                       type: number
 *                       description: Total rewards distributed
 *                 quests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique quest identifier
 *                       Title:
 *                         type: string
 *                         description: Quest title
 *                       Description:
 *                         type: string
 *                         description: Quest description
 *                       start_date:
 *                         type: string
 *                         description: Quest start date
 *                       end_date:
 *                         type: string
 *                         description: Quest end date
 *                       total_budget:
 *                         type: number
 *                         description: Quest reward budget
 *                       is_active:
 *                         type: boolean
 *                         description: Quest status
 *                       create_by:
 *                         type: string
 *                         description: Quest creator ID
 *                       quest_image:
 *                         type: string
 *                         description: Quest cover image URL
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/quest/get",AuthenticateUser,AuthoriseRoles([Roles[0]]),questController.getQuest);
/** 
 * @swagger
 * /api/v1/quest/toggle/{id}:
 *   put:
 *     summary: Toggle Quest Status
 *     description: Activates or deactivates a quest's visibility to users
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique quest identifier
 *     responses:
 *       200:
 *         description: Quest status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Status update message
 *                 quest:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique quest identifier
 *                     Title:
 *                       type: string
 *                       description: Quest title
 *                     Description:
 *                       type: string
 *                       description: Quest description
 *                     start_date:
 *                       type: string
 *                       description: Quest start date
 *                     end_date:
 *                       type: string
 *                       description: Quest end date
 *                     total_budget:
 *                       type: number
 *                       description: Quest reward budget
 *                     is_active:
 *                       type: boolean
 *                       description: Quest visibility status
 *                     create_by:
 *                       type: string
 *                       description: Quest creator ID
 *                     quest_image:
 *                       type: string
 *                       description: Quest cover image URL
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Quest not found
 *       400:
 *         description: Invalid request parameters
 */
router.put("/api/v1/quest/toggle/:id",AuthenticateUser,AuthoriseRoles([Roles[0]]),questController.changeQuestActiveStatus);
/**
 * @swagger
 * /api/v1/quest/active:
 *   get:
 *     summary: Get Active Quests
 *     description: Retrieves all currently active quests available for user participation
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved active quests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique quest identifier
 *                       Title:
 *                         type: string
 *                         description: Quest title
 *                       Description:
 *                         type: string
 *                         description: Quest description
 *                       start_date:
 *                         type: string
 *                         description: Quest start date
 *                       end_date:
 *                         type: string
 *                         description: Quest end date
 *                       total_budget:
 *                         type: number
 *                         description: Quest reward budget
 *                       quest_image:
 *                         type: string
 *                         description: Quest cover image URL
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/quest/active", AuthenticateUser, AuthoriseRoles([Roles[1]]), questController.getActiveQuests);
/**
 * @swagger
 * /api/v1/quest/{id}:
 *   put:
 *     summary: Update Quest Details
 *     description: Modifies an existing quest's information and cover image
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique quest identifier
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               quest_image:
 *                 type: string
 *                 format: binary
 *                 description: New quest cover image
 *               Title:
 *                 type: string
 *                 description: Updated quest title
 *               Description:
 *                 type: string
 *                 description: Updated quest description
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Updated quest start date
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Updated quest end date
 *               total_budget:
 *                 type: number
 *                 description: Updated quest reward budget
 *     responses:
 *       200:
 *         description: Quest updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Quest not found
 */
router.put("/api/v1/quest/:id", AuthenticateUser, AuthoriseRoles([Roles[0]]),upload.single("quest_image"), questController.updateQuest);
/**
 * @swagger
 * /api/v1/user/quest/complete/{questId}:
 *   put:
 *     summary: Complete Quest
 *     description: Marks a quest as completed for the authenticated user
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique quest identifier
 *     responses:
 *       200:
 *         description: Quest completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Completion status message
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Quest not found
 *       400:
 *         description: Quest already completed or not enrolled
 */
router.put("/api/v1/user/quest/complete/:questId", AuthenticateUser, AuthoriseRoles([Roles[1]]), questController.completeQuest);

// User Controller
/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     summary: Register New User
 *     description: Creates a new user account with basic information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               firstname:
 *                 type: string
 *                 description: User's first name
 *               lastname:
 *                 type: string
 *                 description: User's last name
 *             required:
 *               - username
 *               - password
 *               - firstname
 *               - lastname
 *     responses:
 *       201:
 *         description: User account created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Email already registered
 */
router.post("/api/v1/user/signup",userController.signup);

/**
 * @swagger
 * /api/v1/user/rewards:
 *   get:
 *     summary: Get User Rewards
 *     description: Retrieves all rewards and reward statistics for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rewards:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             reward_type:
 *                               type: string
 *                               description: Type of reward
 *                             points:
 *                               type: number
 *                               description: Reward points
 *                             claimed:
 *                               type: boolean
 *                               description: Reward claim status
 *                             claimed_at:
 *                               type: string
 *                               description: Reward claim timestamp
 *                             status:
 *                               type: string
 *                               description: Reward status
 *                       summary:
 *                         type: object
 *                         properties:
 *                           total_points:
 *                             type: number
 *                             description: Total accumulated points
 *                           total_rewards:
 *                             type: number
 *                             description: Total number of rewards
 *                           total_free_coffee:
 *                             type: number
 *                             description: Total free coffee rewards
 *                           claimed_rewards:
 *                             type: number
 *                             description: Number of claimed rewards
 *                           active_rewards:
 *                             type: number
 *                             description: Number of active rewards
 *                           expired_rewards:
 *                             type: number
 *                             description: Number of expired rewards
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/user/rewards",AuthenticateUser,AuthoriseRoles([Roles[1]]),userController.rewards);

/**
 * @swagger
 * /api/v1/user/reward/claim/{id}:
 *   put:
 *     summary: Claim User Reward
 *     description: Claims a specific reward for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique reward identifier
 *     responses:
 *       200:
 *         description: Reward claimed successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Reward not found
 *       400:
 *         description: Reward already claimed or invalid
 */
router.put("/api/v1/user/reward/claim/:id",AuthenticateUser,AuthoriseRoles([Roles[1]]),userController.claimReward);

// Challenge Controller
/**
 * @swagger
 * /api/v1/challenge/create:
 *   post:
 *     summary: Create New Challenge
 *     description: Creates a new challenge within a quest with associated rewards
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fk_quest_id:
 *                 type: string
 *                 description: Parent quest identifier
 *               title:
 *                 type: string
 *                 description: Challenge title
 *               description:
 *                 type: string
 *                 description: Challenge description
 *               points:
 *                 type: number
 *                 description: Points awarded for completion
 *             required:
 *               - fk_quest_id
 *               - title
 *               - description
 *               - points
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post("/api/v1/challenge/create", AuthenticateUser, AuthoriseRoles(Roles[0]), challengeController.createChallenge);

/**
 * @swagger
 * /api/v1/challenges:
 *   get:
 *     summary: Get Quest Challenges
 *     description: Retrieves all challenges for a specific quest with participation statistics
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: questId
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent quest identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Unique challenge identifier
 *                           title:
 *                             type: string
 *                             description: Challenge title
 *                           description:
 *                             type: string
 *                             description: Challenge description
 *                           fk_quest_id:
 *                             type: string
 *                             description: Parent quest identifier
 *                           rewards:    
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 reward_type:
 *                                   type: string
 *                                   description: Type of reward
 *                                 points:
 *                                   type: number
 *                                   description: Reward points
 *                           questStats:
 *                             type: object
 *                             properties:
 *                               totalChallenges:
 *                                 type: number
 *                                 description: Total number of challenges
 *                               totalParticipants:
 *                                 type: number
 *                                 description: Total number of participants
 *                               fullyCompletedUsers:
 *                                 type: number
 *                                 description: Users who completed all challenges
 *                               fullyCompletedPercentage:
 *                                 type: number
 *                                 description: Percentage of fully completed users
 *                               halfCompletedUsers:    
 *                                 type: number
 *                                 description: Users who completed half of the challenges
 *                               halfCompletedPercentage:
 *                                 type: number
 *                                 description: Percentage of half completed users
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/challenges", AuthenticateUser, AuthoriseRoles(Roles[0]), challengeController.getChallenges);

/**
 * @swagger
 * /api/v1/challenge/enroll/{questId}:
 *   post:
 *     summary: Enroll in Quest
 *     description: Registers the authenticated user for participation in a quest
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique quest identifier
 *     responses:
 *       200:
 *         description: Successfully enrolled in quest
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Enrollment status message
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Quest not found
 *       400:
 *         description: Already enrolled or invalid request
 */
router.post("/api/v1/challenge/enroll/:questId", AuthenticateUser, AuthoriseRoles(Roles[1]), challengeController.enrollChallenge);

/**
 * @swagger
 * /api/v1/challenge/questDetails/:
 *   get:
 *     summary: Get Quest Details
 *     description: Retrieves detailed information about a specific quest for the authenticated user
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: questId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique quest identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved quest details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   type: object
 *                   properties:
 *                     questTitle:
 *                       type: string
 *                       description: Quest title
 *                     questImage:
 *                       type: string
 *                       description: Quest cover image URL
 *                     daysLeft:
 *                       type: number
 *                       description: Days remaining in quest
 *                     isCompleted:
 *                       type: boolean
 *                       description: Quest completion status
 *                     progress:
 *                       type: object
 *                       properties:
 *                         totalChallenges:
 *                           type: number
 *                           description: Total number of challenges
 *                         completedChallenges:
 *                           type: number
 *                           description: Number of completed challenges
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/challenge/questDetails/", AuthenticateUser, AuthoriseRoles(Roles[1]), challengeController.getUserQuestDetails);

/**
 * @swagger
 * /api/v1/challenge/user/details/:
 *   get:
 *     summary: Get User Challenge Details
 *     description: Retrieves detailed information about a specific challenge for the authenticated user
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique challenge identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved challenge details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 isCompleted:
 *                   type: boolean
 *                   description: Challenge completion status
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique challenge identifier
 *                     Title:
 *                       type: string
 *                       description: Challenge title
 *                     like_video_count:
 *                       type: number
 *                       description: Required video likes
 *                     share_video_count:   
 *                       type: number
 *                       description: Required video shares
 *                     rewards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           reward_type:
 *                             type: string
 *                             description: Type of reward
 *                           points:
 *                             type: number
 *                             description: Reward points
 *                     fk_quest_id:
 *                       type: string
 *                       description: Parent quest identifier
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/challenge/user/details/", AuthenticateUser, AuthoriseRoles(Roles[1]), challengeController.getUserChallengeDetails);

/**
 * @swagger
 * /api/v1/quest/leaderboard/:
 *   get:
 *     summary: Get Quest Leaderboard
 *     description: Retrieves the current leaderboard standings for a specific quest
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: questId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique quest identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEnrolledUsers:
 *                       type: number
 *                       description: Total number of enrolled users
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           firstname:
 *                             type: string
 *                             description: User's first name
 *                           lastname:
 *                             type: string
 *                             description: User's last name
 *                           points:
 *                             type: number
 *                             description: Total points earned
 *                           rank:
 *                             type: number
 *                             description: Current ranking
 *                           rewards:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 reward_type:
 *                                   type: string
 *                                   description: Type of reward
 *                                 points:
 *                                   type: number
 *                                   description: Reward points
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/quest/leaderboard/", AuthenticateUser, AuthoriseRoles(Roles[1]), challengeController.getQuestLeaderboard);

/**
 * @swagger
 * /api/v1/challenge/participants:
 *   get:
 *     summary: Get Quest Participants
 *     description: Retrieves detailed information about all participants in a specific quest
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: questId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique quest identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalParticipants:
 *                       type: number
 *                       description: Total number of participants
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Unique participant identifier
 *                           firstname:
 *                             type: string
 *                             description: Participant's first name
 *                           lastname:
 *                             type: string
 *                             description: Participant's last name
 *                           rewards:
 *                             type: object
 *                             properties:
 *                               points:
 *                                 type: number
 *                                 description: Total points earned
 *                               freeCoffee:    
 *                                 type: number
 *                                 description: Number of free coffee rewards
 *                           challenges:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 isCompleted:
 *                                   type: boolean
 *                                   description: Challenge completion status
 *                                 like_video_count:
 *                                   type: number
 *                                   description: Number of video likes
 *                                 share_video_count:
 *                                   type: number
 *                                   description: Number of video shares
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get("/api/v1/challenge/participants", AuthenticateUser, AuthoriseRoles(Roles[0]), challengeController.getQuestParticipantsDetails);

// Video Controller
/**
 * @swagger
 * /api/v1/video/stats:
 *   get:
 *     summary: Get Video Statistics
 *     description: Retrieves engagement statistics for a specific video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: video_filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Video filename
 *     responses:
 *       200:
 *         description: Successfully retrieved video statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_likes:
 *                       type: number
 *                       description: Total number of likes
 *                     total_shares:
 *                       type: number
 *                       description: Total number of shares
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get('/api/v1/video/stats',AuthenticateUser, getVideoStats);

/**
 * @swagger
 * /api/v1/video/status:
 *   get:
 *     summary: Get User Video Status
 *     description: Retrieves the authenticated user's interaction status with a specific video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: video_filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Video filename
 *       - in: query
 *         name: challenge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Associated challenge identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved video status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:    
 *                   type: object
 *                   properties:
 *                     is_liked:
 *                       type: boolean
 *                       description: User's like status
 *                     is_shared:
 *                       type: boolean
 *                       description: User's share status
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalLikes:
 *                           type: number
 *                           description: Total number of likes
 *                         totalShares:
 *                           type: number
 *                           description: Total number of shares
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get('/api/v1/video/status', AuthenticateUser, getUserVideoStatus);

/**
 * @swagger
 * /api/v1/video/progress/{challenge_id}:
 *   get:
 *     summary: Get Challenge Progress
 *     description: Retrieves the user's progress in completing a specific challenge
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challenge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique challenge identifier
 *     responses:
 *       200:
 *         description: Successfully retrieved challenge progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   type: object
 *                   properties:
 *                     requirements:
 *                       type: object
 *                       properties:
 *                         like_video_count:
 *                           type: number
 *                           description: Required number of likes
 *                         share_video_count:
 *                           type: number
 *                           description: Required number of shares
 *                     progress:
 *                       type: object
 *                       properties:
 *                         like_video_count:
 *                           type: number
 *                           description: Current number of likes
 *                         share_video_count:
 *                           type: number
 *                           description: Current number of shares
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.get('/api/v1/video/progress/:challenge_id',AuthenticateUser, getChallengeProgress);

/**
 * @swagger
 * /api/v1/video/like:
 *   post:
 *     summary: Toggle Video Like
 *     description: Toggles the like status for a specific video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               video_filename:    
 *                 type: string
 *                 description: Video filename
 *               challenge_id:
 *                 type: string
 *                 description: Associated challenge identifier
 *             required:
 *               - video_filename
 *               - challenge_id
 *     responses:
 *       200:
 *         description: Successfully updated like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Status update message
 *                 isChallengeComplete:
 *                   type: boolean
 *                   description: Challenge completion status
 *                 challengeMessage:
 *                   type: string
 *                   description: Challenge status message
 *                 data:
 *                   type: object
 *                   properties:
 *                     isLiked:
 *                       type: boolean
 *                       description: Updated like status
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalLikes:
 *                           type: number
 *                           description: Total number of likes
 *                         totalShares:
 *                           type: number
 *                           description: Total number of shares
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.post('/api/v1/video/like', AuthenticateUser, toggleVideoLike);

/**
 * @swagger
 * /api/v1/video/share:
 *   post:
 *     summary: Toggle Video Share
 *     description: Toggles the share status for a specific video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               video_filename:
 *                 type: string
 *                 description: Video filename
 *               challenge_id:
 *                 type: string
 *                 description: Associated challenge identifier
 *             required:
 *               - video_filename
 *               - challenge_id
 *     responses:
 *       200:
 *         description: Successfully updated share status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Status update message
 *                 isChallengeComplete:
 *                   type: boolean
 *                   description: Challenge completion status
 *                 challengeMessage:
 *                   type: string
 *                   description: Challenge status message
 *                 data:
 *                   type: object
 *                   properties:
 *                     isShared:
 *                       type: boolean
 *                       description: Updated share status
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalLikes:
 *                           type: number
 *                           description: Total number of likes
 *                         totalShares:
 *                           type: number
 *                           description: Total number of shares
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid request parameters
 */
router.post('/api/v1/video/share', AuthenticateUser, toggleVideoShare);

module.exports = router;

