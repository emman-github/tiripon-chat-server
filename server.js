var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = [];
var connections = [];
var port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Server running in port' + port);
}); 
 
//server.listen(3000);


var request = require('request'); 

app.get("/url", (req, res, next) => {
  var url = 'https://www.tiripon.net/Android_Api_Speaker/get_users';

  request(url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    res.json(JSON.parse(body));
  });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect
    socket.on('disconnect', function() {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);        
    }); 

    socket.on('send message', function(data) {
        console.log(data);
        io.sockets.emit('new message', {msg: data});
    });

    
});
