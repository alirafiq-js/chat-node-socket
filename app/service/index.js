module.exports = (app, config, next) => {

    app.service = {};
    app.service.cache = require('./cache')(app, config);
    app.service.user = require('./user')(app, config);
    app.service.room = require('./room')(app, config);
    app.service.message = require('./message')(app, config);
    app.service.scheduler = require('./scheduler')(app, config);

    next();
}