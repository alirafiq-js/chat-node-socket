module.exports = (app, config, next) => {

    app.model = {
        user: require('./user')(app, config),
        room: require('./room')(app, config),
        message: require('./message')(app, config),
    };

    next();
}