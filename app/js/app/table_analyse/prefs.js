'use strict'
/**
 * Méthodes propres à la table d'analyse pour gérer les préférences.
 *
 * Normalement et principalement, elles reçoivent des valeurs à appliquer à
 * l'interface, comme la visibilité des éléments, la taille des polices, etc.
 *
 * Ces méthodes fonctionnent aussi avec la class Pref qui s'occupe d'une
 * préférence en particulier.
 *
 */

const {Pref, DATA_PREFS} = require('./js/app/common/class_Pref.js')

const Prefs = {
    class: 'Prefs'
  , analysisPrefs: {}
  , reset: function(){
      delete this._userPrefs
    }
    /**
     * Retourne la valeur de la préférence d'identifiant +pid+
     * En la prenant, par ordre de priorité :
     *  - dans le fichier prefs.json de l'analyse (if any)
     *  - dans le fichier des préférences de l'utilisateur (if any)
     *  - dans les valeurs par défaut des définitions des préférences
     */
  , getValueOfPref: function(pid){
      return this.analysisPrefs[pid] || this.userPrefs[pid] || this.dataPrefs[pid] && this.dataPrefs[pid].defValue
    }

    /**
     * Charge les préférences (de l'analyse et de l'utilisateur — if any)
     */
  , loadAndDispatchAllPreferences: function(data){
      var my = this
      // Les préférences propres à l'analyse (if any)
      // => analysisPrefs
      if(data.path && fs.existsSync(data.path)){
        my.analysisPrefs = require(data.path)
      } else {
        my.analysisPrefs = {}
      }

      // Maintenant que toutes les préférences sont chargées, on peut les
      // dispatcher dans l'interface.
      my.dispatchAllPrefs()
    }
  , dispatchAllPrefs: function(){
      for(var p in DATA_PREFS){
        if(DATA_PREFS[p].monit === true){
          (new Pref(p)).apply(this.getValueOfPref(p))
        }
      }
    }
}
Object.defineProperties(Prefs, {
    dataPrefs: {
      get:function(){return DATA_PREFS}
    }
  , userPrefs: {
      get: function(){
        if(undefined == this._userPrefs){
          // Les préférences de l'utilisateur (if any)
          // => userPrefs
          var userPrefsPath = remote.getGlobal('userPrefsPath')
          if(fs.existsSync(userPrefsPath)){
            this._userPrefs = require(userPrefsPath)
          } else {
            this._userPrefs = {}
          }
        }
        return this._userPrefs
      }
  }
})

function getPref(pid){
  return Prefs.getValueOfPref(pid)
}

 /**
  * Méthode appelée quand on modifie une préférence dans le panneau des préférences,
  * mais sans encore l'enregistrer.
  */
 IPC.on('set-pref-prov', (ev, data) => {
   // log('[TABLE] -> set-pref-prov')
   (new Pref(data.pid)).apply(data.value)
 })
