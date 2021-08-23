import { socket } from './script.js';



// refactor to remove the alert - make it so that setting a name will enable the start game and/or join room buttons
// restrict length 
// allow alphanumeric only

export function setNameAlert() {
  const setName = document.querySelector('#setName')
  const nameLock = document.querySelector('#nameLock')
  
  // get username from setName
  setName = setName.inner_text
  console.log(setName)
  socket.emit('new-user', userName)
}

