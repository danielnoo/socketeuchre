let users = []

let socketRooms = {}

function joinChat(id, userName) {
  const user = { 
    id, 
    userName,
    roomName: undefined,
    host: false,
    turn: false,
    cards: [] 
  }
  
  users.push(user)

  return user
}

function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// this function is used whether a user has either joined or created a roomName
// takes the params and updates their user index
// can also be used for leaving a room when i get to it
function setHostAndRoom(host, roomName, user) {
  console.log(`sethostandroom ${user}`)
  const index = users.findIndex(currentUser => currentUser.id === user.id)
  const updatedUser = {
    ...user,
    host,
    roomName,
  }
  

  users[index] = updatedUser
  console.log(users)
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    console.log(`${users[index].userName} disconnected`)
    return users.splice(index, 1)[0]
  }

}
////// - need to retool this function to incorporate rooms - maybe?
function getUserList() {
  
  return users
}

function clearUserCards() {
  users.forEach(user => user['cards'] = [])
}

function switchTeams(id, team) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    if(team.length > 0){
      console.log(`${users[index].userName} joined the ${team} team`)
    } else {
      console.log(`${users[index].userName} has decided to spectate`)
    }
    return users[index].team = team
    
  }
}

// set teams up so that each player is "across" from each other by alternating
// their positions in an array
//  -- sept 21 -- since changing the setup of the game to implement rooms and multiple concurrent games, this function changes to one that doesnt simply grab data from the users array, but first takes the correct users out of the users array based on rooms, puts them in the socketRooms object, and arranges them into proper euchre seating format -- will have to take some info from the user(host) that calls the start of the game

function arrangeTeams(hostRoomName) {
  
  // find the host's roomies and put them all in the socketRooms object together

  socketRooms[hostRoomName] = users.filter(user => user.roomName === hostRoomName)
  
  let rearrangedUsers = []
  let good = socketRooms[hostRoomName].filter(user => user.team == 'good')
  let evil = socketRooms[hostRoomName].filter(user => user.team == 'evil')

  // shift one good then one evil and so on to separate the teams
  for(let i = 0; i < 4 ; i++){
    if(i % 2 == 0){
      rearrangedUsers.push(good.shift())
    } else {
      rearrangedUsers.push(evil.shift())
    }
  }
  console.log(rearrangedUsers)
  socketRooms[hostRoomName] = rearrangedUsers
  return rearrangedUsers

}

// this function takes the id of the user that has just completed their turn
// it updates the appropriate user's turn status and returns the index of the next
// user's turn

function setNextUsersTurn(currentUser) {
  users.forEach(user => user['turn'] = false)
  
  let currentSeatPosition = users.findIndex(user => user['id'] == currentUser)
    // pass to next user
  let passToNext = 0
  
  if(currentSeatPosition !== 3) {
    passToNext = currentSeatPosition + 1
    }
  
  
  users[passToNext]['turn'] = true

  return passToNext
}

// used when dealer is ordered up and needs turn arrow to indicate they are 
// deciding which card to discard
function setDealersTurn(users) {
  users.forEach(user => {
    if(user['turn']){
      user['turn'] = false
    } else if(user['host']) {
      user['turn'] = true
    }
  })

  return users
}


// function to be run between hands - works since the player to the left of the dealer already has their turn flagged as true so they just need to be presented with a deal button
function setDealer() {
  users.forEach(user => {
    user['turn'] = false
  })
  let hostIndex = users.findIndex(user => user['host'])
  let newHostIndex = hostIndex

  if(hostIndex !== 3){
    newHostIndex++
  } else {
    newHostIndex = 0
  }

  users[hostIndex]['host'] = false
  users[newHostIndex]['host'] = true
  users[newHostIndex]['turn'] = true 
  
  return users

}




// function that's run once every 4 cards, the player who wins the trick begins the next one
function setWinnersTurn(winnerIndex) {
  users.forEach(user => user['turn'] = false)
  users[winnerIndex]['turn'] = true
}



/////////////////////////////////////////////////////////////
////// adding functionality for room-based play
///// changing source of truth for gameplay to a 4-player user array that should be generated
///// at the start of the game 





module.exports = {
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
};