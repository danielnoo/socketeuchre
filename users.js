const users = []

function joinChat(id, username) {
  const user = { 
    id, 
    username, 
    host: false }
  if(users.length === 0){
    user.host = true
    user.username = username + ' - HOST'
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
module.exports = {
  joinChat,
  userLeave,
  getCurrentUser,
  getUserList,
  switchTeams
};