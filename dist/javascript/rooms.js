import { socket } from './script.js';



// refactor to remove the alert - make it so that setting a name will enable the start game and/or join room buttons
// restrict length 
// allow alphanumeric only

export function setNameAlert() {
  const setName = document.querySelector('#setName')
  let nameLock = document.querySelector('#nameLock')
  const createRoomButton = document.querySelector('#createRoom')
  const lockIcon = document.querySelector('#lockIcon')
  let userName
  // get username from setName
  nameLock.addEventListener('click', grabName)
  // put in function on button press
  
  // deal with the emit on server side 
  socket.emit('new-user', userName)

// remove fa-lock-open and add fa-lock - set username - addeventlistener to create/join room
  function grabName() {
    
    lockIcon.classList.remove('fa-lock-open')
    lockIcon.classList.add('fa-lock')
    userName = setName.value
    setName.classList.add('name-is-set')
    console.log(userName)
    nameLock.removeEventListener('click', grabName)
    createRoomButton.addEventListener('click', createRoom)
    nameLock.addEventListener('click', () => {
      lockIcon.classList.remove('fa-lock')
      lockIcon.classList.add('fa-lock-open')
      setName.classList.remove('name-is-set')
      
      // re-add eventlistener to close the loop
      nameLock.addEventListener('click', grabName)
    })

  }

  function createRoom() {

  }
}

