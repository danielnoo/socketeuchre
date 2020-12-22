let users = []

function joinChat(id, username) {
  const user = { 
    id, 
    username, 
    host: false,
    cards: [] }
  if(users.length === 0){
    user.host = true
    user.username = username + ' - DEALER'
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
  return rearrangedUsers
}


module.exports = {
  joinChat,
  userLeave,
  getCurrentUser,
  getUserList,
  switchTeams,
  arrangeTeams
};