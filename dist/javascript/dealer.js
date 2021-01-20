// this file contains the code used when client is ordered up as the dealer
import {socket, passButton, orderUpButton, aloneButton, goingAloneSwitch} from './script.js';
import {actionMenuIn, actionMenuOut, localPlayer, kittypile} from './gameArea.js';

// the function that runs if the 
export function passiveDealerPickUp() {
  aloneButton.classList.remove('notVisible')
  passButton.classList.remove('notVisible')
  const kittyCard = document.querySelector('#turnedUpTrump')
  
  // maybe bug here forcing weird suits/colours on cards
  if(canDealerPickup(kittyCard.innerText)){
  orderUpButton.innerHTML = 'Keep/Discard'
  orderUpButton.classList.remove('notVisible')
  }
  actionMenuIn()
  // dealer turns over card and starts the suit-making round
  passButton.addEventListener('click', () => {
    let kittyCard = document.querySelector('#turnedUpTrump')
    socket.emit('start-make-suit-cycle', kittyCard.innerText)
    actionMenuOut()
    setTimeout(function(){
      passButton.classList.add('notVisible')
      aloneButton.classList.add('notVisible')
      orderUpButton.classList.add('notVisible')
      
    }, 800)
    orderUpButton.innerHTML = 'ORDER UP'
    
  }, {once: true})
  
  // dealer keeps the turned up card
  orderUpButton.addEventListener('click', () => {
    // give option to discard each card in hand, automatically swap in kittycard
    actionMenuOut()
    setTimeout(function(){
      passButton.classList.add('notVisible')
      aloneButton.classList.add('notVisible')
      orderUpButton.classList.add('notVisible')
      
    }, 800)
    orderUpButton.innerHTML = 'ORDER UP'
    if(goingAloneSwitch.checked){
      socket.emit('dealer-lone-hand-pickup', socket.id)
    }
    forceOrderUp() // say whether going alone
  }, {once: true})
}

export function forceOrderUp(notPlayingId) {
 
  let kittyCard = document.querySelector('#turnedUpTrump')
  

  ///////////////////////////test this more - order up deal as P
  if(notPlayingId == socket.id){
    console.log('partner is going alone')
    kittyCard.dataset.value = "TRUMP"
    setTrumpNotifier(kittyCard.innerText) 
    socket.emit('begin-round', kittyCard.innerText)
    
    return
  }

   // discard a card and automatically receive the turned up trump card - replace turned up trump card with a white card showing the trump suit

  //building a function here to turn all cards in hand into an array -- move this to separate function
  // use stringsplit(" ") and maybe flatmap?
  
  discardOverlay()
  
  function discardOverlay() {
    let playerHand = document.querySelectorAll('.playerHand') 
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

    console.log(playerHand)
    let discardOptions = document.querySelectorAll('.chooseDiscard')
    console.log(discardOptions)
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
        
        
        pickUpCard.setAttribute("data-value", kittyCard.dataset.value)
        let dataLength = pickUpCard.dataset.value.length
        pickUpCard.innerText = pickUpCard.dataset.value[dataLength - 1]
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

// this works just dont use toggle --- should be able to export this and use it for all lone hand situations


export function toggleGrayScale(element) {
  element.classList.add('addGrayScale') // change to display none, gray not working on black - maybe visibility: hidden better
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

// the following is a function that disallows the picking up of a card by the dealer
// or the making of a suit - takes initially turned up card as argument

export function checkIfValidTrump(suit){
  let playerHand = document.querySelectorAll('.playerHand')
  let validTrumpSuits = []
  playerHand.forEach(card => {
    if(!validTrumpSuits.includes(card.innerText) && card.innerText !== suit){
      validTrumpSuits.push(card.innerText)
    }
  })
  return validTrumpSuits
}

function canDealerPickup(suit){
  let playerHand = document.querySelectorAll('.playerHand')
  let canPickUpCard = false
  playerHand.forEach(card => {
    if(card.innerText == suit){
      canPickUpCard = true
    }
  })
  return canPickUpCard
}


