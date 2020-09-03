const mongoose = require('mongoose');

module.exports = (app, config) => {

    this._ = app.helpers._;
    // init
    const uri = `${config.get('database').mongodb.uri}:${config.get('database').mongodb.port}/${config.get('database').mongodb.dbname}`;
    const options = Object.assign(
        this._.get(config.get('database').mongodb, 'options', {}), // if "options" provided in "config"
        { useNewUrlParser: true, useUnifiedTopology: true, debug: true  }
    );

    // mongoose events
    mongoose.connection.on('connecting', () => { console.log('MONGOOSE_EVENT [connecting]'); });

    mongoose.set('debug', config.get('database').mongodb.debug);

    mongoose.connection.on('connected', () => {
        // console.log('MONGOOSE_EVENT [connected]');
        console.log(` [\u2713] Mongodb - bykea-dev [connected] (${uri})`);
    });

    mongoose.connection.once('open', () => { console.log('MONGOOSE_EVENT [opened]'); });

    mongoose.connection.on('reconnected', () => { console.log('MONGOOSE_EVENT [reconnected]'); });

    mongoose.connection.on('disconnected', () => { console.log('MONGOOSE_EVENT [disconnected]'); });

    mongoose.connection.on('error', (error) => {
        console.error('MONGOOSE_EVENT [error]: ' + error);
        mongoose.disconnect();
    });

    // close connection on process EXIT
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            process.exit(0);
        });
    });

    // console.log('MONGO DB connecting to: ', uri);
    require('./schema')(app);
    
    mongoose.connect(uri, options);
    return mongoose;

};

