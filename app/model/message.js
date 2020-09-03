module.exports = (app, config, next) => {

    const Message = app.db.message;
    //
    async function findOne(condition, options = {}) {
        return await Message.findOne(condition);
    }

    async function find(condition, page, limit, options = {}) {
        return await Message.find(condition).skip(page).limit(limit).sort({ dt: -1 });
    }

    async function create(obj, options = {}) {
        return await new Message(obj).save();
    }

    return {
        findOne,
        find,
        create
    }
}
