const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const room = new Schema({
    roomID: {
        type: String,
        index: true
    },
    roomToken: {
        type: String,
        index: true
    },
    namespace: {
        type: String
    },
    customerID: {
        type: String,
        index: true

    },
    vendorID: {
        type: String,
        index: true
    },
    dt: {
        type: Date
    },
    dtu: {
        type: Date
    },
}, { versionKey: false });

module.exports = mongoose.model('rooms', room);
