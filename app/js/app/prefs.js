'use strict'
/**
 * Module chargé par la fenêtre des préférences
 */

// const electron = require('electron');
// const fs = require('fs');
// const { app } = require('electron');
// const path = require('path')

// Note : ne s'en servir QUE pour les dimensions
const MainPrefs = require('./modules/main-prefs')

const PREFS = null || {
    property: 'value'
  , lang:             'fr'
  , theme:            'muscat'
  , default_analysis_folder: ''
  , chord_fsize:      17
  , harmony_fsize:    18
  , cadence_fsize:    19
  , modulation_fsize: 20
  , part_fsize:       23
  , measure_fsize:    24
  , degree_fsize:     25
  , text_fsize:       26

  , references_lines: false
  , visor:            false

  , animation_speed:  50
}

const Prefs = {
    class: 'Prefs'
    /**
     * Retourne la valeur de la préférence +pid+
     */
  , get: function(pid){
      if('undefined'==tyepof(PREFS[pid])){
        F.error(`Preference "${pid}" is unknown…`)
      } else {
        return PREFS[pid];
      }
    }
  , init: function(){
      log('-> Prefs#init')
      var my = this
      $('form#form-default-return').on('submit', Prefs.quit.bind(Prefs))
      document.getElementById('btn-ok').addEventListener('click', my.quit)
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

$(document).ready(function(){
  Panels.init()
  Prefs.init()
})
