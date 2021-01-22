export const socket = io()


import {localPlayer, localPartner, enemyOne, enemyTwo, kittypile, localPlayerSlot, partnerSlot, enemyOneSlot, enemyTwoSlot, paintTeamIconsAndNames, setDealerAndTurnIndicators, playerSeatOrder, actionMenuIn, actionMenuOut} from './gameArea.js';
import {passiveDealerPickUp, checkHost, turnOverTrumpCard, forceOrderUp, setTrumpNotifier, checkIfValidTrump} from './dealer.js'
import { playingCard, showPlayedCard } from './playCard.js';
import { removeLonePartner } from './removeLonePartner.js';

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
export const passButton = document.querySelector('#passButton')
export const orderUpButton = document.querySelector('#orderUpButton')
export const aloneButton = document.querySelector('#aloneToggle')
export const goingAloneSwitch = document.querySelector('.goingAloneSwitch')









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
    card.suit === "♥" || card.suit === "♦" ? printCard.classList.add("playerHand", "card", "red") : printCard.classList.add("playerHand", "card", "black")
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
  printCard.id = "turnedUpTrump"
  kittypile.appendChild(printCard)
   
  
})



socket.on('seat-at-table', (users) => {
  console.log(users)
  const usersArray = users
  
  // dynammically add good/evil team images and usernames to the player card slots - function imported from gameArea.js
  
  paintTeamIconsAndNames(usersArray)

  // also set the dealer indicator

  setDealerAndTurnIndicators(usersArray)
  
})

// after every move, all players have to render a rotation of the turn indicator, the dealer indicator moves once per round. these are also set initially in the 'seat-at-table' call above
socket.on('adjust-indicators', (users) => {
  setDealerAndTurnIndicators(users)
})


// sent to one client at a time from the server, the client passes along the user list as well as their own position at the table (0-3) 
socket.on('offerOrderUp', (users) => {
  
  // if host then present the option to keep card or pass and initiate the make trump phase
  
  if(checkHost(users)){
    passiveDealerPickUp()
    return
  }
  
  let localClientSeatPosition = users.findIndex(user => user.id === socket.id)
  
  passButton.classList.remove('notVisible')
  aloneButton.classList.remove('notVisible')
  orderUpButton.classList.remove('notVisible')
  actionMenuIn()
  
  orderUpButton.addEventListener('click', () => {
    
    socket.emit('ordered-up-dealer', users, localClientSeatPosition, goingAloneSwitch.checked)
    
    actionMenuOut()
    setTimeout(function(){
      passButton.classList.add('notVisible')
      aloneButton.classList.add('notVisible')
      orderUpButton.classList.add('notVisible')
      
    }, 800)
    
  }, {once: true})
  passButton.addEventListener('click', () => {
    socket.emit('decline-order-up', users, localClientSeatPosition)
    
    actionMenuOut()
    setTimeout(function(){
      passButton.classList.add('notVisible')
      aloneButton.classList.add('notVisible')
      orderUpButton.classList.add('notVisible')
      
    }, 800)
  }, {once: true})
})

socket.on('forced-order-up', (notPlayingId) => {
  forceOrderUp(notPlayingId)
  // choose a card to discard
  // drag turned up card over to the slot
  console.log('successfully ordered up')
})


// players are given the option to make a suit or pass to the next player
// this starts left of the dealer. if the option cycles back around to the dealer
// they have to make a suit
socket.on('make-suit-proposal', (userList, initialKitty) => {
  const makeSuit = document.querySelector('#makeSuitContainer')
  makeSuit.classList.remove('notVisible')
  aloneButton.classList.remove('notVisible')
  const suitButtons = document.querySelectorAll('.selectSuit')
  const validSuitChoices = checkIfValidTrump(initialKitty)
  
     
  actionMenuIn()
  suitButtons.forEach(suit => {
    
    if(validSuitChoices.includes(suit.innerText)) {
    
      suit.addEventListener('click', () => {
        socket.emit('make-suit-begin-round', suit.innerHTML, socket.id, goingAloneSwitch.checked)
        
        actionMenuOut()
        setTimeout(function(){
          passButton.classList.add('notVisible')
          makeSuit.classList.add('notVisible')
          aloneButton.classList.add('notVisible')
        }, 2000)
      })
    }
  })

 
  // stick it to the dealer if dealer
  if(checkHost(userList)) {
    return
  }
  // offer pass button if not
  passButton.classList.remove('notVisible')
  passButton.addEventListener('click', () => {
    socket.emit('decline-make-suit', socket.id)
    passButton.classList.add('notVisible')
    makeSuit.classList.add('notVisible')
    aloneButton.classList.add('notVisible')
    actionMenuOut()
    setTimeout(function(){
      passButton.classList.add('notVisible')
      makeSuit.classList.add('notVisible')
    }, 800)
  }, {once: true})

})

// visual function to give the trump card the appearance of being flipped over
socket.on('turn-over-trump-card', () => {
  turnOverTrumpCard()
})

// if the dealer has been ordered up, change the exposed card to just the suit to display trump for all players
socket.on('set-kitty-to-trump', (trump) => {
  let kittyCard = document.querySelector('#turnedUpTrump')
  kittyCard.innerText = trump
  kittyCard.dataset.value = "TRUMP"
})

// same as above except this is only called in the more passive rounds when the kitty card is turned over and a suit is made through player selection
socket.on('make-suit-set-kitty', (trump) => {
  setTrumpNotifier(trump)
})



// set the dealer's cards to invisible, maybe his little face too
socket.on('remove-lone-partner', (gameStats) => {
 
 // calls function from removeLonePartner.js
 removeLonePartner(gameStats)
})

socket.on('play-a-card', (gameStats, userList) => {
  let localClientSeatPosition = userList.findIndex(user => user.id === socket.id)
  if(localClientSeatPosition !== gameStats.notPlayingIndex){
  playingCard(gameStats)
  } else {
    socket.emit('skip-my-turn', socket.id, gameStats)
  }
})

socket.on('show-played-card', (userList, currentUser, dataset, gameStats) => {
  showPlayedCard(userList, currentUser, dataset, gameStats)
})

socket.on('clear-table-set-score', (gameStats) => {
  document.getElementById('goodScore').innerText = `${gameStats.goodScore[0]} - ${gameStats.goodScore[1]} - ${gameStats.goodScore[2]}`
  document.getElementById('evilScore').innerText = `${gameStats.evilScore[0]} - ${gameStats.evilScore[1]} - ${gameStats.evilScore[2]}`

  let cardsToClear = document.querySelectorAll('.hiddenCardSlot')
  cardsToClear.forEach(card => {
    card.removeChild(card.childNodes[0])
  })
})

socket.on('deal-button', () => {
  //create a button to press that sends and emit that tells server to deal the cards again
  let dealButton = document.querySelector('.dealButton')
  dealButton.classList.remove('notVisible')
  dealButton.addEventListener('click', () => {
    socket.emit('start-game')
    dealButton.classList.add('notVisible')
    actionMenuOut()
  }, {once: true})
  actionMenuIn()
  console.log('press the deal button')
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


