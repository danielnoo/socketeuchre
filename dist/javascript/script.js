const socket = io()
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
import Deck from './deck.js'

const spectators = document.querySelector('#spectate')
const goodTeam = document.querySelector('#good')
const evilTeam = document.querySelector('#evil')

let players = {}

const userName = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', userName)




socket.on('chat-message', data => {
  console.log(data)
  appendMessage(`${data.userName}: ${data.message}`)
})

// update player list and team they're on --use foreach and update team placement and score
socket.on('player-list', userList => {
    
    console.log(userList)
   
    
})

socket.on('user-connected', userFromServer => {
  console.log(userFromServer)
  appendMessage(`${userFromServer} connected`)
})
socket.on('join-good', user => {
  let div = document.createElement("div")
  
  div.innerHTML = `${user} `
  spectators.appendChild(div)
})
socket.on('user-disconnected', data => {
  
  if(data !== null){
  appendMessage(`${data.alias} disconnected`)
  }
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})


console.log(players)



/// card game



const shuffleButton = document.querySelector('#shuffle')
shuffleButton.addEventListener('click', () => {
   socket.emit('shuffle')
})

const switchTeamsButton = document.querySelector('#switchTeams')
switchTeamsButton.addEventListener('click', () => {
  console.log(players)
  if(players['team'] === "Good"){
  goodTeam.removeChild(document.getElementById(`${userName}`))
  }
})



function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.prepend(messageElement)
}

