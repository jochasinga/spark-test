var express = require('express'),
  Spark = require('spark-io'),
  five = require('johnny-five'),
  request = require('request'),
  board, myMotor;

var net = require('net');

var app = express(),
  server = require('http').createServer(app),
  io = require('socket.io')(server),
  port = process.env.PORT || 8080;

var sparkToken = process.env.SPARK_TOKEN || "53ff6d065067544831330587",
  sparkId = process.env.SPARK_DEVICE_ID || "4637794fd28d1e96558186896be97941cc95d852"

// Specify port the server should listen to
server.listen(port, function() {
  console.log('Server listening on port %d', port);
});

//Routing to static files
app.use(express.static(__dirname + '/public'));

// Chatroom
// usernames which are currently connected to the chat
var usernames = {}, 
  numUsers = 0;

io.on('connection', function(socket) {
    console.log('User connected...');
    var addedUser = false;

    // Furby should wake up when a connection has been made
    // Check Furby's status wifi readiness/status/wake up here
    
    // Call functions that poll sensor inputs to keep polling
    // belly button, back button, tilt switch

    // upon successful connection, tell LED to turns off
    /*
    request.post('https://api.spark.io/v1/devices/' + sparkId + '/blinky/?access_token=' + sparkToken, 
        {form: {args: "off"}}
    );
    */
    request.post('https://api.spark.io/v1/devices/' + sparkId + '/chat/?access_token=' + sparkToken, 
        {form: {args: "someone connected"}}
    );
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function(data) {
	// tell the client to execute 'new message' event
	socket.broadcast.emit('new message', {
	    username: socket.username,
	    message: data
	});

	// Furby should read out the message
	// If username isn't Furby, send the data to Furby's read function

	// Upon successful message, turn on the LED
	/*
	request.post('https://api.spark.io/v1/devices/' + sparkId + '/blinky/?access_token=' + sparkToken,
		     {form: {args: "on"}}
        );
	*/
	// Upon new message, turn on the motor
	request.post('https://api.spark.io/v1/devices/' + sparkId + '/chat/?access_token=' + sparkToken,
		     {form: {args: data}}
        );
    });

    net.socket.on('data', function(data) {
	socket.broadcast.emit('new message', {
	    username: 'Furby',
	    message: data
	});
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

	// Furby should move and make thinking noise
	// Drive Furby's motor once and make him read out predefined text
    });

    // when the client stops typing, we broadcast that to others
    socket.on('stop typing', function() {
	socket.broadcast.emit('stop typing', {
	    username: socket.username
	});
	console.log(socket.username + ' stopped typing');

	// Furby should stop moving and make "Aha!" sound
	// Stop Furby's motor (if it's not already stopped) and read "Aha!"
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
	    
	    // Furby should move and say "bye bye", and then go to sleep
	    // Drive Furby's motor, read out "bye bye", and then put to mode sleep
	    console.log(socket.username + ' has lefted');	    
	}
    });
});

