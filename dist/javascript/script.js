const socket = io()
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
import Deck from './deck.js'


const goodTeam = document.querySelector('#good')
const evilTeam = document.querySelector('#evil')
const joinGoodButton = document.querySelector('#joinGood')
const joinEvilButton = document.querySelector('#joinEvil')
const spectateButton = document.querySelector('#spectateButton')


const userName = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', userName)




socket.on('chat-message', data => {
  console.log(data)
  appendMessage(`${data.userName}: ${data.message}`)
})

// update player list and team they're on --use foreach and update team placement and score
socket.on('player-list', userList => {
    while(goodTeam.firstChild) {
      goodTeam.firstChild.remove()
    }
    while(evilTeam.firstChild) {
      evilTeam.firstChild.remove()
    }
    console.log(userList)
   userList.forEach(user => {
    let div = document.createElement("div")
    div.innerHTML = `${user.username}`
      
    if(user.team == 'evil'){
      evilTeam.appendChild(div)
    } else if(user.team == 'good') {
      goodTeam.appendChild(div)
     }
   })
    
})

socket.on('user-connected', userFromServer => {
  console.log(userFromServer)
  appendMessage(`${userFromServer} connected`)
})

socket.on('user-disconnected', data => {
  console.log(data)
  if(data !== null){
  appendMessage(`${data.username} disconnected`)
  }
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})






/// switching teams

spectateButton.addEventListener('click', () => {
  socket.emit('switch-teams', '')
})

joinEvilButton.addEventListener('click', () => {
  socket.emit('switch-teams', 'evil')
})

joinGoodButton.addEventListener('click', () => {
  socket.emit('switch-teams', 'good')
  
})




/// card game

const shuffleButton = document.querySelector('#shuffle')
shuffleButton.addEventListener('click', () => {
   socket.emit('shuffle')
})



function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.prepend(messageElement)
}

