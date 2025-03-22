const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passportConfig');
const healthCheckRouter = require('./Routes/HealthCheckRoutes/HealthCheckRoute');
const authRouter = require('./Routes/AuthRoutes/authRoutes');
const dotenv = require('dotenv');
dotenv.config();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS setup - use only ONE cors setup
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// Session setup - BEFORE passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard_cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport initialization - AFTER session, BEFORE routes
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    res.send('API Running');
});

app.use('/api/v1/health', healthCheckRouter);
app.use('/auth', authRouter);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;