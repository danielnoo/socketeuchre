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

function firstOrderUpCheck (playerList){
  
  let users = playerList
  let getLeftOfHost = 0
  // fix this shit with filter
  users.forEach((player, index) => {
    if(player.host && users[index] === 3){
      getLeftOfHost = 0
    } else if (player.host) {
      getLeftOfHost = player[index] + 1
    } 
  })
  console.log(getLeftOfHost)
  return users[getLeftOfHost]["id"]
  
  
}


module.exports = { shuffleAndDeal, firstOrderUpCheck }

// TODO  - return users as well as the kitty