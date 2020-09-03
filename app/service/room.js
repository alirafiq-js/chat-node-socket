module.exports = (app, config, next) => {

    const db = app.model.room;
    const _ = app.helpers._;

    async function create(data, namespace, user) {

        let room = await findOne({ roomToken: data.roomToken, namespace });
        if (!_.isNull(room) && !_.isUndefined(room)) {
            if (user._id === data.customerID || user._id === data.vendorID) {
                return { success: true, data: { room }, message: "Joined successfully" };
            } else {
                return { success: false, message: "You are not a member of this rooms" };
            }
        }
        room = await db.create({ ...data, namespace });
        return { success: true, data: { room }, message: "Joined successfully" }
    }

    async function update(roomToken, namespace, userId) {
        let room = await findOne({ roomToken: data.roomToken, namespace });
        if (userId === room.customerID) {
            await db.update({ roomToken, namespace, customerID: userId }, { "$unset": { customerID: 1 } });
        } else {
            await db.update({ roomToken, namespace, vendorID: userId }, { "$unset": { vendorID: 1 } });
        }
    }
    async function findOne(condition, options = {}) {
        return await db.findOne(condition);
    }

    async function find(condition, options = {}) {
        return await db.find(condition);
    }

    return {
        create,
        find,
        update,
        findOne
    }
}