const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const user = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    dt: {
        type: Number
    },
    image: {
        type: String
    },
    socketId: {
        type: String
    },
    access_token: {
        type: String
    }
}, { versionKey: false });

module.exports = mongoose.model('users', user);