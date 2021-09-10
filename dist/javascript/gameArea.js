import {socket} from './script.js';


export const localPlayer = document.querySelector('#local-player')
export const localPartner = document.querySelector('#player-partner')
export const enemyOne = document.querySelector('#enemy-one')
export const enemyTwo = document.querySelector('#enemy-two')
export const playerHandsArray = [localPartner, enemyOne, localPlayer, enemyTwo]
export const localPlayerSlot = document.querySelector('#localPlayerSlot')
export const partnerSlot = document.querySelector('#partnerSlot')
export const enemyOneSlot = document.querySelector('#enemyOneSlot')
export const enemyTwoSlot = document.querySelector('#enemyTwoSlot')

export const kittypile = document.querySelector('#kittypile')

export const actionButtonContainer = document.querySelector('.actionButtonContainer')
export const aloneButton = document.querySelector('#aloneToggle')



export let playerSeatOrder = []

export function paintTeamIconsAndNames(users) {
  

  let localClientSeatPosition = users.findIndex(user => user.id === socket.id)
  console.log(localClientSeatPosition)

  const goodImageOne = document.createElement("img")
  goodImageOne.setAttribute("src", "/images/angel2.svg")
  goodImageOne.setAttribute("alt", "an angel")
  
  const evilImageOne = document.createElement("img")
  evilImageOne.setAttribute("src", "/images/devil2.svg") 
  evilImageOne.setAttribute("alt", "a devil")

  const goodImageTwo = document.createElement("img")
  goodImageTwo.setAttribute("src", "/images/angel2.svg")
  goodImageTwo.setAttribute("alt", "an angel")
  
  const evilImageTwo = document.createElement("img")
  evilImageTwo.setAttribute("src", "/images/devil2.svg") 
  evilImageTwo.setAttribute("alt", "a devil")

  
  
  if(users[localClientSeatPosition]['team'] == 'good'){
    localPlayerSlot.appendChild(goodImageOne)
    partnerSlot.appendChild(goodImageTwo)
    enemyOneSlot.appendChild(evilImageOne)
    enemyTwoSlot.appendChild(evilImageTwo)
  } else {
    localPlayerSlot.appendChild(evilImageOne)
    partnerSlot.appendChild(evilImageTwo)
    enemyOneSlot.appendChild(goodImageOne)
    enemyTwoSlot.appendChild(goodImageTwo)
  }

  // placing userNames in the correct places
  // used a slightly different system for the actual container that
  // cards are played into
  switch(localClientSeatPosition) {
    case 0:
      localPlayerSlot.innerHTML += users[0].userName
      enemyTwoSlot.innerHTML += users[1].userName
      partnerSlot.innerHTML += users[2].userName
      enemyOneSlot.innerHTML += users[3].userName
      // for the cards played by the corresponding player
      playerSeatOrder[0] = document.querySelector('.slotTwo')
      playerSeatOrder[1] = document.querySelector('.slotThree')
      playerSeatOrder[2] = document.querySelector('.slotZero')
      playerSeatOrder[3] = document.querySelector('.slotOne')
      // the div representing the other player's cards in hand
      playerHandsArray[0] = localPlayer
      playerHandsArray[1] = enemyTwo
      playerHandsArray[2] = localPartner
      playerHandsArray[3] = enemyOne
    break;
    case 1:
      localPlayerSlot.innerHTML += users[1].userName
      enemyTwoSlot.innerHTML += users[2].userName
      partnerSlot.innerHTML += users[3].userName
      enemyOneSlot.innerHTML += users[0].userName
      playerSeatOrder[0] = document.querySelector('.slotOne')
      playerSeatOrder[1] = document.querySelector('.slotTwo')
      playerSeatOrder[2] = document.querySelector('.slotThree')
      playerSeatOrder[3] = document.querySelector('.slotZero')
      playerHandsArray[0] = enemyOne
      playerHandsArray[1] = localPlayer
      playerHandsArray[2] = enemyTwo
      playerHandsArray[3] = localPartner
    break;
    case 2:
      localPlayerSlot.innerHTML += users[2].userName
      enemyTwoSlot.innerHTML += users[3].userName
      partnerSlot.innerHTML += users[0].userName
      enemyOneSlot.innerHTML += users[1].userName
      playerSeatOrder[0] = document.querySelector('.slotZero')
      playerSeatOrder[1] = document.querySelector('.slotOne')
      playerSeatOrder[2] = document.querySelector('.slotTwo')
      playerSeatOrder[3] = document.querySelector('.slotThree')
      playerHandsArray[0] = localPartner
      playerHandsArray[1] = enemyOne
      playerHandsArray[2] = localPlayer
      playerHandsArray[3] = enemyTwo

    break;
    case 3:
      localPlayerSlot.innerHTML += users[3].userName
      enemyTwoSlot.innerHTML += users[0].userName
      partnerSlot.innerHTML += users[1].userName
      enemyOneSlot.innerHTML += users[2].userName
      playerSeatOrder[0] = document.querySelector('.slotThree')
      playerSeatOrder[1] = document.querySelector('.slotZero')
      playerSeatOrder[2] = document.querySelector('.slotOne')
      playerSeatOrder[3] = document.querySelector('.slotTwo')
      playerHandsArray[0] = enemyTwo
      playerHandsArray[1] = localPartner
      playerHandsArray[2] = enemyOne
      playerHandsArray[3] = localPlayer

  }
}



