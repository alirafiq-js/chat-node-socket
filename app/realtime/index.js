module.exports = (app, config, next) => {

    app.realtime = require('./socket')(app, config, next);
    next();
}