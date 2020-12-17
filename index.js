const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require('path');
const users = {}
const Deck = require('./deck')

app.use('/', express.static(path.join(__dirname, 'dist')));

io.on('connection', socket => {
  socket.on('new-user', userName => {
    users[socket.id] = {
      'name': userName,
      'team': 'Good',
      'cards': []
    }
    socket.broadcast.emit('user-connected', userName)
    socket.emit('player-list', users)
    socket.emit('join-good', users[socket.id]['name'])
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, userName: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
    socket.emit('player-list', users)
  })
  socket.on('shuffle', () => {
    deck.shuffle()
    console.log(deck)
    console.log(users[socket.id]['name'])
  })
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});










http.listen(5500, () => {
  console.log('listening on *:5500');
});

/// moving deck stuff to server side

const deck = new Deck()

