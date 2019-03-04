




$(document).ready(function(){

  IPC.on('debug', (ev, data) => {
    if(data.message){
      var n = document.createElement('DIV')
      n.innerHTML = data.message
      document.getElementById('debug').append(n)
    }
  })

  IPC.send('log', "Je suis prêt, dans le background")
})
