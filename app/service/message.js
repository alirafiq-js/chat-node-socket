module.exports = (app, config, next) => {
    const cache = app.cache;
    const messageModel = app.model.message;
    const roomModel = app.model.room;

    async function create(data) {
        return await messageModel.create(data);
    }

    async function history(condition, page, limit) {
        const room = await roomModel.findOne({ roomToken: condition.roomToken, namespace: condition.namespace });
        if (room) {
            return await messageModel.find({ room_id: room._id }, page, limit);
        } else {
            return [];
        }
    }


    return {
        history,
        create
    }
}