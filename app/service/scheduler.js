module.exports = (app, config, next) => {
    const cache = app.cache;
    const Scheduler = require('redis-scheduler');

    const schedule = new Scheduler({ host: config.get('database').redis.host, port: config.get('database').redis.port });
    const validation = 61000 * 3;
    async function add(key, trigerEvent) {
        schedule.schedule({ key, expire: validation, handler: trigerEvent }, (err) => {});
    }
    async function cancel(key, obj) {
        schedule.cancel({ key: key }, () => { });
    }
    return {
        add,
        cancel
    }
}