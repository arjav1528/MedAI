const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const healthCheckRouter = require('./Routes/HealthCheckRoutes/HealthCheckRoute');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());




//Routes

app.use('/api/v1/health',healthCheckRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
})





module.exports = app;