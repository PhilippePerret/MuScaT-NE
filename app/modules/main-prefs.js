'use strict'

const { app, BrowserWindow } = require('electron')
const fs = require('fs')
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
  , isReady: false
  , position: null // position (Rectangle) de la fenêtre
  , open: function(){
      this.rendVisible()
    }
    /**
     * La "fausse" méthode de fermeture, qui pousse simplement la
     * fenêtre sur le côté
     */
  , hide: function(){
      try {
        this.win.hide()
        this.built = false
      } catch (e) {
        log(`ERREUR dans MainPrefs#close: ${e}`)
      }
    }
    /**
     * Méthode principale appelée par le menu pour afficher les
     * préférences
     */
  , show: function(){
      log("-> MainPrefs#show")
      if (!this.built){this.build()}
      this.win.show()
      this.win.focus()
      log("<- MainPrefs#show")
    }
  , quit: function(){
      log("-> MainPrefs#quit")
      this.win.close()
      this.win = null
      this.built = false
      log("<- MainPrefs#quit")
    }
    /**
     * Construction de la fenêtre
     */
  , build: function(){
      var my = this
      this.win = new BrowserWindow({
          title: t('Preferences')
        // , heigth: this.WIN_HEIGHT
        // , width: this.WIN_WIDTH
        , useContentSize: true
        , modal: false
        , show: false
        , center: true
        , resizable: false
        , closable: true // il faut utiliser OK
      })
      var p = path.resolve(__dirname,'..','prefs.html')
      this.win.loadURL(`file://${p}`);
      this.win.toggleDevTools();
      this.built = true
      this.win.once('ready-to-show', (event) => {my.isReady = true})
      return this.win
    }
}

module.exports = MainPrefs
