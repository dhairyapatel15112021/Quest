const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Connection = async () => {
    try{
        const url = process.env.DATABASE_URL;
        await mongoose.connect(url);
        console.log("connected to database");
    }
    catch(err){
        console.log("database connection failed");
        console.log(err);
    }
}

module.exports = Connection;