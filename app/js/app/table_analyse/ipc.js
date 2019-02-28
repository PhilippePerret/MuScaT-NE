'use strict'

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
    MuScaT.analyse_file_path    = `${fpath}/_tags_.js`
    MuScaT.analyse_folder_path  = fpath
    MuScaT.analyse_name         = data.analyse_name
    MuScaT.preload()
        .then(MuScaT.start_and_run.bind(MuScaT))
        .then(function(){if(TESTING){Tests.run()}});
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
