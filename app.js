var express = require('express'),
    Spark = require('spark-io'),
    five = require('johnny-five'),
    board, myMotor;

var request = require('request');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

var sparkToken = process.env.SPARK_TOKEN,
  sparkId = process.env.SPARK_DEVICE_ID;

// Specify port the server should listen to
server.listen(port, function() {
    console.log('Server listening on port %d', port);
});

//Routing to tatic files
app.use(express.static(__dirname + '/public'));

// Chatroom
// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

/*
request.get('https://api.spark.io/v1/devices/' + sparkId + '/endpoint?access_token=' + sparkToken, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body);
  }
});
*/

io.on('connection', function(socket) {
    // log it just for peace of mind
    console.log('User connected...');
    var addedUser = false;
  
    request.post('https://api.spark.io/v1/devices/' + sparkId + '/blinky/?access_token=' + sparkToken, 
        {form: {args: "off"}}
    );
  
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function(data) {
	// tell the client to execute 'new message' event
	socket.broadcast.emit('new message', {
	    username: socket.username,
	    message: data
	});

	request.post('https://api.spark.io/v1/devices/' + sparkId + '/blinky/?access_token=' + sparkToken,
		     {form: {args: "on"}});
    });

    // when the client emits 'add user', listens and execute
    socket.on('add user', function(username) {
	// we store the username in the socket session for this client
	socket.username = username;
	// add the client's username to the global list
	usernames[username] = username;
	++numUsers;
	addedUser = true;
	socket.emit('login', {
	    // For informing number of logged in users
	    numUsers: numUsers 
	});
	// echo globally (all clients) that a uers had connected
	socket.broadcast.emit('user joined', {
	    username: socket.username,
	    numUsers: numUsers
	});
    });

    // when the client emits 'typing', broadcast it to other
    socket.on('typing', function() {
	socket.broadcast.emit('typing', {
	    username: socket.username
	});
	console.log(socket.username + ' typing');
    });

    // when the client stops typing, we broadcast that to others
    socket.on('stop typing', function() {
	socket.broadcast.emit('stop typing', {
	    username: socket.username
	});
	console.log(socket.username + ' stopped typing');
    });
    
    // when the user disconnects...
    socket.on('disconnect', function() {
	// remove username from the list
	if (addedUser) {
            delete usernames[socket.username];
	    --numUsers;

	    // echo globally that this user has left
	    socket.broadcast.emit('user left', {
		username: socket.username,
		numUsers: numUsers
	    });
	}
	console.log(socket.username + ' has lefted');
    });
});

