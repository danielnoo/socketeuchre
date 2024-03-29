import { socket } from './script.js';


// a function that adds a listener which takes the user's name on submit and displays the room selection screen

export function listenNameForm() {
  let nameInput = document.querySelector('.setNameInput')
  let nameForm = document.querySelector('.name-form')
  nameForm.addEventListener('submit', function(event) {
    event.preventDefault()
    
    const createRoomButton = document.querySelector('#createRoom')
    createRoomButton.addEventListener('click', createRoom)
    ///send to server
    socket.emit('new-user', nameInput.value)
    ///hide login and show room selection
    document.querySelector('.roomButtonConsole').classList.remove('nameSelectOverlay')
    document.querySelector('.name-form').classList.add('notVisible')
    document.querySelector('#logoText').classList.add('logoAfter')
  })
}
  
  
  
  // const setName = document.querySelector('#setName')
  // const nameLock = document.querySelector('#nameLock')
  // const createRoomButton = document.querySelector('#createRoom')
  
  // // get username from setName
  // nameLock.addEventListener('click', grabName)

  // // remove the set-name overlay and add an event listener to the create room button
  // function grabName() {
  //   let userName = setName.value
  //   console.log(userName)
  //   createRoomButton.addEventListener('click', createRoom)
  //   socket.emit('new-user', userName)
  //   document.querySelector('.roomButtonConsole').classList.remove('nameSelectOverlay')
  //   document.querySelector('.name-form').classList.add('notVisible')
  //   document.querySelector('#logoText').classList.add('logoAfter')
  // }



export function createRoom() {
    
  document.querySelector('.teamBoxesContainer').classList.remove('notVisible')
  document.querySelector('#roomTabSelector').classList.add('notVisible')
  socket.emit('create-room')
}




// clear the html room container of all child nodes and repopulate it with fresh data 
// by passing to generateRoom().
export function refreshRooms(roomCount) {
  let roomContainer = document.querySelector('#roomContainer')

  while(roomContainer.firstChild) {
    roomContainer.removeChild(roomContainer.lastChild)
  }
  
  if(Object.keys(roomCount).length > 0) {
    Object.entries(roomCount).forEach(room => {
      if(room[1] && room[0] !== `undefined`){
        generateRoom(room)
      }
    })
  }
}

export function generateRoom(roomData) {
  // make a div that will hold two p tags
  
  const room = document.createElement('div')
  room.classList.add('teamButton', 'room-button')
  const roomTitleText = document.createElement('p')
  roomTitleText.textContent = roomData[0]
  const numOfPlayersText = document.createElement('p')
  // numOfPlayersText should be dynamically updated
  numOfPlayersText.textContent = `${roomData[1]} / 4`
  // place children in the room div
  room.appendChild(roomTitleText)
  room.appendChild(numOfPlayersText)
  if(roomData[1] < 4) {   
    room.addEventListener('click', joinRoom)
  }
  
  // place the div on the page
  document.querySelector('#roomContainer').appendChild(room)

  function joinRoom () {
    document.querySelector('.teamBoxesContainer').classList.remove('notVisible')
    document.querySelector('#roomTabSelector').classList.add('notVisible')
    socket.emit('join-room', roomData[0])
  }
  
}


export function leaveRoom() {
  document.querySelector('.teamBoxesContainer').classList.add('notVisible')
  document.querySelector('#roomTabSelector').classList.remove('notVisible')
  socket.emit('leave-room')
}




