const Deck = require('./deck')
const valueMap = require('./valuemap')


const deck = new Deck()

// keeps track of score as well as which team picked trump
let gameStats = {
  goodScore: 0,
  evilScore: 0,
  currentRoundMaker: undefined,
  currentRoundTrump: undefined,
  currentRoundLeadSuit: undefined,
  initialTurnedUpSuit: undefined,
  goingAlone: false,
  notPlayingIndex: undefined,
  currentRoundCards: [],
  goodWins(points) {
    this.goodScore += points
  },
  evilWins(points) {
    this.evilScore += points
  }
}

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



module.exports = { shuffleAndDeal, getLeftOfHost, setInitialTurn, gameStats, setNotPlaying }

