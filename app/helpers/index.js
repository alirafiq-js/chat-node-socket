const _ = require('lodash');
const joi = require('joi');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')


module.exports = (app, next) => {

    app.helpers = {
        _,
        joi,
        jwt,
        crypto,
        boom
    };

    next();
};