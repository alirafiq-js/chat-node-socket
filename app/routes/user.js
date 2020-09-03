module.exports = (app, next) => {

    const express = require('express');
    const router = express.Router();
    // To Get Chat history 
    router.get("/", app.controller.chat.history)

    app.use('/v1/chat', router)

}