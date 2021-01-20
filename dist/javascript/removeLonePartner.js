import { localPlayer, localPartner, enemyOne, enemyTwo, playerHandsArray } from "./gameArea.js";

export function removeLonePartner(gameStats) {
  // the playerHandsArray is organized in gameArea.js by a switch function during the 'seat-at-table' socket emit
  playerHandsArray[gameStats.notPlayingIndex].classList.add('notVisible')

}

// not in use yet - call at end of round/beginning of next

export function reAddFourthPlayer(playerIndex) {
  playerHandsArray[playerIndex].classList.remove('notVisible')
}