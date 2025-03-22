const HealthCheck = require('../../controllers/HealthCheck');


const healthCheckRouter = require('express').Router();




healthCheckRouter.route('/').get(HealthCheck);

module.exports = healthCheckRouter;