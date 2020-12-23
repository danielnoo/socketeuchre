

function valueMap(lead, trump) {
  let values = [
  [
    ["♥", "9", 1],
    ["♥", "10", 2],
    ["♥", "J", 3],
    ["♥", "Q", 4],
    ["♥", "K", 5],
    ["♥", "A", 6]
  ],
  [
    ["♦", "9", 1],
    ["♦", "10", 2],
    ["♦", "J", 3],
    ["♦", "Q", 4],
    ["♦", "K", 5],
    ["♦", "A", 6]
  ],
  [
    
    ["♣", "9", 1],
    ["♣", "10", 2],
    ["♣", "J", 3],
    ["♣", "Q", 4],
    ["♣", "K", 5],
    ["♣", "A", 6]
  ],
  [
    ["♠", "9", 1],
    ["♠", "10", 2],
    ["♠", "J", 3],
    ["♠", "Q", 4],
    ["♠", "K", 5],
    ["♠", "A", 6]
  ]
  
]

let trumpValues = [7,8,13,9,10,11]


setLead(lead)
setTrump(trump)
setLeftBauer(trump)

return values


function setTrump(trump) {
  
  values.forEach(suit => {
    if(suit[0][0] === trump){
      for(let i = 0; i < 6; i++){
        suit[i][2] = trumpValues[i]
      }
    }
  })
}

function setLeftBauer(trump) {
  switch(trump){
    case "♥":
      values[1][2][2] = 12;
      break;
    case "♦":
      values[0][2][2] = 12;
      break;
    case "♣":
      values[3][2][2] = 12;
      break;
    case "♠":
      values[2][2][2] = 12;
      break;

  }
}

function setLead(lead) {
  values.forEach(suit => {
    if(suit[0][0] !== lead){
      for(let i = 0; i < 6; i++) {
        suit[i][2] = 0
      }
    }
  }) 

}


}

module.exports = { valueMap }