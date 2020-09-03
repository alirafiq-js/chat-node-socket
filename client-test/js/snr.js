var app = angular.module('socket-testing', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);

app.controller('socketTest', function ($scope, $timeout, $http) {
    $scope.update = 0;
    function update() {
        $timeout(() => {
            update()
        }, 1000)

    }
    update()
    $scope.socketUser = [];
    $scope.query = 'userId=1';
    $scope.url = 'http://localhost:3300';

    $scope.rooms = [];

    $scope.createRoomObj = {
        customerID: '',
        vendorID: '',
        roomID: '',
        roomToken: '',
    }
    $scope.message = {}
    $scope.joinedRoom = [];

    var timer = 20;
    $scope.socket = null;

    $scope.clearInterval;
    $scope.connection = function (url, query) {


        console.log($scope.url)
        $scope.socket = io.connect($scope.url + '/customer', {
            transports: ['websocket'],
            query: $scope.query

        });

        $scope.socket.on('connect', function (e) {
            console.log("CONNECTION", $scope.socket)
            console.log($scope.socket)
            // if ($scope.query !== 'userId=1')
            $scope.rooms = [];

            $scope.createRoomObj = {
                customerID: '',
                vendorID: '',
                roomID: '',
                roomToken: '',
            }
            $scope.message = {}
            $scope.joinedRoom = [];

            $scope.clearInterval = setInterval(function () {
                heartbeat();
                console.log('heartbeat')
            }, 10000)
        });
        $scope.socket.on('offline', function (data) {
            console.log("offline", data)
        });

        $scope.socket.on('disconnect', function (e) {
            $scope.rooms = [];

            $scope.createRoomObj = {
                customerID: '',
                vendorID: '',
                roomID: '',
                roomToken: '',
            }
            $scope.message = {}
            $scope.joinedRoom = [];
            $scope.socket.off('MESSAGE');
            $scope.socket.off('create-room');
            $scope.socket.off('message');
            console.log("DIC")
            console.log(e)
            clearInterval($scope.clearInterval)
        });
        $scope.socket.on('private', function (res) {
            console.log("PRIVATE", res
            )
            if (res.success === true) {
                if (res.data.rooms) {
                    $scope.rooms = res.data.rooms;
                    $scope.joinedRoom = res.data.rooms;
                } else if (res.data.room) {
                    $scope.rooms.push(res.data.room)
                }
            }
        });
        $scope.socket.on('typing', function (res) {
            console.log("typing", res)
        });
        $scope.typing = function (room) {
            $scope.socket.emit('typing', { roomToken: room.roomToken })
        }
        $scope.socket.on('join-room', function (res) {
            if (res.success === true) {
                var roomId = res.data.room._id;
                $scope.createRoomObj = res.data.room;
                $scope.acceptRoom();
            }
        })
        $scope.socket.on('accept-room', function (res) {
            console.log("accept-room", res)
        })
        $scope.socket.on('joined', function (res) {
            console.log("joined", res)
            if (res.success === true) {
                var roomId = res.data.room._id;
                var exists = false;
                $scope.rooms.forEach(element => {
                    if (element._id === roomId) exists = true;
                });
                if (exists === false) {
                    $scope.rooms.push(res.data.room)
                }
                var joinedExists = false
                $scope.joinedRoom.forEach(element => {
                    if (element._id === roomId) {
                        joinedExists = true
                    }
                });
                if (joinedExists === false) {
                    $scope.joinedRoom.push(res.data.room)
                }

            }
        });
        $scope.socket.on('leave-room', function (res) {
            console.log("leave-room")
            if (res.success === true) {
                var roomToken = res.roomToken;
                $scope.joinedRoom.forEach((element, index) => {
                    if (element.roomToken === roomToken) {
                        console.log(element, roomToken)
                        $scope.joinedRoom.splice(index, 1);
                        if ($scope.message[element._id]) delete $scope.message[element._id];
                    };
                });

            }
        });
        function heartbeat() {
            $scope.socket.emit("heartbeat");
        }
        $scope.$on('$destroy', function (event) {
            $scope.socket.removeAllListeners();
        });
        $scope.socket.on("message", function (data) {
            console.log("-message")
            console.log(data)


        });

        $scope.sendMessage = function (room) {
            console.log(room);
            var roomId = room._id
            console.log('$scope.message[roomId]', $scope.message[roomId])
            if ($scope.message[roomId] && $scope.message[roomId].message != '') {
                console.log("------------SENDING----------")
                $scope.socket.emit('message', { roomToken: room.roomToken, message: $scope.message[roomId].message, type: 'text' })
            }
        }
        $scope.joinRoom = function (room) {
            console.log("JOINROOM", room)
            $scope.createRoomObj = room;
            //  $scope.createRoom()
            joinRoom(room._id)
        }
        $scope.createRoom = function () {
            $scope.socket.emit('join-room', $scope.createRoomObj, function (e) {
                console.log(e)
            });

        }
        $scope.acceptRoom = function () {
            $scope.socket.emit('accept-room', $scope.createRoomObj, function (e) {
                console.log(e)
            });

        }
        $scope.leaveRoom = function (roomToken) {
            console.log(roomToken)
            $scope.socket.emit('leave-room', { roomToken: roomToken }, function (e) {
                console.log(e)
            });

        }

        $scope.disconnect = function () {
            $scope.socket.close()
        }

    }
    var ObjectId = function (str) {
        return str;
    }
    var ISODate = function (str) {
        return this.str;
    }
    function httpRequest_POST(url, data) {
        return $http({
            method: 'post',
            url: $scope.url + url,
            data: data
        })
    }
    function httpRequest_PUT(url, data) {
        return $http({
            method: 'PUT',
            url: $scope.url + url,
            data: data
        })
    }
});