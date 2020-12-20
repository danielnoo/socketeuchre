const Deck = require('./deck')

const deck = new Deck()


function shuffleAndDeal(users){
  deck.shuffle()
  let kitty = []
  let users = users
  
  for(let i = 20; i > 0; i = i - 5){
    users.forEach(user => {
      user['cards'].push(deck.pop())
    })
  }

  kitty.push(deck)
  
  

}

// TODO  - return users as well as the kitty