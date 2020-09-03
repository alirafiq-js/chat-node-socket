module.exports = (app, confiq, next) => {

    app.controller = {
        user: require('./user')(app, confiq, next),
        chat: require('./chat')(app, confiq, next)
    };
    next()
}