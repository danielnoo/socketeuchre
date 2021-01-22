let users = []

function joinChat(id, username) {
  const user = { 
    id, 
    username, 
    host: false,
    turn: false,
    cards: [] 
  }
  if(users.length === 0){
    user.host = true
  }
  users.push(user)

  return user
}

function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    console.log(`${users[index].username} disconnected`)
    return users.splice(index, 1)[0]
  }

}
////// - make it only apply HOST tag once
function getUserList() {
  
  return users
}

function switchTeams(id, team) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    if(team.length > 0){
      console.log(`${users[index].username} joined the ${team} team`)
    } else {
      console.log(`${users[index].username} has decided to spectate`)
    }
    return users[index].team = team
    
  }
}

// set teams up so that each player is "across" from each other by alternating
// their positions in an array

function arrangeTeams() {
  let rearrangedUsers = []
  let good = users.filter(user => user.team == 'good')
  let evil = users.filter(user => user.team == 'evil')

  for(let i = 0; i < 4 ; i++){
    if(i % 2 == 0){
      rearrangedUsers.push(good.shift())
    } else {
      rearrangedUsers.push(evil.shift())
    }
  }
  console.log(rearrangedUsers)
  users = rearrangedUsers
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
    if(user['turn'] == true){
      user['host'] = true
    } else {
      user['host'] = false
    }
  })
}

function setWinnersTurn(winnerIndex) {
  users.forEach(user => user['turn'] = false)
  users[winnerIndex]['turn'] = true
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
  setWinnersTurn
};