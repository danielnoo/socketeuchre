const socket = io()
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

// player card trays

const localPlayer = document.querySelector('#position-two')
const localPartner = document.querySelector('#position-zero')
const enemyOne = document.querySelector('#position-three')
const enemyTwo = document.querySelector('#position-four')

const kittypile = document.querySelector('#kittypile')




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
  startGameButton.classList.remove('notvisible')
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

socket.on('kitty-pile', card => {
  console.log(card)
  const printCard = document.createElement("div")
  
  printCard.innerText = card.suit
  card.suit === "♥" || card.suit === "♦" ? printCard.classList.add("card", "red") : printCard.classList.add("card", "black")
  printCard.dataset.value = `${card.value} ${card.suit}`
  kittypile.appendChild(printCard)
   
  
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

