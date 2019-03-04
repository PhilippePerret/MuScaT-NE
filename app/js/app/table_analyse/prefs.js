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
  , dataPrefs: null  // = DATA_PREFS
  , analysisPrefs: {}
  , userPrefs: {}
    /**
     * Retourne la valeur de la préférence d'identifiant +pid+
     */
  , getValueOfPref: function(pid){
      return this.analysisPrefs[pid] || this.userPrefs[pid] || this.dataPrefs[pid].defValue
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

      // Les préférences de l'utilisateur (if any)
      // => userPrefs
      var userPrefsPath = remote.getGlobal('userPrefsPath')
      if(fs.existsSync(userPrefsPath)){
        my.userPrefs = require(userPrefsPath)
      } else {
        my.userPrefs = {}
      }

      // Les données générales des préférences
      my.dataPrefs = DATA_PREFS ; //require('./js/app/common/data_prefs.js')

      // Maintenant que toutes les préférences sont chargées, on peut les
      // dispatcher dans l'interface.
      my.dispatchAllPrefs()
    }
  , dispatchAllPrefs: function(){
      log("[TABLE] Je dispatche les préférences")
      for(var p in DATA_PREFS){
        if(DATA_PREFS[p].monit === true){
          (new Pref(p)).apply(this.getValueOfPref(p))
        }
      }
      log("[TABLE] FIN dispatch des préférences")
    }
}

 /**
  * Méthode appelée quand on modifie une préférence dans le panneau des préférences,
  * mais sans encore l'enregistrer.
  */
 IPC.on('set-pref-prov', (ev, data) => {
   log('[TABLE] -> set-pref-prov')
   console.log(data)
   var ipref = new Pref(data.pid)
   ipref.value = data.value
   ipref.apply()
   log(`[TABLE] Je change la préférence ${ipref.id} à ${ipref.value}`)
   ipref = null
 })