// rotate the dealer indicator to the correct position depending on the seat position (0-3) of
// the host
export function setDealerAndTurnIndicators(users) {
  const hostSeat = users.findIndex(user => user['host'] === true)
  const currentTurnSeatPosition = users.findIndex(user => user['turn'] === true)
  
  const localClientSeatPosition = users.findIndex(user => user['id'] === socket.id)

  const dealerPointer = document.querySelector('.dealerPointerContainer')
  const currentTurnPointer = document.querySelector('.currentPointerContainer')

  // in order to keep the dealer pointer moving to the right spot for each of the 4 players,
  // i had to make an array that holds the values of how much to rotate the dealer pointer element. It is a little bit confusing but the element in the outer array corresponds to the players at the table and the inner array is the value that the dealer pointer must be rotated in order to properly display the location of the host.

  const seatRotationArray = [
    [ 'rotate(630deg)', 'rotate(360deg)', 'rotate(450deg)', 'rotate(540deg)' ],
    [ 'rotate(540deg)', 'rotate(630deg)', 'rotate(360deg)', 'rotate(450deg)' ],
    [ 'rotate(450deg)', 'rotate(540deg)', 'rotate(630deg)', 'rotate(360deg)' ],
    [ 'rotate(360deg)', 'rotate(450deg)', 'rotate(540deg)', 'rotate(630deg)' ]
  ]
  
    
  dealerPointer.style.transform = seatRotationArray[localClientSeatPosition][hostSeat]
  currentTurnPointer.style.transform = seatRotationArray[localClientSeatPosition][currentTurnSeatPosition]
  
}

export function actionMenuIn() {
  
  
  actionButtonContainer.classList.remove('notVisible')
  setTimeout(delayedEntry, 400)

  function delayedEntry() {
    actionButtonContainer.classList.add('flip-in-ver-left')
  }
}

export function actionMenuOut() {
  actionButtonContainer.classList.remove('flip-in-ver-left')
  actionButtonContainer.classList.add('slide-out-elliptic-left-bck')
   setTimeout(hideActionMenu, 800)

  function hideActionMenu() {
    actionButtonContainer.classList.remove('slide-out-elliptic-left-bck')
    actionButtonContainer.classList.add('notVisible')
      // let buttons = document.querySelectorAll('.actionButton')
      // buttons.forEach(button => {
      //   button.classList.toggle('.notVisible')
      // })
  }
}












