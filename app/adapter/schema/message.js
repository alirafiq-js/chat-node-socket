const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const message = new Schema({
    message: {
        type: String
    },
    message_type: {
        type: String, enum: ['text', 'image', 'vdo', 'audio'], default: 'text'
    },
    senderId: {
        type: String
    },
    receiverId: {
        type: String
    },
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rooms',
    },
    dt: {
        type: Date
    },

}, { versionKey: false });

module.exports = mongoose.model('messages', message);
