// something in here to listen for socket.onAny or that equivalent and reset a timer when any socket request is made, which is feasable since every action within the app has an accompanying socket emit
import { socket } from './script.js';

// a function that I wrote for a previous program that I'm now retooling to fire a custom disconnection event. This will allow me to use the automatic reconnection features that are built into the default socket io disconnect. If the user is AFK for 5 minutes then a custom disconnect emit will be fired and they will be removed from the server side users array


export function checkIdle() {
  let time;
  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;  // catches touchscreen presses as well      
  window.ontouchstart = resetTimer; // catches touchscreen swipes as well 
  window.onclick = resetTimer;      // catches touchpad clicks as well
  window.onkeydown = resetTimer;   
  window.addEventListener('scroll', resetTimer, true); 

  function resetTimer() {
    clearTimeout(time);
    time = setTimeout(callManualDisconnect, 300000);  // time is in milliseconds
  }
  function callManualDisconnect(){
    socket.emit('user-timeout', socket.id)
  }
}