// this file contains the code used when client is ordered up as the dealer
import {socket, passButton, orderUpButton} from './script.js';
import {localPlayer} from './gameArea.js';

// the function that runs if the 
export function passiveDealerPickUp() {
  
  passButton.classList.remove('notVisible')
  orderUpButton.innerHTML = 'Keep/Discard'
  orderUpButton.classList.remove('notVisible')
  
  // dealer turns over card and starts the suit-making round
  passButton.addEventListener('click', () => {
    socket.emit('start-make-suit-cycle')
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

export function forceOrderUp(goingAlone) {
  // discard a card and automatically receive the turned up trump card - replace turned up trump card with a white card showing the trump suit
  if(goingAlone){
    toggleGrayScale(localPlayer)  //move to 'begin-round'
    let kittyCard = document.querySelector('#turnedUpTrump')
    kittyCard.dataset.value = "TRUMP"
    socket.emit('begin-round', kittyCard.innerText)
    return
  }
  //building a function here to turn all cards in hand into an array -- move this to separate function
  // use stringsplit(" ") and maybe flatmap?
  let playerHand = document.querySelectorAll('.playerHand') // remove card class on kitty 
  console.log(playerHand[0].dataset.value.split(" "))

  playerHand.forEach(card => {
    let overLay = document.createElement('div')
    let overLayText = document.createElement('p')
    overLay.classList.add('chooseDiscard')
    overLayText.classList.add('overLayText')
    overLayText.innerHTML = "Discard"
    overLay.appendChild(overLayText)
    card.appendChild(overLay)
    
  })


  let discardOptions = document.querySelectorAll('.chooseDiscard')

  discardOptions.forEach(card => {
    card.addEventListener('click', () => {
      // remove all choose discard elements 
      // delete the chosen card
      // create a new card using the dataset from the kitty card
      // replace kitty card with a blank card of the trump suit
      // have it say 'trump' in the pseudo classes - use card class but change to different name and use different pseudos
      
      // take the card from the pile and add it to your hand
      // delete the clicked item

      

      let pickUpCard = document.createElement('div')
      let kittyCard = document.querySelector('#turnedUpTrump')
      
      pickUpCard.setAttribute("data-value", kittyCard.dataset.value)
      pickUpCard.innerText = kittyCard.innerText
      pickUpCard.innerText === "♥" || pickUpCard.innerText === "♦" ? pickUpCard.classList.add("playerHand", "card", "red") : pickUpCard.classList.add("card", "black", "playerHand")
      
      localPlayer.appendChild(pickUpCard)

      kittyCard.dataset.value = "TRUMP"
      
      card.parentNode.parentNode.removeChild(card.parentNode)

      discardOptions.forEach(card => {
        card.parentNode.removeChild(card)
      })
      socket.emit('begin-round', kittyCard.innerText)
    })
  })
  

}

// might need to add black - have to undo this at the start of the playing round
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

export function toggleGrayScale(element) {
  element.classList.toggle('addGrayScale') // change to display none, gray not working on black - maybe visibility: hidden better
}
// maybe another function - one for when taking the orderupoffer in turn
// another for when ordered up by force of another player

export function setTrumpNotifier(trump) {
  kittypile.removeChild(kittypile.lastElementChild)
  let trumpNotifier = document.createElement('div')
  trump === "♥" || trump === "♦" ? trumpNotifier.classList.add('card', 'red', 'kittyCard') : trumpNotifier.classList.add('card', 'black', 'kittyCard')
  trumpNotifier.innerText = trump
  trumpNotifier.dataset.value = "TRUMP"
  kittypile.appendChild(trumpNotifier)
}