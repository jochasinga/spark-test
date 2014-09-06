# Socket.io Chat Test with Spark Core

A simple socket.io demo using Johnny-five and Spark-io Libraries to drive motor remotely using Spark Cloud

## How to use

```
$ cd spark-test
$ npm install
$ node index.js

```

And point your browser to `http://localhost:8000`. Optionally specify
a port by supplying the `PORT` env variable.

## Features

- Multiple users can join a chat room by entering a unique username
on website load.
- Users can type chat messages to the chat room
- A notification is sent to all users when a user joins or leaves
the chatroom
- Motor spins on each connection and each new chat message
