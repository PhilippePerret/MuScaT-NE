'use strict'

// const electron = require('electron');
// const fs = require('fs');
// const { app } = require('electron');
// const path = require('path')

const MainPrefs = require('./modules/prefs')

const Prefs = {
    class: 'Prefs'
  , init: function(){
      $('form#form-default-return').on('submit', Prefs.quit.bind(Prefs))
    }
  , quit: function(){
      console.log("Je vais quitter les préférences.")
    }
}

$(document).ready(function(){
  Panels.init()
  Prefs.init()
})
