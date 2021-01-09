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
export const orderUpButton = document.querySelector('#orderUpButton')
export const passButton = document.querySelector('#passButton')


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


// move on to switch statement for names - dependings on 

// todo - a dealer chip div that rotates over the middle area, may have to change in length for sides on mobile








