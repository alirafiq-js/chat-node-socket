


# Backend config

This Backend architech is designed in union layer architecture (Clean Aarchitecture). 
The flow is controner -> services -> model -> sevices -> controller and respond 
Dependencies Injection pattern is used to load all layer into Application object. 
As you can see application.js  all module / services has been injected into app and this app reference is used in multiple location.
you will find app object been used in most of the file to load objects/function.

## > vim src/config/local.json

## > npm run start-local

## chat history API 
/v1/chat/?roomToken={ROOMTOKEN}&namespace={namespace}&page=1&limit=5
page = default & minimum value is 1
limit = default & minimum value is 5 & maximum value is 20


# Client Integration 

## Connection

query = “customerID=1” // Unique Identifier to connect
SERVER = ‘127.0.0.1:3300’ // SERVER URL
namespace = [‘customer’,’artisans’]; // connection to server namespaceartisans

// Sample connection
## io.connect(SERVER + `/${namespace[0]}`, {
           transports: ['websocket'],
           query: query
});

## Global listener of Namespaces

## socket.on('private', (data) => {
	
});

## Private listener is used to receive any private messages like list of room 

Sample data against this listener
{
“event” : “list-room”, succus: true, data : {rooms: [] }
}

{
“event” : “list-online-user”, succus: true, data : {rooms: [] }
}

{
“event” : “online, succus: true, userId : 1
}

{
“event” : “offline, succus: true, userId : 1
}
________________________________

## Create Room 

## socket.emit(‘join-room’, data)

data.customerID = 
data.vendorID = 
data.roomID = 
data.roomToken = 


## socket.on(‘join-room’', (data) => {
	
});

## Join-room listener is used to receive request to join room 

Sample data against this listener
{
succus: true, data : {room: {
_id: //primary KEY
vendorId: //vendorID
customerID: //customerId
roomID: //room id provided by user
roomToken: //A token you receive from any of the two users in the chat room to verify it is their room
 }}
}

________________________________

## Accept Room Request

## socket.emit(‘accept-room’, data)

data.customerID = 
data.vendorID = 
data.roomID = 
data.roomToken = 


## socket.on('joined', (data) => {
	
});

________________________________

## socket.on(accept-room’', (data) => {
	
});

## accept-room listener is used to accept request to join room 

Sample data against this listener
{
succus: true, data : {room: {
_id: //primary KEY
vendorId: //vendorID
customerID: //customerId
roomID: //room id provided by user
roomToken: //A token you receive from any of the two users in the chat room to verify it is their room
 }}
}

On success 

## Client will start listening two more events

// user will receive message against room
## socket.on('message’, (data) => {
	data = {
	_id: //primary KEY
message: //message
message_type: enum [‘text’,’image’, ‘vdo’,’audio’]
senderId: // sender
receiverId: // receiver 
room_id: // room private id 
dt: // created date time
}
});
// sending message against the room 
## socket.emit('message’, {message: “Hello”, type: “text”,roomToken: roomToken})
 
// sending image against the room 
## socket.emit('message’, {message: “http://server/image.png”, type: “image”})



// user will receive typing event client will show user is typing for 500 milliseconds
## socket.on(‘typing’, (data) => {
	data = {
	success: true
	typing: true
}
});

## socket.emit('typing, {roomToken: roomToken})



## CREATE ROOM - 30th April 2020

there is one event to perform this action.

 > join-room , client will emit following params.

` {

	 customerID: '123', // required
	 vendorID: '124', // required
	 roomToken: 'any-unique-string', // required 
	 roomId: 'any-unique-string'
	
 }`

customerID or vendorID should be the same ID you provided on handshake
> userId === customerID or userId === vendorID

> room created with roomToken

> both user must be join on same namespace

If customerId created the a room and vendorID is online at same time ,, he will get notification `join-room`

vendorID will accept this room request emit on event `accept-room` with the params. and customer will get the event `joined`


 ` {

	 customerID: '123', // required
	 vendorID: '124', // required this could be his user Id
	 roomToken: 'any-unique-string', // required 
	 roomId: 'any-unique-string'
	
 }`
