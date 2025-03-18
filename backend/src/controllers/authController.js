const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const zod  = require("zod");
const { User } = require("../db/models");

dotenv.config();

const loginController = async (req, res) => {
    try {
        const loginData = req.body;
        const loginSchema = zod.object({
            username: zod.string().email(),
            password: zod.string()
        });
        const result = loginSchema.safeParse(loginData);
        if (!result.success) {
            return res.status(401).json({
                success: false,
                errors: result.error.errors.map(err => err.message).join(", ")
            });
        }

        const user = await User.findOne({ username: loginData.username });
        if (!user || user == null) {
            return res.status(404).json({ 
                success: false,
                errors: "User not found" 
            });
        }

        const matchPassword = await bcrypt.compare(loginData.password, user.password);
        if (!matchPassword) {
            return res.status(401).json({ 
                success: false,
                errors: "Incorrect Password" 
            });
        }

        const Roles = process.env.ROLES.split(",");
        const userRole = user.is_admin ? Roles[0] : Roles[1];

        const payload = { 
            username: user.username, 
            is_admin: user.is_admin, 
            id: user._id, 
            role: userRole, 
            firstname: user.firstname, 
            lastname: user.lastname,
            wallet: user.wallet 
        };

        const token = jwt.sign(payload, process.env.JWT_KEY);
        
        res.status(200).json({
            success: true,
            token: token,
            // user: {
                id: user._id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                role: userRole,
                wallet: user.wallet,
                is_admin: user.is_admin
            // }
        });
    }
    catch (err) {
        return res.status(500).json({ 
            success: false, 
            errors: err.message 
        });
    }
}

const refreshToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                errors: "User not found" 
            });
        }

        const Roles = process.env.ROLES.split(",");
        const userRole = user.is_admin ? Roles[0] : Roles[1];

        return res.status(200).json({
            success: true,
            // user: {
                id: user._id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                role: userRole,
                wallet: user.wallet,
                is_admin: user.is_admin
            // }
        });
    }
    catch (err) {
        return res.status(500).json({ 
            success: false, 
            errors: err.message 
        });
    }
}

module.exports = {
    login: loginController,
    refresh: refreshToken
}