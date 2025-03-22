const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleAuthCallback = require('../../controllers/googleAuth');
const refreshTokens = require('../../controllers/refresh-token');
const jwt = require('jsonwebtoken');

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: true
    }),
    googleAuthCallback
);

// Other auth routes
router.post('/refresh-token', refreshTokens);

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out' });
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.redirect('/');
    });
});

router.get('/user', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar });
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
});

module.exports = router;




