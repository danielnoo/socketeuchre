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
  if(host){
    socketRooms[roomName] = []
    socketRooms[roomName].push(updatedUser)
  } else {
    socketRooms[roomName].push(updatedUser)
  }
  console.log(socketRooms)
}

//remove user from users upon d/c

function userLeave(id) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    console.log(`${users[index].userName} disconnected`)
    return users.splice(index, 1)[0]
  }

}

// when user leaves their game setup room to return to lobby
// call to make sure room data is updated for other users

function leavingRoom(currentUser) {
  // remove the user from the socketRoom object
  const socketRoomIndex = socketRooms[currentUser.roomName].findIndex(user => user.id === currentUser.id)
  socketRooms[currentUser.roomName].splice([socketRoomIndex], 1)
  
  
  // zero out user's roomName on users object
  const usersIndex = users.findIndex(user => user.id === currentUser.id)
  users[usersIndex].roomName = undefined
}

function getUserList() {
  return users
}

function clearUserCards() {
  users.forEach(user => user['cards'] = [])
}

function switchTeams(id, team, room) {
  
  socketRooms[room] = getRoomUsers(room)
  const index = socketRooms[room].findIndex(user => user.id === id)

  if (index !== -1) {
    console.log(`${users[index].userName} joined the ${team} team`)
    socketRooms[room][index].team = team
  }
}

// use this function to grab the users list from the room of the socket that requested it


function getRoomUsers (userRoomName) {
  socketRooms[userRoomName] = users.filter(user => user.roomName === userRoomName)
  return socketRooms[userRoomName]
}

function refreshPlayerList(roomName) {
  return socketRooms[roomName]
}

/// an alernate polling function, should be more simple
function sendRoomData () {
  let data = {}
  for(rooms in socketRooms) {
    data[rooms] = socketRooms[rooms].length
  }
  return data
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



// this function takes the user that has just completed their turn
// it makes everyone's turn set to false, then updates the appropriate user's turn status and returns the index of the next user's turn

function setNextUsersTurn(passingUser) {
  
  // set all turns to false
  socketRooms[passingUser.roomName].forEach(user => user['turn'] = false) 
  
  let currentSeatPosition = socketRooms[passingUser.roomName].findIndex(user => user['id'] == passingUser.id)
    // pass to next user
  let passToNext = 0
  
  if(currentSeatPosition !== 3) {
    passToNext = currentSeatPosition + 1
    }
  
  socketRooms[passingUser.roomName][passToNext]['turn'] = true

  return passToNext
}

// used when dealer is ordered up and needs turn arrow to indicate they are 
// deciding which card to discard
function setDealersTurn(usersInGame) {
  usersInGame.forEach(user => {
    if(user['turn']){
      user['turn'] = false
    } else if(user['host']) {
      user['turn'] = true
    }
  })

  return usersInGame
}


// function to be run between hands - works since the player to the left of the dealer already has their turn flagged as true so they just need to be presented with a deal button


///////////////////////////////////////////////////////////////////////fix


function setDealer(userList) {
  userList.forEach(user => {
    user['turn'] = false
  })
  let hostIndex = users.findIndex(user => user['host'])
  let newHostIndex = hostIndex

  if(hostIndex !== 3){
    newHostIndex++
  } else {
    newHostIndex = 0
  }

  userList[hostIndex]['host'] = false
  userList[newHostIndex]['host'] = true
  userList[newHostIndex]['turn'] = true 
  
  return userList

}




// function that's run once every 4 cards, the player who wins the trick begins the next one
function setWinnersTurn(winnerIndex, roomName) {
  socketRooms[roomName].forEach(user => user['turn'] = false)
  socketRooms[roomName][winnerIndex]['turn'] = true
}



/////////////////////////////////////////////////////////////
////// user leaves game and disbands the room entirely sending all participants
/////  back to the lobby

function userLeaveGame(userList) {
  
  delete socketRooms[userList[0].roomName]
  console.log(`deleted ${userList[0].roomName} from socketRooms`)
  
  // socketRooms[userList[0].roomName] = []
   
  userList.forEach(user => {
    
    for(let i = 0; i < users.length; i++) {
      if(user.id === users[i].id) {
        users[i] = {
          ...user,
          roomName: undefined,
          host: false,
          turn: false,
          cards: [],
          team: undefined

        }
      }
    }
  })  
    
 
  

  setTimeout(() => {console.log(users)},1500)
}



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
  setHostAndRoom,
  getRoomUsers,
  leavingRoom,
  userLeaveGame,
  sendRoomData,
  refreshPlayerList
};