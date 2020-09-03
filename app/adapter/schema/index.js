module.exports = (app, next) => {
    app.db.user = require('./user');
    app.db.room = require('./room');
    app.db.message = require('./message');
};