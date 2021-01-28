import { localPlayer, localPartner, enemyOne, enemyTwo, playerHandsArray } from "./gameArea.js";
import { socket } from "./script.js";

export function removeLonePartner(gameStats, userList) {
  // the playerHandsArray is organized in gameArea.js by a switch function during the 'seat-at-table' socket emit
  
  console.log(userList)
  playerHandsArray[gameStats.notPlayingIndex].classList.add('notVisible')
  if(userList[gameStats.notPlayingIndex]['id'] == socket.id){
    clearOwnCards()
  }

  function clearOwnCards() {
    while(localPlayer.firstChild) {
      localPlayer.removeChild(localPlayer.firstChild)
    }
  }
}

// not in use yet - call at end of round/beginning of next

export function reAddFourthPlayer(gameStats) {
  playerHandsArray[gameStats.notPlayingIndex].classList.remove('notVisible')
}