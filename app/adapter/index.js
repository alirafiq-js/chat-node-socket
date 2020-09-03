module.exports = (app, config, next) => {

    app.db = {}; 
    require('./mongo')(app, config, next);
    app.cache = require('./redis')(app, config, next);
    next();

};