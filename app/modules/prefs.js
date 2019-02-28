'use strict'

const { app, BrowserWindow } = require('electron');
const path = require('path')

/**
 * Ce module est celui utilisé principalement par le main process, mais il
 * est aussi chargé par la fenêtre des préférences notamment pour obtenir les
 * dimensions des éléments.
 * Il permet de construire la fenêtre des préférences et de faire l'interface
 * avec la table d'analyse.
 */

const MainPrefs = {
    class: 'MainPrefs'
  , WIN_HEIGHT:     460 // hauteur totale
  , WIN_WIDTH:      800
  , ONGLETS_WIDTH:  150
  , win: null // la fenêtre (instance BrowserWindow)
  , built: false
  , open: function(){
      if(!this.built){this.build()}
      this.win.show()
      this.win.focus()
    }
    /**
     * Construction de la fenêtre
     */
  , build: function(){
      this.win = new BrowserWindow({
          title: t('Preferences')
        // , heigth: this.WIN_HEIGHT
        // , width: this.WIN_WIDTH
        , useContentSize: true
        , parent: mainWindow
        , modal: false
        , show: false
        , center: true
        , resizable: false
        , closable: false // il faut utiliser OK
      })
      var p = path.resolve(__dirname,'..','prefs.html')
      this.win.loadURL(`file://${p}`);
      this.observe()
      // DEBUG
      // this.win.toggleDevTools();
      this.built = true
    }
  , observe: function(){
      var my = this
    }
}


module.exports = MainPrefs
