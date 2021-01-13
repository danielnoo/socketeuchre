import {socket} from './script.js';


export const localPlayer = document.querySelector('#local-player')
export const localPartner = document.querySelector('#player-partner')
export const enemyOne = document.querySelector('#enemy-one')
export const enemyTwo = document.querySelector('#enemy-two')

export const localPlayerSlot = document.querySelector('#localPlayerSlot')
export const partnerSlot = document.querySelector('#partnerSlot')
export const enemyOneSlot = document.querySelector('#enemyOneSlot')
export const enemyTwoSlot = document.querySelector('#enemyTwoSlot')

export const kittypile = document.querySelector('#kittypile')
export const kittyCard = document.querySelector('.kittyCard')




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

  switch(localClientSeatPosition) {
    case 0:
      localPlayerSlot.innerHTML += users[0].username
      enemyTwoSlot.innerHTML += users[3].username
      partnerSlot.innerHTML += users[2].username
      enemyOneSlot.innerHTML += users[1].username
    break;
    case 1:
      localPlayerSlot.innerHTML += users[1].username
      enemyTwoSlot.innerHTML += users[2].username
      partnerSlot.innerHTML += users[3].username
      enemyOneSlot.innerHTML += users[0].username
    break;
    case 2:
      localPlayerSlot.innerHTML += users[2].username
      enemyTwoSlot.innerHTML += users[3].username
      partnerSlot.innerHTML += users[0].username
      enemyOneSlot.innerHTML += users[1].username

    break;
    case 3:
      localPlayerSlot.innerHTML += users[3].username
      enemyTwoSlot.innerHTML += users[0].username
      partnerSlot.innerHTML += users[1].username
      enemyOneSlot.innerHTML += users[2].username

    
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
    [ 'rotate(270deg)', 'rotate(0deg)', 'rotate(90deg)', 'rotate(180deg)' ],
    [ 'rotate(180deg)', 'rotate(270deg)', 'rotate(0deg)', 'rotate(90deg)' ],
    [ 'rotate(90deg)', 'rotate(180deg)', 'rotate(270deg)', 'rotate(0deg)' ],
    [ 'rotate(0deg)', 'rotate(90deg)', 'rotate(180deg)', 'rotate(270deg)' ]
  ]
  
  
  dealerPointer.style.transform = seatRotationArray[localClientSeatPosition][hostSeat]
  currentTurnPointer.style.transform = seatRotationArray[localClientSeatPosition][currentTurnSeatPosition]
  
}












