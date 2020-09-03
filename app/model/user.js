module.exports = (app, config, next) => {

    const user = app.db.user;

    async function findOne(condition, options = {}) {
        return await user.findOne(condition);
    }

    async function create(data) {
        data.dt = new Date().getTime();
        return await new user(data).save();
    }

    async function update(id, data) {
        return user.findByIdAndUpdate(id, data, { new: true });
    }

    return {
        findOne,
        update,
        create
    }
}
