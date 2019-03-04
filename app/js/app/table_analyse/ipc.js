'use strict'

const remote = electron.remote
const fs = require('fs')
const path = require('path')

/**
 * Pour envoyer une notification depuis le main process ou autre
 * +data+
 *    :message      The message to notify
 *    [OPT] :duration     Displayed time (in seconds)
 */
ipc.on('notify', (ev, data) => {
  F.notify(data.message, data)
})

/**
 * Méthode qui charge l'analyse de path +fpath+ (folder)
 *
 * La méthode peut être appelée par l'évènement 'tags-loaded' envoyé par
 * le main process ou par le document.ready quand on doit charger la dernière
 * analyse ouverte
 */
function loadAnalyse(fpath){
  MuScaT.analyse_file_path    = path.join(fpath, '_tags_.js')
  MuScaT.analyse_folder_path  = fpath
  MuScaT.analyse_name         = path.basename(fpath)
  MuScaT.preload()
    .then(MuScaT.start_and_run.bind(MuScaT))
    .then(function(){
      // Appliquer les préférences
      Prefs.loadAndDispatchAllPreferences({path: path.join(fpath, 'prefs.json')})
      // S'il faut lancer les tests
      if(TESTING){Tests.run()}
    });
}
/**
 * Méthode appelée par le main process lorsque l'utilisateur a choisi un
 * fichier Tags (i.e. un fichier d'analyse).
 * Dans 'data', la propriété 'path' contient le path du fichier choisi
 * ou null si aucun fichier n'a été choisi.
 * Si un fichier est choisi, la méthode appelle son chargement, c'est-à-dire
 * appelle une méthode qui va insérer la balise script avec le fichier dans
 * le code, attendre son chargement, et construire enfin l'analyse sur la
 * table d'analyse.
 */
ipc.on('tags-loaded', (err, data) => {
  let fpath = data.path ;
  if (fpath){
    loadAnalyse(fpath)
  }else{
    F.error("Il faut choisir un fichier.");
  }
})

// Event qui appelle le renderer pour obtenir le code de
// l'analyse à sauver pour la sauver.
ipc.on('get-tags-code', (event, data) => {
  // On envoie le code à enregistrer (le main process knows
  // the analysis to save)
  ipc.send('save-tags', {code: M.build_very_full_code()});
});
ipc.on('analysis-saved', (event) => {
  // On indique que l'analyse a été sauvée (et donc qu'il n'est plus modifiée)
  M.analyse_modified = false;
  F.notify(t('analysis-saved'));
})

IPC
  .on('pdf-successfully-writen', (event, data) => {
    F.notify(t('confirm-pdf-saved', {path: data.pdf_path}))
  })
  .on('init-new-analysis', (event) => {
    M.reset_all()
    F.notify(t('new-analysis-inited'), {duration: 1.5})
  })
  .on('new-tag', (event) => {
    ULTags.addTag();
  })
  .on('align-tags', (event, sens) => {
    // Pour aligner les tags sélectionnés
    // +sens+ peut être 'top', 'bottom', 'left' ou 'right'
    CTags.align.bind(CTags)(sens)
  })
  .on('group-tags', (event) => {
    CTags.grouper_selected.bind(CTags)()
  })
  .on('ajust-tags', (event) => {
    CTags.repartir_selected.bind(CTags)()
  })
  .on('toggle-reference-lines', (event) => {
    // Pour afficher/masquer les lignes de références
    Page.toggle_lines_of_reference();
  })
