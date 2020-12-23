const Deck = require('./deck')
const valueMap = require('./valuemap')


const deck = new Deck()


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
// find the index of the host and add 1 - if index is 3, go to 0



function getLeftOfHost(playerList) {
  const hostIndex = playerList.map(user => user['host']).indexOf(true)
  if(hostIndex !== 3){
    return playerList[hostIndex + 1].id
  } else {
    return playerList[0].id
  }
}

module.exports = { shuffleAndDeal, getLeftOfHost }

// TODO  - return users as well as the kitty