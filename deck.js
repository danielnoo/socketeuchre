const suits = ["♣", "♥", "♠", "♦"]
const values = ["9", "10", "J", "Q", "K", "A"]




class Deck {
  constructor(cards = freshDeck()) {
    this.cards = cards
  }

  get numberOfCards() {
    return this.cards.length
  }

  // pop()

  // push()

  shuffle() {
    for (let i = this.numberOfCards -1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i + 1))
      const oldValue = this.cards[newIndex]
      this.cards[newIndex] = this.cards[i]
      this.cards[i] = oldValue
    }
  }
}



class Card {
  constructor(suit, value) {
    this.suit = suit
    this.value = value
  }

  get color() {
    return this.suit === "♣" || this.suit === "♠" ? "black" : "red"
  }

  get HTML () {
    const cardDiv = document.createElement("div")
    cardDiv.innerText = this.suit
    cardDiv.classList.add("card", this.color)
    cardDiv.dataset.value = `${this.value} ${this.suit}`
    return cardDiv
  }
}



function freshDeck() {
  return suits.flatMap(suit => {
    return values.map(value => {
      return new Card(suit, value)
    })
  })
}



module.exports = Deck