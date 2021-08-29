import { socket } from './script.js';


// refactor to remove the alert - make it so that setting a name will enable the start game and/or join room buttons
// restrict length 
// allow alphanumeric only

export function setNameAlert() {
  const setName = document.querySelector('#setName')
  const nameLock = document.querySelector('#nameLock')
  const createRoomButton = document.querySelector('#createRoom')
  const lockIcon = document.querySelector('#lockIcon')
  let userName
  // get username from setName
  nameLock.addEventListener('click', grabName)
  // put in function on button press
  
  // deal with the emit on server side 
  

// remove fa-lock-open and add fa-lock - set username - addeventlistener to create/join room
  function grabName() {
    
    lockIcon.classList.remove('fa-lock-open')
    lockIcon.classList.add('fa-lock')
    userName = setName.value
    setName.classList.add('name-is-set')
    console.log(userName)
    nameLock.removeEventListener('click', grabName)
    createRoomButton.addEventListener('click', createRoom)
    socket.emit('new-user', userName)
    nameLock.addEventListener('click', () => {
      lockIcon.classList.remove('fa-lock')
      lockIcon.classList.add('fa-lock-open')
      setName.classList.remove('name-is-set')
      
      // re-add eventlistener to close the loop
      nameLock.addEventListener('click', grabName)
    })

  }
// to do : create room on push of a button - maybe make 5 rooms max for now?
 
}

export function createRoom() {
    
  document.querySelector('.teamBoxesContainer').classList.remove('notVisible')
  document.querySelector('#roomTabSelector').classList.add('notVisible')
  socket.emit('create-room')
}

export function generateRoom(roomName) {
  // make a div that will hold two p tags
  const room = document.createElement('div')
  room.classList.add('teamButton', 'room-button')
  const roomTitleText = document.createElement('p')
  roomTitleText.textContent = roomName
  const numOfPlayersText = document.createElement('p')
  // numOfPlayersText should be dynamically updated
  numOfPlayersText.textContent = '0/4'
  // place children in the room div
  room.appendChild(roomTitleText)
  room.appendChild(numOfPlayersText)
  // place them on the page
  document.querySelector('#roomContainer').appendChild(room)
  
}