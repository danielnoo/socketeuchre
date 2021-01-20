
import {localPlayerSlot, partnerSlot, enemyOneSlot, enemyTwoSlot, playerSeatOrder} from './gameArea.js';
import { socket } from './script.js';


//// somehow retool this so that it can be used for every card played
// maybe check how many playableCards are on the table with a query for 'played playableCards'
export function playingCard(gameStats) {


  let alreadyPlayedCards = document.querySelectorAll('.playedCard')
  let playableCards = []
  if(gameStats.currentRoundLeadSuit){
   playableCards = followSuit(gameStats)
  } else {
  playableCards = document.querySelectorAll('.playerHand')
  }
  const dragSlot = document.querySelector('.slotTwo')
  playableCards.forEach((card, index) => {
    card.classList.add('playableCard')
    card.setAttribute('draggable', 'true')
    card.id = `card${index}`
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
    
  })
  dragSlot.addEventListener('dragover', dragOver);
  dragSlot.addEventListener('dragenter', dragEnter);
  dragSlot.addEventListener('dragleave', dragLeave);
  dragSlot.addEventListener('drop', dragDrop);


  let dragged

  function dragStart(event) {
    this.className += ' hold';
    // setTimeout(() => (this.className = 'invisible'), 0);
    dragSlot.classList.add('dragZone')
    dragSlot.classList.remove('notVisible')
    dragged = event.target
  }
  
  function dragEnd() {
    
    this.classList.remove('hold')
  }
  
  function dragOver(event) {
    event.preventDefault();
  }
  
  function dragEnter(event) {
    event.preventDefault();
    this.className += ' hovered';
  }
  
  function dragLeave(event) {
    console.log('drag leave')
   // if ( event.target.className == 'dragSlot' ) {
    //  event.target.style.background = ""; }
  }
  
  function dragDrop(event) {
    
    event.preventDefault()

    if(event.target.classList.contains('slotTwo')) {
      dragged.parentNode.removeChild( dragged );
      event.target.appendChild( dragged );
    }
    dragged.classList.remove('playableCard', 'playerHand')
    dragged.classList.add('playedCard')
    let otherCards = document.querySelectorAll('.playableCard')
    otherCards.forEach(card => {
      card.classList.remove('playableCard')
      card.setAttribute('draggable', 'false')
      card.removeEventListener('dragstart', dragStart)
      card.removeEventListener('dragend', dragEnd)
    })
    dragSlot.classList.remove('dragZone')
    dragged.dataset.value
    console.log(alreadyPlayedCards.length)
    if(alreadyPlayedCards.length == 0){
      gameStats.currentRoundLeadSuit = dragged.innerText
    }
    gameStats.currentRoundCards.push([socket.id, dragged.dataset.value])
    console.log(gameStats.currentRoundMaker)
    
    socket.emit('submit-played-card', dragged.dataset.value, socket.id, gameStats)
  }


}

export function showPlayedCard(userList, playerId, card){
  
  if(playerId === socket.id) {
    return
  }

  let playedCardIndex = userList.findIndex(user => user.id === playerId)

  const showCard = document.createElement('div')
  showCard.setAttribute("data-value", card)
  showCard.innerText = card[card.length - 1]
  showCard.innerText === "♥" || showCard.innerText === "♦" ? showCard.classList.add("playedCard", "card", "red") : showCard.classList.add("playedCard", "card", "black")

  playerSeatOrder[playedCardIndex].classList.remove('notVisible')
  playerSeatOrder[playedCardIndex].append(showCard)

}


// this function checks the suit that is lead and makes sure that the player can 
// only play cards of that suit or bauers of the same colour
// it returns either the those cards that follow suit or the user's whole hand
// if they are unsuited

function followSuit(gameStats){
  
  let allCards = document.querySelectorAll('.playerHand')
  let haveSuitPlayableCards = []
  let haveSuit = false
  
  if(gameStats.currentRoundLeadSuit == "♥") {
    allCards.forEach(card => {
      let trump = gameStats.currentRoundTrump
      let data = card.dataset.value
      if(data[2] == "♥" || data[3] == "♥" || (data == "J ♦" && trump == "♥")) {
        haveSuitPlayableCards.push(card)
        haveSuit = true
      } 
      //////////pick up here check for trump
    })
  } else if(gameStats.currentRoundLeadSuit == "♦") {
    allCards.forEach(card => {
      let trump = gameStats.currentRoundTrump
      let data = card.dataset.value
      if(data[2] == "♦" || data[3] == "♦" || (data == "J ♥" && trump == "♦")) {
        haveSuitPlayableCards.push(card)
        haveSuit = true
      }
    })
  } else if(gameStats.currentRoundLeadSuit == "♣") {
    allCards.forEach(card => {
      let trump = gameStats.currentRoundTrump
      let data = card.dataset.value
      if(data[2] == "♣" || data[3] == "♣" || (data == "J ♠" && trump == "♣")) {
        haveSuitPlayableCards.push(card)
        haveSuit = true
      }
    })
  } else {
    allCards.forEach(card => {
      let trump = gameStats.currentRoundTrump
      let data = card.dataset.value
      if(data[2] == "♠" || data[3] == "♠" || (data == "J ♣" && trump == "♠")) {
        haveSuitPlayableCards.push(card)
        haveSuit = true
      }
    })

  }
  

  if(haveSuit){
    return haveSuitPlayableCards
  } else {
    return allCards
  }

}

