var express = require('express');
var router = express.Router();

module.exports = (app, config, next) => {
  // Register all routes
  require('./user')(app, router);
  next();
}
