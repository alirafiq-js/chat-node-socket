'use strict';

const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports = (app, config) => {


    const redisClient = redis.createClient(
        config.get('database').redis.port,
        config.get('database').redis.host
    );

    redisClient
        .on('ready', function () {
            console.log('REDIS_EVENT [ready]');
        })
        .on('error', function (err) {
            console.error('REDIS_EVENT [error] ' + err.message);
        })
        .on('end', function () {
            console.log('REDIS_EVENT [disconnect]');
        });

    redisClient.config('get', 'notify-keyspace-events', function (err, conf) {
        if (err) { return done(err); }

        // [ 'notify-keyspace-events', <value> ]
        if (conf[1].indexOf('Ex') < 0) {
            redisClient.config('set', 'notify-keyspace-events', conf[1] + 'Ex', function (err) {
                if (err) { return done(err); }
            });
        }
    });
    return redisClient;
}