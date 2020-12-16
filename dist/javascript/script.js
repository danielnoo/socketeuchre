const socket = io()
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
import Deck from './deck.js'


const userName = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', userName)
console.log(socket)
socket.on('chat-message', data => {
  appendMessage(`${data.userName}: ${data.message}`)
})

socket.on('user-connected', userName => {
  appendMessage(`${userName} connected`)
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

const deck = new Deck()

console.log(deck)





function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.prepend(messageElement)
}