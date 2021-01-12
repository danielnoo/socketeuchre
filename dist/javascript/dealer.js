// this file contains the code used when client is ordered up as the dealer
import {socket, passButton, orderUpButton} from './script.js';

// the function that runs if the 
export function passiveDealerPickUp() {
  
  passButton.classList.remove('notVisible')
  orderUpButton.innerHTML = 'Keep/Discard'
  orderUpButton.classList.remove('notVisible')
  
  // dealer turns over card and starts the suit-making round
  passButton.addEventListener('click', () => {
    socket.emit('start-make-suit-round')
    passButton.classList.add('notVisible')
    orderUpButton.classList.add('notVisible')
  }, {once: true})
  
  // dealer keeps the turned up card
  orderUpButton.addEventListener('click', () => {
    // give option to discard each card in hand, automatically swap in kittycard
    passButton.classList.add('notVisible')
    orderUpButton.classList.add('notVisible')
    forceOrderUp() // re-use the same code
  }, {once: true})
}

export function forceOrderUp() {
  // discard a card and automatically receive the turned up trump card - replace turned up trump card with a white card showing the trump suit

  //building a function here to turn all cards in hand into an array -- move this to separate function
  // use stringsplit(" ") and maybe flatmap?
  let playerHand = document.querySelectorAll('.playerHand') // remove card class on kitty 
  console.log(playerHand[0].dataset.value.split(" "))

  playerHand.forEach(card => {
    let overLay = document.createElement('div')
    overLay.classList.add('chooseDiscard')
    overLay.innerHTML = "Discard"
    card.appendChild(overLay)
    
  })

}
export function turnOverTrumpCard() {
  let topCard = document.getElementById('turnedUpTrump')
    topCard.classList.remove('card', 'red')
    topCard.classList.add('turnedCard')
    topCard.removeAttribute('data-value')
    topCard.innerHTML = ""
}

export function checkHost(users) {
  // check if current user is dealer/host
  
  let host = users.filter(user => user['host'])

  if(host[0]['id'] == socket.id) {
    return true
  }

}

// maybe another function - one for when taking the orderupoffer in turn
// another for when ordered up by force of another player