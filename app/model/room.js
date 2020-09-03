module.exports = (app, config, next) => {

    const room = app.db.room;
    async function findOne(condition, options = {}) {
        return await room.findOne(condition);
    }

    async function find(condition, options = {}) {
        return await room.find(condition);
    }

    async function update(condition, obj, options = {}) {
        return await room.update(condition, obj);
    }

    async function create(obj, options = {}) {
        return await new room(obj).save();
    }

    return {
        findOne,
        find,
        update,
        create
    }
}
