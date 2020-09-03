module.exports = (app, config, next) => {

    return {
        middleware: require('./authentication')(app, config, next)
    }

}