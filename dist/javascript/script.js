export const socket = io()

import {localPlayer, localPartner, enemyOne, enemyTwo, kittypile, localPlayerSlot, partnerSlot, enemyOneSlot, enemyTwoSlot, paintTeamIconsAndNames, orderUpButton, passButton, checkHost} from './gameArea.js';

const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')




//buttons
const goodTeam = document.querySelector('#good')
const evilTeam = document.querySelector('#evil')
const joinGoodButton = document.querySelector('#joinGood')
const joinEvilButton = document.querySelector('#joinEvil')
const spectateButton = document.querySelector('#spectateButton')
const startGameButton = document.querySelector('#start-game')
const chatTab = document.querySelector('#chatTab')
const playTab = document.querySelector('#playTab')
const teamTab = document.querySelector('#teamTab')









const userName = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', userName)




socket.on('chat-message', data => {
  console.log(data)
  appendMessage(`${data.userName}: ${data.message}`)
})

// update player list and team they're on --clear each div and repopulate with foreach 
socket.on('player-list', userList => {
    while(goodTeam.firstChild) {
      goodTeam.firstChild.remove()
    }
    while(evilTeam.firstChild) {
      evilTeam.firstChild.remove()
    }
    
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
  
  if(data !== null){
  appendMessage(`${data.username} disconnected`)
  }
})

socket.on('bestow-host-priveleges', () => {
  startGameButton.classList.remove('notVisible')
  toggleStartGameButton()
}) 

socket.on('teams-full', () => {
  toggleStartGameButton()
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

// switching tabs in mobile view

chatTab.addEventListener('click', () => {
  document.querySelector('.currentTab').classList.remove('currentTab')
  document.querySelector('.chatbox').classList.add('currentTab')
  document.querySelector('.visibleTab').classList.remove('visibleTab')
  chatTab.classList.add('visibleTab')
})

playTab.addEventListener('click', () => {
  document.querySelector('.currentTab').classList.remove('currentTab')
  document.querySelector('.play-area').classList.add('currentTab')
  document.querySelector('.visibleTab').classList.remove('visibleTab')
  playTab.classList.add('visibleTab')
})

teamTab.addEventListener('click', () => {
  document.querySelector('.currentTab').classList.remove('currentTab')
  document.querySelector('.teamContainer').classList.add('currentTab')  
  document.querySelector('.visibleTab').classList.remove('visibleTab')
  teamTab.classList.add('visibleTab')
})




/// card game

startGameButton.addEventListener('click', () => {
  socket.emit('start-game')
  toggleStartGameButton()
})



socket.on('player-hand', cards => {
  console.log(cards)
  
  cards.forEach(card => {
    const printCard = document.createElement("div")
    printCard.innerText = card.suit
    card.suit === "♥" || card.suit === "♦" ? printCard.classList.add("card", "red") : printCard.classList.add("card", "black")
    printCard.dataset.value = `${card.value} ${card.suit}`
    localPlayer.appendChild(printCard)
  })
})

// change kitty pile to only show the top card (position 3)
// now only sending the data for the 4th (top) card...if it turns out 
// that certain odd rules are applied later then the other three kitty cards 
// will have to be sent along as well


socket.on('kitty-pile', card => {
  document.querySelector('.teamContainer').classList.add('notVisible')
  const printCard = document.createElement("div")
  
  printCard.innerText = card.suit
  card.suit === "♥" || card.suit === "♦" ? printCard.classList.add("card", "red", "kittyCard") : printCard.classList.add("card", "black", "kittyCard")
  printCard.dataset.value = `${card.value} ${card.suit}`
  kittypile.appendChild(printCard)
   
  
})






socket.on('seat-at-table', (users) => {
  
  const usersArray = users
  
  // dynammically add good/evil team images and usernames to the player card slots - function imported from gameArea.js
  
  paintTeamIconsAndNames(usersArray)
  
})

// sent to one client at a time from the server, the client passes along the user list as well as their own position at the table (0-3) 
socket.on('offerOrderUp', (users) => {
  /// code in gameArea.js line 84ish --> have to break here to implement the ability to keep/exchange card
  checkHost(users)
  
  let localClientSeatPosition = users.findIndex(user => user.id === socket.id)
  
  orderUpButton.classList.remove('notVisible')
  passButton.classList.remove('notVisible')
  
  orderUpButton.addEventListener('click', () => {
    socket.emit('ordered-up-dealer', users, localClientSeatPosition)
    orderUpButton.classList.add('notVisible')
    passButton.classList.add('notVisible')
  })
  passButton.addEventListener('click', () => {
    socket.emit('decline-order-up', users, localClientSeatPosition)
    orderUpButton.classList.add('notVisible')
    passButton.classList.add('notVisible')
  })
})

socket.on('ordered-up', () => {
  console.log('successfully ordered up')
})







function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.prepend(messageElement)
}

// maybe implement a ready button to keep this from being toggled multiple times 

function toggleStartGameButton() {
  if(startGameButton.disabled == true){
    startGameButton.disabled = false
  } else {
    startGameButton.disabled = true
  }
}

