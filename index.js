const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require('path');


app.use('/', express.static(path.join(__dirname, 'dist')));

io.on('connection', socket => {
  console.log('a user has connected');
  socket.emit('chat-message', 'Hello World');
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});







http.listen(5500, () => {
  console.log('listening on *:5500');
});