module.exports = (app, config, next) => {

    const helpers = require('./helpers')(app, next);
    const adapter = require('./adapter')(app, config, next);
    const realtime = require('./realtime')(app, config, next);
    const model = require('./model')(app, config, next);
    const service = require('./service')(app, config, next);    
    const controller = require('./controller')(app, config, next);
    const routes = require('./routes')(app, config, next);

    return {
        adapter,
        helpers,
        realtime,
        controller,
        routes,
        model,
        service
    };
};