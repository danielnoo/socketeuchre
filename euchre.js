const Deck = require('./deck');
const { valueMap } = require('./valuemap');


const deck = new Deck()

// keeps track of score as well as which team picked trump
let gameStats = {
  goodScore: [0, 0, 0],
  evilScore: [0, 0, 0],
  roundCounter: 0,
  currentRoundMaker: undefined,
  currentRoundTrump: undefined,
  currentRoundLeadSuit: undefined,
  initialTurnedUpSuit: undefined,
  goingAlone: false,
  notPlayingIndex: undefined,
  currentRoundCards: []
};



function shuffleAndDeal(users){
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


// unused function- maybe delete
function setInitialTurn(userList) {
  let turnInitiatedUserList = userList
  let hostIndex = userList.map(user => user['host']).indexOf(true)
  let initialTurnIndex = 0
  if(hostIndex !== 3){
    initialTurnIndex = hostIndex + 1
  }
  turnInitiatedUserList[initialTurnIndex]['turn'] = true

  return turnInitiatedUserList
}

function setNotPlaying(gameStats, users, localClientSeatPosition){
  const aloneTeam = users.filter(user => user['team'] == gameStats.currentRoundMaker)
  const isNotPlaying = aloneTeam.filter(user => user['id'] !== users[localClientSeatPosition]['id'])
  
  gameStats.notPlayingIndex = users.findIndex(user => user['id'] == isNotPlaying[0]['id'])
  return isNotPlaying[0]['id']
  }

  function tallyTrickScore(gameStats, userList) {
    
    let values = valueMap(gameStats.currentRoundLeadSuit, gameStats.currentRoundTrump)
    
    // convert the valuemap to the dataset.value format used in the cards
    values.forEach(arr => {
      arr.forEach((arr2, index) => {
        arr2[1] = arr2[1] + ' ' + arr2[0]; arr2.shift()  
       })    
    })
    

    // loop through the cards that have been played and cross reference the valuemap, pushing the score of each card onto card array

    gameStats.currentRoundCards.forEach((playedCard, index) => {
      for(let suit = 0; suit < 4; suit++){
        for(let card = 0; card < 6; card++){
        if(values[suit][card][0] == gameStats.currentRoundCards[index][1]){
          playedCard.push(values[suit][card][1])
        }
       }
      }})
    
    console.log(gameStats.currentRoundCards)

    // return the index of the highest scoring card

    const hiScoreIndex = gameStats.currentRoundCards.map(card => card[2]).reduce((highestSoFar, currentValue, currentIndex, array) => currentValue > array[highestSoFar] ? currentIndex : highestSoFar, 0)

    

    // find the team of the high score

    const winningPlayerIndex = userList.map(user => user['id'] == gameStats.currentRoundCards[hiScoreIndex][0]).indexOf(true)

    
      // assign the won trick in gameStats
      // not sure if need parentheses on method

    if(userList[winningPlayerIndex]['team'] == 'good') {
      gameStats.goodScore[2]++
    } else {
      gameStats.evilScore[2]++
    }

    gameStats.lastWinnerIndex = winningPlayerIndex
    gameStats.currentRoundCards = []
    gameStats.currentRoundLeadSuit = undefined
    gameStats.roundCounter++

    return gameStats
  }

  // function resetAfterRound() {
    

  //   return gameStats
    
  // }

function tallyRoundScore(gameStats){
  if(gameStats.currentRoundMaker == 'good') {
  	if(gameStats.goodScore[2] == 5){
      gameStats.goodScore[1] += 2
      if(gameStats.goingAlone){
       gameStats.goodScore[1] += 2
      }
      } else if(gameStats.goodScore[2] == 3 || gameStats.goodScore[2] == 4) {
        gameStats.goodScore[1]++
      } else {
        gameStats.evilScore[1] += 2
      }
    } else if(gameStats.currentRoundMaker == 'evil'){
    	    if(gameStats.evilScore[2] == 5){
            gameStats.evilScore[1] += 2
            if(gameStats.goingAlone){
              gameStats.evilScore[1] += 2
            }
          } else if(gameStats.evilScore[2] == 3 || gameStats.evilScore[2] == 4) {
            gameStats.evilScore[1]++
          } else {
            gameStats.goodScore[1] += 2
          }
    }

  return

}




module.exports = { shuffleAndDeal, getLeftOfHost, setInitialTurn, gameStats, setNotPlaying, tallyTrickScore, tallyRoundScore};

