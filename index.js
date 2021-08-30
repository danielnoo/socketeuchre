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
  setHostAndRoom
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
  checkBauerLead
} = require('./euchre');




app.use('/', express.static(path.join(__dirname, 'dist')));

io.on('connection', socket => {
  socket.on('new-user', userName => {
    ////check if the user is already logged in and just changing their name
    // get the user list and match the socket.id using array.some()
    const users = getUserList()
    if(!users.some(element => element.id.includes(socket.id))){
      joinChat(socket.id, userName)
    }
    socket.broadcast.emit('user-connected', userName)
    io.emit('player-list', getUserList())
    console.log(getUserList())
  })
  // use this function to bestow host privs, create the room(joining creates a room), and then emit the room's existence to others
  socket.on('create-room', () => {
    
    const user = getCurrentUser(socket.id)
    // its not a hash but if two users get the same room number and crash the server i'll be very impressed.
    const roomId = Math.floor(Math.random() * 99999999)
    const clientRoomName = `${user.userName}'s Room`
    socket.join(roomId)
    console.log(socket.rooms)
    socket.emit('bestow-host-priveleges')
    
    /// think about whether this needs to be here - might be redundant with the use of a polling function - maybe another data structure in the users.js file where separate room data is stored would be more effective - 
    // TODO set this up ^ plus make a function there to grab the info from here and make it callable by another function
    //io.emit('room-created', clientRoomName)
    setHostAndRoom(true, clientRoomName, roomId, user)
  })

  socket.on('get-room-data', () => {
    const users = getUserList()
    let roomArray = []
    // get occurences of each room
    users.forEach((user, index) => {
      const {roomName, roomId} = user
      
      if(roomId !== undefined){
        roomArray[index] = [roomName, roomId]
      }
    })
    socket.emit('send-room-data', (roomArray))
  
  })
  

  ///////////////// to do ///////////
  ////////// change room creation away from numbered system to hex system ////////////////////////////////// present to client a room with the creators name
  /// Math.floor(Math.random() * 99999999)
  ///// - add room polling function to client side
  
  socket.on('send-chat-message', message => {
    const user = getCurrentUser(socket.id)
    
    socket.broadcast.emit('chat-message', { message: message, userName: user.username })
  })
  socket.on('disconnect', () => {
    // socket.open()
  })
  socket.on('user-timeout', socket => {
    const user = getCurrentUser(socket)
    io.emit('user-disconnected', user)
    
    userLeave(socket)
    // socket.emit('player-list', getUserList())
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
  
  socket.on('start-game', (dealerID) => {
    let userList = arrangeTeams()
    userList.forEach(user => user['cards'] = [])
    let initialDeal = shuffleAndDeal(userList)
    
    let scoreBoard = returnScore()
    if(scoreBoard['gamesPlayed'] === 0){
      io.emit('seat-at-table', userList)
    } else {
      let host = userList.findIndex(user => user['host'])
      userList[host]['turn'] = false
    }

    io.emit('kitty-pile', initialDeal[1][3], scoreBoard)
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
    
    userList[getLeftOfHost(userList)]['turn'] = true
    io.emit('adjust-indicators', userList)
    
    // starting at the user to the left of the host, send the offer to order up the host or pass. initialDeal[0] is sent along so that it can be passed back to the server's next function without having to re-define
    io.to(userList[getLeftOfHost(userList)]['id']).emit('offerOrderUp', initialDeal[0])

    
    // receive this emit on client side - maybe time to set some structure on the front end
  })

  socket.on('ordered-up-dealer', (users, localClientSeatPosition, goingAlone) => {
    console.log(users)
    let host = users.find(user => user['host'])
    console.log(`ordering up ${host['username']}`)
    gameStats.currentRoundMaker = users[localClientSeatPosition]['team']
    users = setDealersTurn(users)
    io.emit('adjust-indicators', users)
    gameStats.goingAlone = goingAlone
    if(goingAlone){
      let notPlayingId = setNotPlaying(gameStats, users, localClientSeatPosition)
      io.to(host['id']).emit('forced-order-up', notPlayingId)
    } else {
      io.to(host['id']).emit('forced-order-up')
    }
    
    console.log(gameStats)
    
    
    
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
  
  // all players have passed on the initial turned up suit, which starts another
  // cycle in which players can choose what suit to make, other than the suit that they 
  // previously declined
  socket.on('start-make-suit-cycle', (initialKitty) => {
    // set active turn of the player to the left of the host/dealer and then
    // send the updated turn pointer to all players
    let userList = getUserList()
    userList.forEach(user => user['turn'] = false)
    userList[getLeftOfHost(userList)]['turn'] = true
    io.emit('turn-over-trump-card')
    io.emit('adjust-indicators', userList)
    // send make suit proposal to the player left of the host/dealer
    io.to(userList[getLeftOfHost(userList)]['id']).emit('make-suit-proposal', userList, initialKitty)
  })
  
    
  // client passes on making the suit - get seat position of user, pass to next user
  socket.on('decline-make-suit', (currentUser) => {
    // get current seat position
     
       
    const passToNext = setNextUsersTurn(currentUser)
    let userList = getUserList()
    // emit turn indicators and send the make-suit-proposal to the next player
    io.emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('make-suit-proposal', userList)
  })

  //a player has chosen the suit for the round - tell the gameStats object which team they are on - move the turn arrow back to left of dealer 
  socket.on('make-suit-begin-round', (trump, userId, goingAlone) => {
    gameStats.currentRoundTrump = trump
    let userList = getUserList()
    const suitMaker = userList.findIndex(user => user['id'] === userId)
    gameStats.currentRoundMaker = userList[suitMaker]['team']
    gameStats.goingAlone = goingAlone
    let localClientSeatPosition = userList.findIndex(user => user.id === userId)
    

    if(gameStats.goingAlone){
      setNotPlaying(gameStats, userList, localClientSeatPosition)
      io.emit('remove-lone-partner', gameStats)
    }
    const host = userList.filter(user => user['host'])
    const passToNext = setNextUsersTurn(host[0].id)
    io.emit('adjust-indicators', userList)
    io.emit('make-suit-set-kitty', trump)
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats, userList)
    
  })

  socket.on('dealer-lone-hand-pickup', (userId) =>{
    gameStats.goingAlone = true
    let userList = getUserList()
    const suitMaker = userList.filter(user => user['id'] === userId)
    gameStats.currentRoundMaker = suitMaker[0]['team']
    let localClientSeatPosition = userList.findIndex(user => user.id === userId)
    setNotPlaying(gameStats, userList, localClientSeatPosition)
    io.emit('remove-lone-partner', gameStats)

  })

  socket.on('dealer-picked-up-trump-card', () => {
    const userList = getUserList()
    const dealerIndex = userList.findIndex(user => user['host'])
    gameStats.currentRoundMaker = userList[dealerIndex]['team']
  })


  socket.on('begin-round', (trump) => { 
    gameStats.currentRoundTrump = trump

    const userList = getUserList()
    io.emit('set-kitty-to-trump', gameStats.currentRoundTrump)
    
    // if a lone hand is starting, remove partner's cards from table
    if(gameStats.goingAlone){
      io.emit('remove-lone-partner', gameStats, userList)
    }
    
    
    const host = userList.filter(user => user['host'])
    
    let passToNext = setNextUsersTurn(host[0].id)
    io.emit('adjust-indicators', userList)
    
    
    
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats, userList)
  })

  socket.on('submit-played-card', (dataset, currentUser, leadSuit) => {
    // set turn to next player index
    // emit played card to other users
    console.log(returnScore())
    if(leadSuit[0]){
      gameStats.currentRoundLeadSuit = leadSuit[1]
      // function checks if a left-bauer has been led and changes the lead suit accordingly
      checkBauerLead(dataset)
    }
    gameStats.currentRoundCards.push([currentUser, dataset])
    
    let passToNext = setNextUsersTurn(currentUser)
    let userList = getUserList()

    console.log(gameStats)

    io.emit('show-played-card', userList, currentUser, dataset, gameStats)
    // gameStats.completedRound()
    
    // this wasnt called because the roundCounter wasn't iterated yet 
    
    
    // if lone hand then check for 3 cards
    if(gameStats.goingAlone && gameStats.currentRoundCards.length == 3){
      tallyTrickScore(userList)
      betweenRoundsHouseKeeping()
      return
    }
    // calculate the winner if all 4 players have laid a card - clear the table -
    // set the score - send the play first card socket
    if(gameStats.currentRoundCards.length == 4){
      
      //function calls on value map to determine the scores of the cards
      //returns the winning user's index
      tallyTrickScore(userList)
      console.log('score tallied')

      betweenRoundsHouseKeeping()
      
      return
    }
    // continue playing cards until each player has played one card at which point it is caught at
    // a higher point in the script
    io.emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats, userList)

    function betweenRoundsHouseKeeping(){
      if(gameStats.roundCounter === 5){
        tallyRoundScore()
        console.log(gameStats)
        let scoreBoard = returnScore()
        if(scoreBoard.goodScore[2] > scoreBoard.evilScore[2]) {
          io.emit('score-notification', 'Good wins the round, Praise Be!')
        } else {
          io.emit('score-notification', 'Evil wins the round, This is the Way.')
        }
        zeroTricks()
        io.emit('clear-table-set-score', returnScore())
        
        // move dealer and set turn to them
        userList = setDealer()
        
        io.emit('adjust-indicators', userList)
        // emit deal-button
        
        io.to(userList[userList.findIndex(user => user['host'])].id).emit('deal-button')
        
        if(gameStats.goingAlone){
          console.log(gameStats)
          io.emit('re-add-fourth-player', gameStats)
          gameStats.goingAlone = false
          gameStats.notPlayingIndex = undefined
        }
        return
      }
      
      
      io.emit('clear-table-set-score', returnScore())
      // setDealer()
      
      setWinnersTurn(gameStats.lastWinnerIndex)
      /////////////////////////dont need deal button until all cards are gone so just send the play card emit
      io.emit('adjust-indicators', userList)
      //let host = userList.findIndex(user => user['host'])
      io.to(userList[gameStats.lastWinnerIndex]['id']).emit('play-a-card', gameStats, userList)
      
      
    }
  })

  socket.on('skip-my-turn', (currentUser, gameStats) => {
    
    let passToNext = setNextUsersTurn(currentUser)
    let userList = getUserList()
    io.emit('adjust-indicators', userList)
    
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats, userList)
  })
})  



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});










http.listen(port, () => {
  console.log(`listening on ${port}`);
});














