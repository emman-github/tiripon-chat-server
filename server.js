var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = [];
var connections = [];
var port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Server is running in port ' + port);
}); 

const controller = 'Android_Api/';
const baseUrl = 'https://tiripon.net/';
//const baseUrl = 'https://www.sandbox.baldpuppiessolutions.com/';

 
//server.listen(3000);
// var room = 'room_1';

var groupChatRooms  = [];
var directChatRooms = [];

var request = require('request'); 

app.get("/url", (req, res, next) => {

  request(url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    res.json(JSON.parse(body));
  });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', onConnection);

/* FUNCTIONS */
function onConnection(socket) { 
    connections.push(socket);
    
    socket.on('join group chat', function(user) { 
        // console.log(user);
        var room = user.designation_id;  
        // console.log(room);
        if (!groupChatRooms.includes(room)) {
            socket.join(room);
            groupChatRooms.push(room);
            console.log('room: ' + room); 
        } else {
            console.log('room: ' + room);
        }

        console.log(groupChatRooms);

        getGroupChatMessages(room).then(groupChatMessages => {
            console.log(groupChatMessages);
            socket.emit('get group chat messages', groupChatMessages);
        });

            // console.log(groupChatRooms);

            // // var clients = io.sockets.adapter.rooms[room];
            // // console.log(clients);

            // getGroupChatMessages().then(messages => {
            //     socket.emit('get group chat messages', {'messages': messages});
            // }); 
    });

    socket.on('send group chat message', function(groupChatMessage) { 
        console.log(groupChatMessage);
        var room = groupChatMessage.designation_id;    

        saveGroupChatMessage(groupChatMessage).then(response => {  
            io.sockets.in(room).emit('get saved group chat message', groupChatMessage); 
        }); 
    });

    socket.on('disconnect', function() {
        var clients = Object.keys(io.sockets.sockets);  
        var joinedRoom = socket.room;  

        socket.leave(joinedRoom);
        groupChatRooms.pop(joinedRoom);
        connections.pop(joinedRoom);

    //console.log('Disconnected: %s sockets connected', connections.length);        
    }); 

    // socket.on('join direct chat', function(user) {
    //     console.log(user);
    // })

    // getGroupChatMessages().then(messages => {
    //     //console.log(messages);
    //     console.log(room);
    //     io.sockets.in(room).emit('new room', {room: socket.room, messages: messages}); 
    //     connections.push(socket);
    //     //console.log('Connected: %s sockets connected', connections.length); 
    // }).catch(error => {
    //     console.log(error);
    // }); 

    // // Disconnect
    // socket.on('disconnect', function() {
    //     socket.leave(socket.room);
    //     connections.splice(connections.indexOf(socket), 1);
    //     //console.log('Disconnected: %s sockets connected', connections.length);        
    // }); 

    // socket.on('send message', function(message) { 
    //     //console.log(message); 
    //     saveNewMessage(message).then(response => {
    //       //console.log(response);
    //       io.sockets.in(socket.room).emit('new message', message.message); 
    //     });
    //     //console.log(socket.room);
        
    // });


}  

 
function getGroupChatMessages(designationId) { 

    var promise = new Promise(function(resolve, reject) {  
        console.log(designationId);
        //const url = 'https://www.sandbox.baldpuppiessolutions.com/Android_Api/read_all_chat_message';
        const url = 'https://www.tiripon.net/Android_Api_Speaker/get_group_chat_messages';
        //const url = baseUrl + controller + 'get_group_chat_messages';
        request.post({url, form: {'designation_id': designationId}}, function (error, response, body) {
            
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log(body);
            body = JSON.parse(body); 
            resolve(body); 
        }); 
    }, error => {
        reject(error);
    });

    return promise; 
}

function saveGroupChatMessage(groupChatMessage) {

    var promise = new Promise(function(resolve, reject) {  
        // console.log(message);
        //const url = baseUrl + controller + 'insert_group_chat_message';
        const url = 'https://www.tiripon.net/Android_Api_Speaker/insert_group_chat_message';

        request.post({url, form: groupChatMessage}, function (error, response, body) {
            if (response.statusCode === 200) {
                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                //console.log(body);
                console.log('200!');
                body = JSON.parse(body);
                resolve(body);  
            } else if (response.statusCode === 500) {
                console.log('500!');
                //console.log('error:', error); // Print the error if one occurred
                //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                //console.log(body);
            }
        }); 
    }, error => {
        reject(error);
    });

    return promise; 
}

