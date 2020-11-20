const socket = io();


socket.on('chat-message', data => {
  console.log(data);
})
console.log('poop');

