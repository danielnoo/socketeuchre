const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require('path');
const Deck = require('./deck')
const {
  joinChat,
  userLeave,
  getCurrentUser,
  getUserList,
  switchTeams,
  arrangeTeams,
  setNextUsersTurn
} = require('./users')
const { shuffleAndDeal, getLeftOfHost, setInitialTurn } = require('./euchre');
const { get } = require('http');

app.use('/', express.static(path.join(__dirname, 'dist')));

io.on('connection', socket => {
  socket.on('new-user', userName => {
    const user = joinChat(socket.id, userName)
    if(user.host === true){
      socket.emit('bestow-host-priveleges')
    }
    socket.broadcast.emit('user-connected', user.username)
    io.emit('player-list', getUserList())
  })
  socket.on('send-chat-message', message => {
    user = getCurrentUser(socket.id)
    
    socket.broadcast.emit('chat-message', { message: message, userName: user.username })
  })
  socket.on('disconnect', () => {
    const user = getCurrentUser(socket.id)
    socket.broadcast.emit('user-disconnected', user)
    
    userLeave(socket.id)
    socket.emit('player-list', getUserList())
  })
  socket.on('switch-teams', team => {
    switchTeams(socket.id, team)
    const users = getUserList()
    console.log(users)
    io.emit('player-list', users)
    checkFullTeams(users)
   
    function checkFullTeams(users) {
      let goodTeamCount = 0
      let evilTeamCount = 0
      users.forEach(user => {
        if(user.team == 'good'){
          goodTeamCount++
        } else if(user.team == 'evil'){
          evilTeamCount++
        }
      })
      if(goodTeamCount === 2 && evilTeamCount === 2){
        io.emit('teams-full')
      }
    }
  })
  
  socket.on('start-game', () => {
    let userList = arrangeTeams()
    let initialDeal = shuffleAndDeal(arrangeTeams())
    
    io.emit('kitty-pile', initialDeal[1][3])
    userList.forEach(player => {
      for(let i = 0; i < 4; i++){
        if(initialDeal[0][i].id === player.id) {
          io.to(player.id).emit('player-hand', initialDeal[0][i].cards)
        }
      }
      
    })
    // maybe wipe the cards array at this point as it is no longer needed since
    // each client has their own cards and they can see the turned up trump card
    
    // find the player left of the dealer and set their turn to true
    userList = setInitialTurn(userList)
    io.emit('seat-at-table', userList)
    // starting at the user to the left of the host, send the offer to order up the host or pass. initialDeal[0] is sent along so that it can be passed back to the server's next function without having to re-define
    io.to(userList[getLeftOfHost(userList)]['id']).emit('offerOrderUp', initialDeal[0])

    
    // receive this emit on client side - maybe time to set some structure on the front end
  })

  socket.on('ordered-up-dealer', (users) => {
    let host = users.find(user => user['host'] === true)
    console.log(`ordering up ${host['username']}`)
    console.log(users)
    io.to(host['id']).emit('ordered-up')
    // make sure to code in going alone if ordered up by own partner
  })

  socket.on('decline-order-up', (users, currentSeatPosition) => {
    let passToNext = 0
    let userList = users
    userList[currentSeatPosition]['turn'] = false
    if(currentSeatPosition !== 3) {
      passToNext = currentSeatPosition + 1
    }
    
    userList[passToNext]['turn'] = true
    // send change of turn status to all users
    io.emit('adjust-indicators', userList)
    // next player is given the chance to order up
    io.to(users[passToNext]['id']).emit('offerOrderUp', userList)
  })
  
  socket.on('start-make-suit-round', () => {
    console.log('holy shit it worked')
    // set active turn of the player to the left of the host/dealer and then
    // send the updated turn pointer to all players
    let userList = getUserList()
    userList.forEach(user => user['turn'] = false)
    userList[getLeftOfHost(userList)]['turn'] = true
    io.emit('turn-over-trump-card')
    io.emit('adjust-indicators', userList)
    // send make suit proposal to the player left of the host/dealer
    io.to(userList[getLeftOfHost(userList)]['id']).emit('make-suit-proposal', userList)
  })
  //make suit round - start left of dealer - record in some kind of round detail that the round was started by this player's team
  socket.on('make-suit', (suit) => {
    console.log(suit)
  })
  
  // client passes on making the suit - get seat position of user, pass to next user
  socket.on('decline-make-suit', (currentUser) => {
    // get current seat position
    let userList = getUserList()
    
    let currentSeatPosition = userList.findIndex(user => user['id'] == currentUser)
    // pass to next user
    userList[currentSeatPosition]['turn'] = false
    let passToNext = 0
    if(currentSeatPosition !== 3) {
      passToNext = currentSeatPosition + 1
    }
    setNextUsersTurn(passToNext)
    userList = getUserList()
    // emit turn indicators and send the make-suit-proposal to the next player
    io.emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('make-suit-proposal', userList)
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










