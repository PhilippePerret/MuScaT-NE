'use strict'

const { app, BrowserWindow } = require('electron')
const fs    = require('fs')
const path  = require('path')

let DATA_PREFS = require('../js/app/common/data_prefs.js')

const PREFS = function(){
  if(fs.existsSync(userPrefsPath)){
    return require(userPrefsPath)
  } else {
    return {}
  }
}()

// console.log("PREFS:", PREFS)

/**
 * Ce module est celui utilisé principalement par le main process.
 * Il permet de construire la fenêtre des préférences et de faire l'interface
 * avec la table d'analyse.
 */

const MainPrefs = {
    class: 'MainPrefs'
  , WIN_HEIGHT:     null // hauteur totale
  , WIN_WIDTH:      null
  , ONGLETS_WIDTH:  null
  , modified: false       // mis à true quand modifié
  , win: null // la fenêtre (instance BrowserWindow)
  , built: false
  , isReady: false
  , position: null // position (Rectangle) de la fenêtre
  , init: function(){
      this.WIN_HEIGHT     = this.get('prefs_window_height')
      this.WIN_WIDTH      = this.get('prefs_window_width')
      this.ONGLETS_WIDTH  = this.get('prefs_onglets_width')
    }

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
        , useContentSize: true // taille adapté au contenu
        , modal: false
        , show: false
        , center: true
        , resizable: false
        , closable: true
      })
      var p = path.resolve(__dirname,'..','prefs.html')
      this.win.loadURL(`file://${p}`);
      // this.win.toggleDevTools();
      this.built = true
      this.win.once('ready-to-show', (event) => {my.isReady = true})
      return this.win
    }
  , getAnalysisPrefs: function(){return global.analysisPrefs || {}}
  , getUserPrefs: function(){return PREFS}
  , getDefaultPrefs: function(){return DATA_PREFS}
    /**
     * Retourne la valeur de la préférence +pid+
     * en la prenant, dans l'ordre :
     *    - dans le fichier des préférences propres à l'analyse (if any)
     *    - dans les préférences générales de l'user (if any)
     *    - dans les valeurs par défaut
     */
  , get: function(pid) {
      return this.getAnalysisPrefs[pid] || PREFS[pid] || DATA_PREFS[pid] && DATA_PREFS[pid].defValue;
    }
    /**
     * Définit de façon synchrone la valeur de la préférence +data.id+ en
     * la mettant à la valeur +data.value+ (mais seulement si elle a été changée)
     */
  , set: function(data) {
      if(this.get(data.id) !== data.value /* donc la valeur par défaut aussi */){
        PREFS[data.id] = data.value
        this.modified = true // pour l'enregistrer
      }
      return true
    }
  , saveIfModified: function(){
      if(this.modified){this.save()}
    }
    /**
     * Enregistre les nouvelles valeurs de préférences
     */
  , save: function(){
      log("-> MainPrefs#save")
      fs.writeFile(userPrefsPath, JSON.stringify(PREFS), (err) => {
        if(err) throw(err)
        log("Préférences enregistrées avec succès")
      })
      log("<- MainPrefs#save")
    }
  , saveAsPrefsCurrentAnalysis: function(analysisPrefsPath){
      var my = this
      fs.writeFile(analysisPrefsPath, JSON.stringify(my.getPrefs()), 'utf8', (err) => {
        if (err) throw(err)
        // TODO Message de confirmation
      })
    }
    /**
     * Méthode qui récupère les préférences pour les enregistrer pour l'analyse
     * courante. On ne prend pas les préférences marquées `apref: false`
     */
  , getPrefs: function(){
      var my = this
      var prefs = {}
      for(var p in DATA_PREFS){
        var d = DATA_PREFS[p]
        if (d.apref === false){continue}
        prefs[p] = my.get(p)
      }
      return prefs
    }

}

MainPrefs.init() // notamment pour les dimensions prises dans les prefs
module.exports = MainPrefs
