'use strict'
/**
 * Module chargé par la fenêtre des préférences
 */
const remote = electron.remote

const DATA_PREFS = require('./js/app/common/data_prefs.js')


const Prefs = {
    class: 'Prefs'

  , UserPrefs: null
  , DefaultPrefs: null
    /**
     * Retourne la valeur de la préférence +pid+
     */
  , get: function(pid){
      if('undefined'==typeof(getPref(pid))){
        F.error(`Preference "${pid}" is unknown…`)
      } else {
        return getPref(pid);
      }
    }
    /**
     * Retourne true si la préférence d'identifiant +pid+ doit être immédiatement
     * répercutée dans la table d'analyse. Par exemple, quand on change la taille
     * de la police des accords, on doit voir le changement tout de suite.
     */
  , isRepercutable: function(pid){
      return DATA_PREFS[pid].monit === true
    }
    /**
     * Initialisation
     * Charge notamment les préférences de l'utilisateur (en les demandant
     * à MainPrefs) et les préférences par défaut.
     */
  , init: function(){
      log('-> Prefs#init')
      var my = this
      $('form#form-default-return').on('submit', Prefs.quit.bind(Prefs))
      document.getElementById('btn-ok').addEventListener('click', my.quit)
      this.UserPrefs      = ipc.sendSync('get-user-prefs')
      this.DefaultPrefs   = ipc.sendSync('get-default-prefs')

      log('<- Prefs#init')
    }
    /**
     * Noter qu'on ne peut pas fermer la fenêtre (MainPrefs.win) depuis cette
     * méthode, car elle appartient au renderer alors que c'est le main process
     * qui a ouvert la fenêtre
     */
  , quit: function(){
      ipc.send('quit-preferences')
    }

    /**
     * Méthode appelée quand on change la valeur de la préférence +pid+
     * pour lui donner la valeur +pvalue+ (qui est peut-être la valeur
     * courante dans lequel cas on ne fait rien)
     * Dans la majorité des cas, on tente d'appliquer immédiatement les
     * changement pour voir l'effet. C'est particulièrement important pour
     * les options concernant l'aspect de l'analyse.
     */
  , onChange: function(pid, pvalue){
      switch(pid){

      }
    }
}

Prefs.onChange = function(mutList, obs){
  console.log(mutList)
  console.log(obs)
  for(var mutation of mutList){
    if(mutation.type == 'childList'){
      var target = mutation.target.id
      log(`Le nœud #${target} a été mis à ${document.getElementById(target).innerHTML}`)
    }
  }
}



/** Méthode qui retourne (de façon synchrone) la valeur de la préférence
  * d'identifiant +pref_id+
  */
function getPref(pref_id){
  return ipc.sendSync('get-pref', {id: pref_id})
}
/**
 * Méthode qui définit (de façon synchrone) la valeur de la préférence
 * d'identifiant +pref_id+ en lui assignant la valeur +value+
 */
function setPref(pref_id, value){
  ipc.sendSync('set-pref', {id: pref_id, value: value})
}

/**
 * Méthode qui définit de façon synchrone la valeur de la préférence
 * de façon provisoire (répercussion sur la table d'analyse mais pas
 * d'enregistrement)
 */
 function setPrefProv(pref_id, value){
   log("[PREFS] -> setPrefProv")
   if (Prefs.isRepercutable(pref_id)){
     var mainWindow = remote.getGlobal('mainWindow')
     mainWindow.webContents.send('set-pref-prov', {pid:pref_id, value: value})
   }
   log("[PREFS] <- setPrefProv")
}


// ---------------------------------------------------------------------

$(document).ready(function(){
  Prefs.init()
  // L'initiation des Panels doit absolument se faire après Prefs.init, car
  // elle a besoin des préférences de l'utilisateur qui sont justement chargées
  // dans Prefs.init
  Panels.init()

  /**
   * Tentative pour poser un observeur de changement de contenu
   * sur les champs span
   * Noter que c'est seulement pour les span. On peut obtenir les
   * autres valeurs (select, checkbox, ...) par d'autres moyens
   */
  var node = document.getElementById('default_analysis_folder')
  var config = {attributes: true, childList: true, subtree: true }
  var observer = new MutationObserver(Prefs.onChange)
  observer.observe(node, config)

  /**
   * On place les observeurs pour capter les modifications des
   * préférences
   * Le onchange permet d'effectuer les changements en direct
   * Mais c'est seulement le onblur qui modifie vraiment la propriété dans
   * les préférences si elle a été modifiée
   */
  $('.changeable').on('change', function(){
    var o = $(this)[0]
    setPrefProv(o.id, o.value)
    log(`La préférence ${o.id} a été mise provisoirement à ${o.value}`)
  })
  $('.changeable').on('blur', function(){
    var o = $(this)[0]
    if (getPref(o.id) != o.value){
      setPref(o.id, o.value)
      log(`La préférence ${o.id} a été mise à ${o.value} (au blur)`)
    } else {
      log(`La préférence ${o.id} n'a pas été modifiée. Je ne l'enregistre pas.`)
    }
  })

  // Appelé par le bouton pour sauver les préférences pour l'analyse courante
  $('#btn-save-for-curanalysis').on('click', () => {
    ipc.send('save-prefs-current-analysis')
  })
})
