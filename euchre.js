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


module.exports = { shuffleAndDeal }

// TODO  - return users as well as the kitty