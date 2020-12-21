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
// stuck here - maybe switch to just doing good/evil/good/evil
function arrangeTeams() {
  let rearrangedUsers = []
  
  const getHost = users.filter(user => user.host)
  rearrangedUsers.push(getHost)
  for(let i = 3; i > 0; i--){
    if(users[i]['team'] == getHost.team && rearrangedUsers.length % 2 == 0) {
      rearrangedUsers.push(users[i]) 
    } else {
      rearrangedUsers
    }
  }

  rearrangedUsers.push(getHost, otherTeam.pop(), getHostTeammate, otherTeam)
  console.log(otherTeam)
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