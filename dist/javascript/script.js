const socket = io()
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
import Deck from './deck.js'

const goodTeam = document.querySelector('#good')
const evilTeam = document.querySelector('#evil')
let players = {}

const userName = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', userName)

socket.on('chat-message', data => {
  appendMessage(`${data.userName}: ${data.message}`)
})

// update player list and team they're on 
socket.on('player-list', userList => {
    players = userList;
    console.log(players)
})

socket.on('user-connected', userName => {
  appendMessage(`${userName} connected`)
})
socket.on('join-good', user => {
  let li = document.createElement("li")
  li.id = user
  li.innerHTML = `${user}`
  goodTeam.appendChild(li)
})
socket.on('user-disconnected', userName => {
  appendMessage(`${userName} disconnected`)
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})






/// card game



const shuffleButton = document.querySelector('#shuffle')
shuffleButton.addEventListener('click', () => {
   socket.emit('shuffle')
})
console.log(players[socket.id])
const switchTeamsButton = document.querySelector('#switchTeams')
switchTeamsButton.addEventListener('click', () => {
  if(players['team'] === "Good"){
  goodTeam.removeChild(document.getElementById(`${userName}`))
  }
})



function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.prepend(messageElement)
}