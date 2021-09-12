const Deck = require('./deck');
const { valueMap } = require('./valuemap');


// filled in dynamically by room name in the tally functions

const scoreBoard = {}
  

function initializeRoomScoreboard(currentRoom) {
  scoreBoard[currentRoom] = {
    goodScore: [0, 0, 0],
    evilScore: [0, 0, 0],
    gamesPlayed: 0
    }
}


function returnScore(roomName){
  return scoreBoard[roomName] 
}

function zeroTricks(roomName){                
  scoreBoard[roomName]['goodScore'][2] = 0
  scoreBoard[roomName]['evilScore'][2] = 0
}


// keeps track of score as well as which team picked trump
const gameStats = {};



function shuffleAndDeal(users){
  const deck = new Deck()
  
  deck.shuffle()
  
  
  
  for(let i = 20; i > 0; i = i - 4){
    users.forEach(user => {
      user['cards'].push(deck.cards.pop())
    })
  }

  let kitty = deck.cards
  let deal = [users, kitty]
  
  return deal

}

// player to the left of the dealer has first option to order up the dealer
// find the index of the host and add 1 - if index is 3, go to 0 - simulates clockwise rotation around the table

function getLeftOfHost(playerList) {
  const hostIndex = playerList.map(user => user['host']).indexOf(true)
  if(hostIndex !== 3){
    return hostIndex + 1
  } else {
    return 0
  }
}


////////////////////////////////////////////////////////////////////////////////
////////////////// still needs refactor
function setNotPlaying(gameStats, usersInGame, localClientSeatPosition){
  const aloneTeam = usersInGame.filter(user => user['team'] == gameStats.currentRoundMaker)
  const isNotPlaying = aloneTeam.filter(user => user['id'] !== usersInGame[localClientSeatPosition]['id'])
  
  gameStats.notPlayingIndex = usersInGame.findIndex(user => user['id'] == isNotPlaying[0]['id'])
  return isNotPlaying[0]['id']
}

function tallyTrickScore(userList) {
    const currentRoom = userList[0].roomName
    
    // initialize a scoreboard for room if it hasn't been created yet
    if(!scoreBoard[currentRoom]) {
      scoreBoard[currentRoom] = {
      goodScore: [0, 0, 0],
      evilScore: [0, 0, 0],
      gamesPlayed: 0
      }
    }
    
    let values = valueMap(gameStats[currentRoom].currentRoundLeadSuit, gameStats[currentRoom].currentRoundTrump)
    
    // convert the valuemap to the dataset.value format used in the cards
    values.forEach(arr => {
      arr.forEach((arr2, index) => {
        arr2[1] = arr2[1] + ' ' + arr2[0]; arr2.shift()  
       })    
    })
    

    // loop through the cards that have been played and cross reference the valuemap, pushing the score of each card onto card array

    gameStats[currentRoom].currentRoundCards.forEach((playedCard, index) => {
      for(let suit = 0; suit < 4; suit++){
        for(let card = 0; card < 6; card++){
        if(values[suit][card][0] == gameStats[currentRoom].currentRoundCards[index][1]){
          playedCard.push(values[suit][card][1])
        }
       }
      }})
    
    console.log(gameStats[currentRoom].currentRoundCards)

    // return the index of the highest scoring card

    const hiScoreIndex = gameStats[currentRoom].currentRoundCards.map(card => card[2]).reduce((highestSoFar, currentValue, currentIndex, array) => currentValue > array[highestSoFar] ? currentIndex : highestSoFar, 0)

    

    // find the team of the high score
    
    const winningPlayerIndex = userList.map(user => user['id'] == gameStats[currentRoom].currentRoundCards[hiScoreIndex][0]).indexOf(true)

    
      // assign the won trick in gameStats
      // not sure if need parentheses on method

    if(userList[winningPlayerIndex]['team'] == 'good') {
      scoreBoard[currentRoom].goodScore[2]++
    } else {
      scoreBoard[currentRoom].evilScore[2]++
    }

    // some setup for next round

    gameStats[currentRoom].lastWinnerIndex = winningPlayerIndex
    gameStats[currentRoom].currentRoundCards = []
    gameStats[currentRoom].currentRoundLeadSuit = undefined
    gameStats[currentRoom].roundCounter++

    return 
}

 
function tallyRoundScore(userList){
  const currentRoom = userList[0].roomName
  if(gameStats[currentRoom].currentRoundMaker == 'good') {
    goodMaker()
  } else {
    evilMaker()
  }
    
  
  function goodMaker(){
      if(scoreBoard[currentRoom]['goodScore'][2] == 5){
          scoreBoard[currentRoom]['goodScore'][1] += 2
        if(gameStats[currentRoom].goingAlone){
          scoreBoard[currentRoom]['goodScore'][1] += 2
        }
        } else if(scoreBoard[currentRoom]['goodScore'][2] == 3 || scoreBoard[currentRoom]['goodScore'][2] == 4) {
          scoreBoard[currentRoom]['goodScore'][1]++
        } else {
          scoreBoard[currentRoom]['evilScore'][1] += 2
        }
  }
  function evilMaker(){
      if(scoreBoard[currentRoom]['evilScore'][2] == 5){
          scoreBoard[currentRoom]['evilScore'][1] += 2
        if(scoreBoard[currentRoom].goingAlone){
          scoreBoard[currentRoom]['evilScore'][1] += 2
        }
        } else if(scoreBoard[currentRoom]['evilScore'][2] == 3 || scoreBoard[currentRoom]['evilScore'][2] == 4) {
          scoreBoard[currentRoom]['evilScore'][1]++
        } else {
          scoreBoard[currentRoom]['goodScore'][1] += 2
        }
  }
    
    
  scoreBoard[currentRoom].gamesPlayed++
  gameStats[currentRoom].roundCounter = 0
  
  
  return
  
}

/// check if a player is leading the left bauer so that the value map can adjust

function checkBauerLead(data, currentRoom) {
  console.log(`checking bauer lead function ${data}  ${currentRoom}`)
  if(data == "J ♦" && gameStats[currentRoom].currentRoundTrump == "♥") {
    gameStats[currentRoom].currentRoundLeadSuit = "♥"
  } else if(data == "J ♥" && gameStats[currentRoom].currentRoundTrump == "♦") {
    gameStats[currentRoom].currentRoundLeadSuit = "♦"
  } else if(data == "J ♣" && gameStats[currentRoom].currentRoundTrump == "♠") {
    gameStats[currentRoom].currentRoundLeadSuit = "♠"
  } else if(data == "J ♠" && gameStats[currentRoom].currentRoundTrump == "♣") {
    gameStats[currentRoom].currentRoundLeadSuit = "♣"
  }
}





module.exports = { shuffleAndDeal, getLeftOfHost, gameStats, setNotPlaying, tallyTrickScore, tallyRoundScore, returnScore, zeroTricks, checkBauerLead, initializeRoomScoreboard };

