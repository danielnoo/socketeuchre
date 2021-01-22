const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const Deck = require('./deck');
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
  setWinnersTurn
} = require('./users');
const { 
  shuffleAndDeal, 
  getLeftOfHost, 
  setInitialTurn, 
  gameStats,
  setNotPlaying, 
  tallyHandScore,
  resetAfterRound
} = require('./euchre');


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

  socket.on('ordered-up-dealer', (users, localClientSeatPosition, goingAlone) => {
    let host = users.find(user => user['host'] === true)
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
    const suitMaker = userList.filter(user => user['id'] === userId)
    gameStats.currentRoundMaker = suitMaker[0]['team']
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

  } )
  socket.on('begin-round', (trump) => { // find out why i wanted to include the user here
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

  socket.on('submit-played-card', (dataset, currentUser, gameStats) => {
    // set turn to next player index
    // emit played card to other users
    
    
    
    let passToNext = setNextUsersTurn(currentUser)
    let userList = getUserList()

    console.log(gameStats)

    io.emit('show-played-card', userList, currentUser, dataset, gameStats)
    // gameStats.completedRound()
    
    // this wasnt called because the roundCounter wasn't iterated yet 
    if(gameStats.roundCounter === 5) {
      console.log('round over tally score')
    }
    
    
    // if lone hand then check for 3 cards
    if(gameStats.goingAlone && gameStats.currentRoundCards.length == 3){
      let winningIndex =  tallyHandScore(gameStats, userList)
      gameStats = resetAfterRound()
    }
    // calculate the winner if all 4 players have laid a card - clear the table -
    // set the score - send the play first card socket
    if(gameStats.currentRoundCards.length == 4){
      
      //function calls on value map to determine the scores of the cards
      //returns the winning user's index
      gameStats = tallyHandScore(gameStats, userList)
      
      
      console.log(gameStats)
      
      // round update should come in here - certain things below should only happen if it is not the end of the round
      if(gameStats.roundCounter === 5){
        gameStats = tallyRoundScore()
        // move dealer
        // emit deal-button
      }
      io.emit('clear-table-set-score', gameStats)
      // setDealer()
        
      setWinnersTurn(gameStats.lastWinnerIndex)
      /////////////////////////dont need deal button until all cards are gone so just send the play card emit
      io.emit('adjust-indicators', userList)
      //let host = userList.findIndex(user => user['host'])
      io.to(userList[gameStats.lastWinnerIndex]['id']).emit('play-a-card', gameStats, userList)
        
      return
    }

    io.emit('adjust-indicators', userList)
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats, userList)
  })

  socket.on('skip-my-turn', (currentUser, gameStats) => {
    console.log(currentUser)
    let passToNext = setNextUsersTurn(currentUser)
    let userList = getUserList()
    io.emit('adjust-indicators', userList)
    
    io.to(userList[passToNext]['id']).emit('play-a-card', gameStats, userList)
  })
})  



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});










http.listen(5500, () => {
  console.log('listening on *:5500');
});














