import { socket } from './script.js';



// refactor to remove the alert - make it so that setting a name will enable the start game and/or join room buttons
// restrict length 
// allow alphanumeric only

export function setNameAlert() {
  const setName = document.querySelector('#setName')
  setName.addEventListener('click', setNameAlert)
  const userName = prompt('What is your name?')
  appendMessage('You joined')
  socket.emit('new-user', userName)
}

