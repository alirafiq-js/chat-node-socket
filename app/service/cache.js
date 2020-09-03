module.exports = (app, config, next) => {
    const cache = app.cache;

    async function saveObj(key, obj) {
        await cache.hmsetAsync(key, obj);
    }

    async function saveVal(key, val) {
        await cache.setAsync(key, val);
    }

    async function saveValAndExpiry(key, val, time) {
        await saveVal(key, val);
        await setExpiry(key, time);
    }

    async function getVal(key) {
        return await cache.getAsync(key)
    }

    async function getkey(key) {
        return await cache.keysAsync(key)
    }

    async function getObj(key) {
        return await cache.hgetallAsync(key)
    }

    async function setExpiry(key, seconds) {
        await cache.expireAsync(key, seconds);
    }

    async function deleteKey(key) {
        return await cache.delAsync(key);

    }
    return {
        saveObj,
        saveValAndExpiry,
        getObj,
        saveVal,
        getVal,
        getkey,
        setExpiry,
        deleteKey,
    }
}