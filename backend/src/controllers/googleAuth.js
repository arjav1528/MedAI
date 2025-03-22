const APIError = require("../APIResponses/APIError");
const APISuccess = require("../APIResponses/APISuccess");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const googleAuthCallback = async (req, res) => {
    try {
        // User should be available from passport authentication
        if (!req.user) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: req.user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        
        const refreshToken = jwt.sign(
            { userId: req.user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Save refresh token to user
        await User.findByIdAndUpdate(req.user._id, { refreshToken });

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect to frontend with success
        return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001');
        
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = googleAuthCallback;