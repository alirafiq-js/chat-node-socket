const io = require('socket.io');
const redisAdapter = require('socket.io-redis');
module.exports = (app, config, next) => {


    app.sendMessage;

    //this module is use to emit from one cluster and recieve from another cluster
    const globalIO = require('socket.io-emitter')({ host: config.get('database').redis.host, port: config.get('database').redis.port });

    let socketIO;
    // lodash 
    const _ = app.helpers._;
    // create two namespace as the project requirement
    this.createNameSpace = ['customer', 'artisans'];


    // Initializing Socket, this function is called on the time of server start
    init = async () => {


        socketIO = io(app.server, {
            // path: '/customer',
            serveClient: false,
            pingInterval: 10000, // polling interval if any socket not responding in the mean time ,, socket.io will disconnect this user
            pingTimeout: 5000, // if ping not responding in 5 sec ,, socket.io will disconnect this user
            cookie: false // dont rely on cookies , this can be change be client 
        });

        let user;
        // share socket user session on multiple cluster/ instances to scale your server 
        socketIO.adapter(redisAdapter({ host: config.get('database').redis.host, port: config.get('database').redis.port }));
        // on connection event
        socketIO.sockets.on('connection', async (socket) => {
            // handshake query being used to add user
            const socketConfig = socket.handshake.query;

            // userId not found server will not allow you to access further services and kick out from server
            if (socketConfig.userId) {
                // create user object
                user = { _id: socketConfig.userId, customer: true };


            } else {
                authfail(socket);
            }

        });
        // register all event againt the namesapces 
        this.createNameSpace.forEach(namespace => {

            const dns = socketIO.of(`/${namespace}`);

            dns.on('connection', async function (socket) {

                //add user record into redis as key value pair , key pattern is user:${namespace}:${user._id} and value is socket id ,
                // this value will expiry in 3 min if user will not call heatbeat api 
                // this heartbeat api is used for user is online and keep sending his request that i am alive
                await app.service.cache.saveValAndExpiry(`user:${namespace}:${user._id}`, socket.id, 300); // 3 minutes

                // this is redis TTL , if user didnt call heartbeat api with in 3 min , redis will call offline function 
                await app.service.scheduler.add(`${namespace}:${user._id}`, offline); // 3 minutes

                // register socket with different socket events

                // this event will respond you latest user join your namespace and you presence to others
                private(socket, namespace, user);

                // hearbeat event
                heartbeat(socket, namespace, user);
                // typing event
                typing(socket, namespace, user);
                // join room event
                joinRoom(socket, namespace, user);
                // accept other request
                acceptRoom(socket, namespace, user);
                // sending message to user
                message(socket, namespace, user);
                // leaving group
                leaveRoom(socket, namespace, user);
                // disconnection event
                disconnet(socket, namespace, user);
            });
        });

    }
    return {
        init
    }
    async function offline(err, key) {
        const [namespace, userId] = key.split(':');

        const socket_id = await app.service.cache.getVal(`user:${userId}`);

        offlineEvent(namespace, userId);

        socketIO.of(`/${namespace}`).adapter.remoteDisconnect(socket_id, true, (err) => {
        });
    }
    function heartbeat(socket, namespace, user) {
        socket.on('heartbeat', async () => {
            await app.service.cache.saveValAndExpiry(`user:${user._id}`, socket.id, 180); // 3 minutes
            await app.service.scheduler.cancel(`${namespace}:${user._id}`); // 3 minutes
            await app.service.scheduler.add(`${namespace}:${user._id}`, offline); // 3 minutes
        });
    }
    function disconnet(socket, namespace, user) {
        socket.on('disconnect', async () => {
            console.log("Disconnection  USER_ID--->", user._id);
            console.log("Disconnection  SOCKET_ID--->", user._id);
            offlineEvent(namespace, user._id);
        });
    }
    function message(socket, namespace, user) {
        /*
        * @Sending message to specific group / person
        * @static
        * @param {string} data.roomToken - unique room token 
        * @param {string} data.message - Message 
        * @param {string} data.type - message type i.e. text| image | video, this is frontend handling 
        * @return {object}
        *
        */

        socket.on('message', async (data) => {

            const room = await app.service.room.findOne({ roomToken: data.roomToken });
            if (room) {
                let receiverId = app.customerID;
                if (room.customerID === user._id) {
                    receiverId = room.vendorID;
                }
                let message = await app.service.message.create({ message: data.message, room_id: room._id, message_type: data.type, senderId: user._id, receiverId, dt: new Date() });

                message = JSON.parse(JSON.stringify(message));
                sendMessageToRoom(namespace, data.roomToken, message);
            }
        });
    }
    function typing(socket, namespace, user) {

        /*
        * @Typing event to specific group / person
        * @static
        * @param {string} data.roomToken - unique room token 
        * @return {object}
        *
        */

        socket.on('typing', async (data) => {
            const room = await app.service.room.findOne({ roomToken: data.roomToken });
            if (room) {
                let roommate = await getRoomMateSocketId(room, user._id, namespace);

                if (roommate) {

                    sendMessageToRoom(namespace, roommate, { userId: user._id, roomID: room.roomID }, 'typing');
                }
            }
        });
    }
    function leaveRoom(socket, namespace, user) {
        /*
        * @Leaving room and notify to specific group / person
        * @static
        * @param {string} data.roomToken - unique room token 
        * @return {object}
        *
        */

        socket.on('leave-room', async data => {
            socket.leave(data.roomToken);
            sendMessageToRoom(namespace, data.roomToken, { user }, 'leave');
            const room = await app.service.room.update(data.roomToken, namespace, user._id);

            socket.emit('leave-room', { success: true, message: "leave successfully", roomToken: data.roomToken });
        });
    }

    async function private(socket, namespace, user) {

        // get all user against the room
        const keys = await app.service.cache.getkey(`${namespace}:*`);
        let users = [];
        keys.forEach(key => {
            const [ns, userId] = key.split(':');
            users.push({ userId });
        });

        // get rooms list agains the user id on namespace
        const rooms = await getRoom(user._id, namespace)
        // emit list of room
        socket.emit('private', { event: "list-room", success: true, data: { rooms } });
        // emit list of user online agains the namespace
        socket.emit('private', { event: "list-online-user", success: true, data: { users } });
        const roomId = [];

        rooms.forEach(async item => {
            let roommate = await getRoomMateSocketId(item, user._id, namespace);

            if (roommate) {
                sendMessageToRoom(namespace, roommate, { userId: user._id, event: 'online' }, 'private');
            }
        });
        rooms.forEach(async item => {
            roomId.push(item.roomToken);
        });

        socket.join(roomId);
    }
    // offline event to send all user 
    async function offlineEvent(namespace, userId) {
        
        const rooms = await getRoom(userId, namespace);
        const roomId = [];
        await app.service.cache.deleteKey(`user:${userId}`)
        rooms.forEach(async item => {
            let roommate = await getRoomMateSocketId(item, userId, namespace);

            if (roommate) {
                sendMessageToRoom(namespace, roommate, { userId, event: 'offline', }, 'private');
            }
        });
    }

    
    async function getRoomMateSocketId(room, id, namespace) {
        let userId;
        if (room.customerID === id) {
            userId = room.vendorID;
        } else {
            userId = room.customerID;
        }
        if (id === userId) return null;
        return await app.service.cache.getVal(`user:${namespace}:${userId}`);

    }

    async function sendMessageToRoom(namespace, room, message, event = 'message') {
        globalIO.of(`/${namespace}`).in(room).emit(`${event}`, message);
    }

    async function getRoom(userId, namespace) {
        let roomQuery = { namespace, '$or': [] };
        roomQuery['$or'].push({ customerID: userId });
        roomQuery['$or'].push({ vendorID: userId });
        return await app.service.room.find(roomQuery);
    }


    async function joinRoom(socket, namespace, user) {

         /*
        * @Leaving room and notify to specific group / person
        * @static
        * @param {string} data.roomToken - unique room token 
        * @param {string} data.customerID - unique user id 
        * @param {string} data.vendorID - unique user id 
        * @return {object}
        *
        */

        socket.on('join-room', async data => {
            let socketId;
            let found = false;
            if (data.customerID && data.customerID == user._id) {
                found = true;
                socketId = await app.service.cache.getVal(`user:${namespace}:${data.vendorID}`);
            } else if (data.vendorID && data.vendorID === user._id) {
                found = true;
                socketId = await app.service.cache.getVal(`user:${namespace}:${data.customerID}`);

            }
            if (found === false) {
                socket.emit({ success: false, message: "Invalid Customer id" });
                return;
            }

            // create room if not exist on namespace , this event used to create room and other user will get request to join this roon
            
            const room = await app.service.room.create(data, namespace, user);
            if (room.success === true) {
                const rooms = await getRoom(user._id, namespace);
                const roomId = [];
                rooms.forEach(item => {
                    roomId.push(item.roomToken);
                });
                if (roomId.length > 0) {
                    socket.leave(roomId, function () {
                        socket.join(roomId)
                    });
                } else {
                    socket.join(data.roomToken)

                }
                if (!_.isNull(socketId)) {
                    sendMessageToRoom(namespace, socketId, room, 'join-room');
                }
            }
            socket.emit('joined', room);

        });
    }
    async function acceptRoom(socket, namespace, user) {
        // on creation of room , other user will get request and accept this request by using this event
        socket.on('accept-room', async data => {
            let socketId;
            let found = false;
            if (data.customerID && data.customerID == user._id) {
                found = true;
                socketId = await app.service.cache.getVal(`user:${namespace}:${data.vendorID}`);
            } else if (data.vendorID && data.vendorID === user._id) {
                found = true;
                socketId = await app.service.cache.getVal(`user:${namespace}:${data.customerID}`);

            }
            if (found === false) {
                socket.emit({ success: false, message: "Invalid Customer id" });
                return;
            }

            const room = await app.service.room.create(data, namespace, user);
            if (room.success === true) {
                const rooms = await getRoom(user._id, namespace);
                const roomId = [];
                rooms.forEach(item => {
                    roomId.push(item.roomToken);
                });
                if (roomId.length > 0) {
                    socket.leave(roomId, function () {
                        socket.join(roomId)
                    })
                } else {
                    socket.join(data.roomToken)

                }
                if (!_.isNull(socketId)) {
                    sendMessageToRoom(namespace, socketId, room, 'accept-room');
                }
            }
            socket.emit('joined', room);

        });
    }
    function authfail(socket, user) {
        socket.emit('AUTH_FAILED', { code: 401, message: 'User Id is required' });
        socket.disconnect(true);
    }

}

