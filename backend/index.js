const express = require("express");
const router = require("./src/route/route");
const dotenv = require("dotenv");
const cors = require("cors");
const {User,Challenge,ChallengeReward,Quest,UserQuest,UserChallenge,UserReward,UserVideo} = require("./src/db/models");
const Connection = require("./src/db/connection");
const { swaggerUi, swaggerSpec } = require("./src/config/swagger");
require("./src/service/QuestCompleteStatus");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/",router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT;

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    Connection();
    if(!await User.findOne({email: process.env.ADMIN_EMAIL})){
      await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        isAdmin: true,
        firstName: "Admin",
        lastName: "Admin"
      });
    }
    console.log("Backend Is Running");
  }
);
}

module.exports = app;