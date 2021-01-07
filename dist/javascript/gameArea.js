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


export function paintTeamIcons(goodOrEvil) {
  
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

  
  
  if(goodOrEvil == 'good'){
    localPlayerSlot.appendChild(goodImage)
    partnerSlot.appendChild(goodImage)
    enemyOneSlot.appendChild(evilImage)
    enemyTwoSlot.appendChild(evilImage)
  } else {
    localPlayerSlot.appendChild(evilImage)
    partnerSlot.appendChild(evilImage)
    enemyOneSlot.appendChild(goodImage)
    enemyTwoSlot.appendChild(goodImage)
  }
}











