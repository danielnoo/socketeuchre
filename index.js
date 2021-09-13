const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const port = process.env.PORT || 5505;
const io = require('socket.io')(http);
const path = require('path');
const Deck = require('./deck');
require('dotenv').config()

const {
  joinChat,
  userLeave,
  getCurrentUser,
  getUserList,
  switchTeams,
  arrangeTeams,
  setNextUsersTurn,
  setDealersTurn,
  setDealer,
  setWinnersTurn,
  clearUserCards,
  setHostAndRoom,
  getRoomUsers,
  leavingRoom,
  userLeaveGame,
  sendRoomData,
  refreshPlayerList
} = require('./users');
const { 
  shuffleAndDeal, 
  getLeftOfHost, 
  gameStats,
  setNotPlaying, 
  tallyTrickScore,
  tallyRoundScore,
  returnScore,
  zeroTricks,
  checkBauerLead,
  initializeRoomScoreboard,
  checkGameWinner
} = require('./euchre');




app.use('/', express.static(path.join(__dirname, 'dist')));

io.on('connection', socket => {
  socket.on('new-user', userName => {
       
    joinChat(socket.id, userName)
    socket.broadcast.emit('user-connected', userName)
    
  })
  // use this function to bestow host privs, create the room(joining creates a room), and then emit the room's existence to others
  socket.on('create-room', () => {
    const user = getCurrentUser(socket.id)
    const clientRoomName = `${user.userName}'s Room`
    socket.join(clientRoomName)
    io.to(socket.id).emit('bestow-host-priveleges')
    setHostAndRoom(true, clientRoomName, user)
    initializeRoomScoreboard(clientRoomName)
    const userList = refreshPlayerList(clientRoomName)
    io.in(clientRoomName).emit('player-list', userList)
  })

  socket.on('get-room-data', () => {
    io.to(socket.id).emit('send-room-data', (sendRoomData()))
  })
  
   
  socket.on('join-room', room => {
    const user = getCurrentUser(socket.id)
    socket.join(room)
    setHostAndRoom(false, room, user)
    const userList = refreshPlayerList(room)
    io.in(room).emit('player-list', userList)
  })

  /////////// to be clear, this is leaving the room pre-game to return to lobby,
  /// not leaving game which disbands the room and game for all users
  socket.on('leave-room', () => {
    const user = getCurrentUser(socket.id)
    socket.leave(user.roomName)
    const userList = getRoomUsers(user.roomName)
    console.log(`${user.userName} left their room`)
    leavingRoom(user)
    /// this might be causing the problem
    if(!gameStats[user.roomName]) {
      io.in(user.roomName).emit('player-list', userList)
    } else {
      io.in(user.roomName).emit('playerDC-back-to-lobby', userList)
    }
  })


  socket.on('send-chat-message', message => {
    const user = getCurrentUser(socket.id)
    socket.broadcast.emit('chat-message', { message: message, userName: user.userName })
  })
  
  socket.on('disconnecting', () => {
    const user = getCurrentUser(socket.id)
    const userList = getRoomUsers(user.roomName)
    io.emit('user-disconnected', user)
    userLeave(socket.id)
    if(!gameStats[user.roomName]) {
      io.in(user.roomName).emit('player-list', userList)
    } else {
      io.in(user.roomName).emit('playerDC-back-to-lobby')
      gameStats[user.roomName] = {}
    }
  })

  socket.on('disconnect', () => {
    console.log(socket.id)
    
  })
  
  socket.on('user-timeout', () => {
    socket.disconnect()
  })
    
  ///// every time a user joins a team or switches teams the room should be visually updated
  //// the user data in the socketRoom object should be updated
  socket.on('switch-teams', team => {
    const currentUser = getCurrentUser(socket.id)
    switchTeams(socket.id, team, currentUser.roomName)
    const users = getRoomUsers(currentUser.roomName)
    
    
    io.in(currentUser.roomName).emit('player-list', users)
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
        io.in(currentUser.roomName).emit('teams-full')
      }
    }
  })

  
  socket.on('start-game', () => {
    const user = getCurrentUser(socket.id)
    let userList = arrangeTeams(user.roomName)
    userList.forEach(user => user['cards'] = [])
    let initialDeal = shuffleAndDeal(userList)
    io.in(user.roomName).emit('stop-polling')
    ///initialize the gameStats[roomName] object with this template
    gameStats[user.roomName] = {
      roundCounter: 0,
      currentRoundMaker: undefined,
      currentRoundTrump: undefined,
      currentRoundLeadSuit: undefined,
      initialTurnedUpSuit: undefined,
      goingAlone: false,
      notPlayingIndex: undefined,
      currentRoundCards: []
    }
    
    let scoreBoard = returnScore(user.roomName)
    
    if(scoreBoard['gamesPlayed'] === 0){
      io.in(user.roomName).emit('seat-at-table', userList)
    } else {
      let host = userList.findIndex(user => user['host'])
      userList[host]['turn'] = false
    }

    io.in(user.roomName).emit('kitty-pile', initialDeal[1][3], scoreBoard)
    userList.forEach(player => {
      for(let i = 0; i < 4; i++){
        if(initialDeal[0][i].id === player.id) {
          io.to(player.id).emit('player-hand', initialDeal[0][i].cards)
        }
      }
      
    })
        
    // find the player left of the dealer and set their turn to true
    
    userList[getLeftOfHost(userList)]['turn'] = true
    io.in(user.roomName).emit('adjust-indicators', userList)
    
    // starting at the user to the left of the host, send the offer to order up the host or pass. initialDeal[0] is sent along so that it can be passed back to the server's next function without having to re-define
    io.to(userList[getLeftOfHost(userList)]['id']).emit('offerOrderUp', initialDeal[0]) 
  
  })

  socket.on('ordered-up-dealer', (users, localClientSeatPosition, goingAlone) => {
    
    const currentUser = getCurrentUser(socket.id)
    let host = users.find(user => user['host'])
    gameStats[currentUser.roomName].currentRoundMaker = users[localClientSeatPosition]['team']
    users = setDealersTurn(users)
    io.in(users[0].roomName).emit('adjust-indicators', users)
    gameStats[currentUser.roomName].goingAlone = goingAlone
    if(goingAlone){
      let notPlayingId = setNotPlaying(gameStats[currentUser.roomName], users, localClientSeatPosition)
      io.to(host['id']).emit('forced-order-up', notPlayingId)
    } else {
      io.to(host['id']).emit('forced-order-up')
    }
    
    
    
  })
  // if a player has declined to order up the dealer by passing, pass the deal to the next player
  socket.on('decline-order-up', (users, currentSeatPosition) => {
    let passToNext = 0
    let userList = users
    userList[currentSeatPosition]['turn'] = false
    if(currentSeatPosition !== 3) {
      passToNext = currentSeatPosition + 1
    }
    
    userList[passToNext]['turn'] = true
    // send change of turn status to all users
    io.in(userList[0].roomName).emit('adjust-indicators', userList)
    // next player is given the chance to order up
    io.to(users[passToNext]['id']).emit('offerOrderUp', userList)
  })
  
  
  
  // all players have passed on the initial turned up suit, which starts another
  // cycle in which players can choose what suit to make, other than the suit that they 
  // previously declined
  socket.on('start-make-suit-cycle', (initialKitty) => {
    // set active turn of the player to the left of the host/dealer and then
    // send the updated turn pointer to all players
    const currentUser = getCurrentUser(socket.id)
    let userList = getRoomUsers(currentUser.roomName)
    userList.forEach(user => user['turn'] = false)
    userList[getLeftOfHost(userList)]['turn'] = true
    io.in(currentUser.roomName).emit('turn-over-trump-card')
    io.in(currentUser.roomName).emit('adjust-indicators', userList)
    // send make suit proposal to the player left of the host/dealer
    io.to(userList[getLeftOfHost(userList)]['id']).emit('make-suit-proposal', userList, initialKitty)
  })
  
    
  // client passes on making the suit - get seat position of user, pass to next user
  socket.on('decline-make-suit', () => {
    // get current seat position
    let passingUser = getCurrentUser(socket.id)
       
    const passToNext = setNextUsersTurn(passingUser)
    let userList = getRoomUsers(passingUser.roomName) 
    // emit turn indicators and send the make-suit-proposal to the next player
    io.in(passingUser.roomName).emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('make-suit-proposal', userList)
  })

  //a player has chosen the suit for the round - tell the gameStats object which team they are on - move the turn arrow back to left of dealer 
  
  socket.on('make-suit-begin-round', (trump, userId, goingAlone) => {
    const currentUser = getCurrentUser(userId)
    gameStats[currentUser.roomName].currentRoundTrump = trump
    const userList = getRoomUsers(currentUser.roomName)
    const suitMaker = userList.findIndex(user => user['id'] === userId)
    gameStats[currentUser.roomName].currentRoundMaker = userList[suitMaker]['team']
    gameStats[currentUser.roomName].goingAlone = goingAlone
    let localClientSeatPosition = userList.findIndex(user => user.id === userId)
    

    if(gameStats[currentUser.roomName].goingAlone){
      setNotPlaying(gameStats[currentUser.roomName], userList, localClientSeatPosition)
      io.emit('remove-lone-partner', gameStats[currentUser.roomName])
    }
    const host = userList.filter(user => user['host'])
    const passToNext = setNextUsersTurn(host[0]) // passToNext is set as an index value
    io.in(currentUser.roomName).emit('adjust-indicators', userList)
    io.in(currentUser.roomName).emit('make-suit-set-kitty', trump)
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats[currentUser.roomName], userList)
    
  })

  socket.on('dealer-lone-hand-pickup', () =>{
    const currentUser = getCurrentUser(socket.id)
    gameStats[currentUser.roomName].goingAlone = true
    let userList = getRoomUsers(currentUser.roomName)
    const suitMaker = userList.filter(user => user['id'] === socket.id)
    gameStats[currentUser.roomName].currentRoundMaker = suitMaker[0]['team']
    let localClientSeatPosition = userList.findIndex(user => user.id === userId)
    setNotPlaying(gameStats[currentUser.roomName], userList, localClientSeatPosition)
    io.in(currentUser.roomName).emit('remove-lone-partner', gameStats[currentUser.roomName])
  })

  socket.on('dealer-picked-up-trump-card', () => {
    const currentUser = getCurrentUser(socket.id)
    const userList = getRoomUsers(currentUser.roomName)
    const dealerIndex = userList.findIndex(user => user['host'])
    gameStats[currentUser.roomName].currentRoundMaker = userList[dealerIndex]['team']
  })


  socket.on('begin-round', (trump) => { 
    const currentUser = getCurrentUser(socket.id)
    gameStats[currentUser.roomName].currentRoundTrump = trump

    const userList = getRoomUsers(currentUser.roomName)
    io.in(currentUser.roomName).emit('set-kitty-to-trump', gameStats[currentUser.roomName].currentRoundTrump)
    
    // if a lone hand is starting, remove partner's cards from table
    if(gameStats[currentUser.roomName].goingAlone){
      io.in(currentUser.roomName).emit('remove-lone-partner', gameStats[currentUser.roomName], userList)
    }
    
    const host = userList.filter(user => user['host'])
    const passToNext = setNextUsersTurn(host[0])
    io.in(currentUser.roomName).emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats[currentUser.roomName], userList)
  })

  socket.on('submit-played-card', (dataset, leadSuit) => {
    // set turn to next player index
    // emit played card to other users
    const currentUser = getCurrentUser(socket.id)
   
    if(leadSuit[0]){
      gameStats[currentUser.roomName].currentRoundLeadSuit = leadSuit[1]
      // function checks if a left-bauer has been led and changes the lead suit accordingly
      checkBauerLead(dataset, currentUser.roomName)
    }
    gameStats[currentUser.roomName].currentRoundCards.push([socket.id, dataset])
    
    const passToNext = setNextUsersTurn(currentUser)
    let userList = getRoomUsers(currentUser.roomName)

    

    io.in(currentUser.roomName).emit('show-played-card', userList, currentUser.id, dataset, gameStats[currentUser.roomName])
    
    
    // if lone hand then check for 3 cards
    if(gameStats[currentUser.roomName].goingAlone && gameStats[currentUser.roomName].currentRoundCards.length == 3){
      tallyTrickScore(userList)
      betweenRoundsHouseKeeping()
      return
    }
    // calculate the winner if all 4 players have laid a card - clear the table -
    // set the score - send the play first card socket
    if(gameStats[currentUser.roomName].currentRoundCards.length == 4){
      
      //function calls on value map to determine the scores of the cards
      //returns the winning user's index
      tallyTrickScore(userList)
     

      betweenRoundsHouseKeeping()
      
      return
    }
    // continue playing cards until each player has played one card at which point it is caught at
    // a higher point in the script
    io.in(currentUser.roomName).emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats[currentUser.roomName], userList)

    function betweenRoundsHouseKeeping(){
      if(gameStats[currentUser.roomName].roundCounter === 5){
        tallyRoundScore(userList)
        let roundWinner
        let scoreBoard = returnScore(currentUser.roomName)
        if(scoreBoard.goodScore[2] > scoreBoard.evilScore[2]) {
          io.in(currentUser.roomName).emit('score-notification', 'Good wins the round, Praise Be!')
          roundWinner = 'Good team wins the game! Not today Satan!'
        } else {
          io.in(currentUser.roomName).emit('score-notification', 'Evil wins the round, This is the Way.')
          roundWinner = 'Evil team wins the game! The dark lord is pleased!'
        }
        zeroTricks(currentUser.roomName)
        io.in(currentUser.roomName).emit('clear-table-set-score', returnScore(currentUser.roomName))
        
        // move dealer and set turn to them
        userList = setDealer(userList)  ///////////////////////////////////
        
        io.in(currentUser.roomName).emit('adjust-indicators', userList)
        
        // emit deal-button to dealer
        io.to(userList[userList.findIndex(user => user['host'])].id).emit('deal-button')
        
        if(gameStats[currentUser.roomName].goingAlone){
          io.in(currentUser.roomName).emit('re-add-fourth-player', gameStats[currentUser.roomName])
          gameStats[currentUser.roomName].goingAlone = false
          gameStats[currentUser.roomName].notPlayingIndex = undefined
        }
        if(checkGameWinner(currentUser.roomName)){
          io.in(currentUser.roomName).emit('game-winner', roundWinner)
          io.in(currentUser.roomName).emit('clear-table-set-score', returnScore(currentUser.roomName))
        }
        return
      }
      
      
      io.in(currentUser.roomName).emit('clear-table-set-score', returnScore(currentUser.roomName))
      // setDealer()
      
      setWinnersTurn(gameStats[currentUser.roomName].lastWinnerIndex, currentUser.roomName)
      /////////////////////////dont need deal button until all cards are gone so just send the play card emit
      io.in(currentUser.roomName).emit('adjust-indicators', userList)
      //let host = userList.findIndex(user => user['host'])
      io.to(userList[gameStats[currentUser.roomName].lastWinnerIndex]['id']).emit('play-a-card', gameStats[currentUser.roomName], userList)
      
      
    }
  })

  socket.on('skip-my-turn', () => {
    const currentUser = getCurrentUser(socket.id)
    let passToNext = setNextUsersTurn(currentUser)
    let userList = getRoomUsers(currentUser.roomName)
    io.in(currentUser.roomName).emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats[currentUser.roomName], userList)
  })

  socket.on('pressed-leave', () => {
    const currentUser = getCurrentUser(socket.id)
    const userList = refreshPlayerList(currentUser.roomName)
    
    
    gameStats[currentUser.roomName] = {}
    
    userList.forEach(user => {
      io.to(user.id).emit('return-to-lobby', currentUser.userName)
      io.to(user.id).emit('clear-table-set-score', returnScore(currentUser.roomName))
      socket.leave(user.roomName)
    })
    userLeaveGame(userList)
  })
})  



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});










http.listen(port, () => {
  console.log(`listening on ${port}`);
});














