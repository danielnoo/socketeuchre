// something in here to listen for socket.onAny or that equivalent and reset a timer when any socket request is made, which is feasable since every action within the app has an accompanying socket emit


let inactivityTimer = 600

function timeoutDisconnect(){
  // every time a socket is emitted - counter equals 600

  // set interval to countdown 1 minute every 60 seconds
}