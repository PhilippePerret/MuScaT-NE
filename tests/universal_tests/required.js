'use strict'
/**
 * Le module qui charge tous les autres
 */

const glob = require('glob')
    , path = require('path')

glob.sync(path.join(__dirname,'system','**','*.js')).forEach(function(file){
  require(path.resolve(file))
})

console.log("Tous les fichiers tests système sont chargés")

glob.sync(path.join(__dirname,'app','**','*.js')).forEach(function(file){
  require(path.resolve(file))
})

console.log("Tous les fichiers tests/universal_tests/app sont chargés")

glob.sync(path.resolve(__dirname,'..','app','**','*.js')).forEach(function(file){
  require(path.resolve(file))
})


console.log("Tous les fichiers tests/app sont chargés")

// On lance les tests
Tests.run()
