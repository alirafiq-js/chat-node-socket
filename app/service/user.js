module.exports = (app, config, next) => {

    const userModel = app.model.user;
    const _ = app.helpers._;
    const jwt = app.helpers.jwt;
    const boom = app.helpers.boom;
    const crypto = app.helpers.crypto;
    const cache = app.service.cache;

    async function register(data) {


        let user = await findOne({ username: data.username });
        if (!_.isNull(user) && !_.isUndefined(user)) {
            throw boom.badData('Username already exist', { success: false });
        }

        data.access_token = getUniqueToken({ username: data.username });
        data.password = passwordHash(data.password);

        return await userModel.create(data);
    }

    async function login(data) {

        data.password = passwordHash(data.password);

        let user = await findOne({ username: data.username, password: data.password });
        if (!_.isNull(user) && !_.isUndefined(user)) {

            data.access_token = getUniqueToken({ username: data.username });
            user = await userModel.update(user._id, { access_token: data.access_token });
            const oldVal = await cache.getVal(user._id);
            await cache.deleteKey(oldVal);
            await cache.saveVal(user._id, user.access_token);
            await cache.saveObj(user.access_token, { _id: user._id, username: user.username, image: _.get(user, 'image', null) });

        } else {
            throw boom.badData('Invalid Username/Password', { success: false });
        }
        return user;
    }



    function getUniqueToken(object) {
        return jwt.sign(object, config.get('secret'))
    }

    function passwordHash(password) {
        return crypto.createHash('md5').update(password).digest("hex");
    }

    async function findOne(condition, options = {}) {
        return await userModel.findOne(condition);
    }

    return {
        register,
        login,
        findOne
    }
}