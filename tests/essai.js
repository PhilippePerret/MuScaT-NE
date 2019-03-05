var Application = require('spectron').Application
var assert = require('assert')

const app = new Application({
    path: '/Applications/MuScaT.app/Contents/MacOS/MuScaT'
  , quitTimeout: 5000
})

app.start( function(){
  console.log(app.browserWindow.getTitle())
  return app.browserWindow.getTitle()
})
.then(function(message){
  console.log(message)
  // app.stop()
})
.catch((err) => {
  // console.error('Test failed', err.message)
  console.error(`Longueur du message : ${err.message.length}`)
})
