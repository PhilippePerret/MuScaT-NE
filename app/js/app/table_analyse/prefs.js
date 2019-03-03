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

let Pref = require('./js/app/common/class_Pref.js')

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
