const users = []

function joinChat(id, username) {
  const user = { id, username }

  users.push(user)

  return user
}

function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    console.log('removing user')
    return users.splice(index, 1)[0]
  }

}

function getUserList() {
  return users
}

module.exports = {
  joinChat,
  userLeave,
  getCurrentUser,
  getUserList
};