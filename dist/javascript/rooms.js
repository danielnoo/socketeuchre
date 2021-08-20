import { socket } from './script.js';




export function setNameAlert() {
  const setName = document.querySelector('#setName')
  setName.addEventListener('click', setNameAlert)
  const userName = prompt('What is your name?')
  appendMessage('You joined')
  socket.emit('new-user', userName)
}

