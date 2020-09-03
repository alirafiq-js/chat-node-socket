'use strict';

const path = require('path');
const nconf = require('nconf');

nconf.env().argv();
    
let env = nconf.get('caenv');

env = (env)? env: 'remote';

process.env.NODE_ENV = env;
nconf.file({ file: path.join(__dirname,  'env', `${env}.json`) });

console.log('=======================');
console.log('application', nconf.get('name'));
console.log('enviroment', nconf.get('enviroment'));
console.log('NODE_ENV', process.env.NODE_ENV);
console.log('=======================');


module.exports = nconf;