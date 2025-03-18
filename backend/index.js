const express = require("express");
const router = require("./src/route/route");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
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
    if(!await User.findOne({username: process.env.ADMIN_EMAIL})){
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await User.create({
        name: "Admin",
        username: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        is_admin: true,
        firstname: "Admin",
        lastname: "Admin"
      });
    }
    console.log("Backend Is Running");
  }
);
}

module.exports = app;