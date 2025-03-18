const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const AuthenticateUser = async (req, res, next) => {
    try {
        // Check if the Authorization header is present
        const headers = req.headers['authorization'];
        if (!headers || !headers.trim().startsWith("Bearer ")) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Extract the token from the header
        const token = headers.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        // Return invalid token message if token verification fails
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

module.exports = AuthenticateUser;