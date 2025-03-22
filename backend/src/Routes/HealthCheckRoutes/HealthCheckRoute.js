const HealthCheck = require('../../HealtCheck/HealthCheck');

const healthCheckRouter = require('express').Router();




healthCheckRouter.route('/').get(HealthCheck);

module.exports = healthCheckRouter;