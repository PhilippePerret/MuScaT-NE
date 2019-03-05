'use strict'

const APPFOLDER = path.resolve('.')
console.log(`APPFOLDER: "${APPFOLDER}"`)
let mode_test_path = path.join(APPFOLDER,'MODE_TEST')
const MODE_TEST = fs.existsSync(mode_test_path)

// En version nodejs/Electron, ce fichier ne sert plus à rien
// /*
//   Script principal
// */
// // Debug.level = 7;


$(document).ready(function(){
  Cook.parse();
  UI.init();

  log(`MODE_TEST = ${MODE_TEST}`)
  if(MODE_TEST){
    // TODO Charger toutes les feuilles de test
    require(path.join(APPFOLDER,'tests/app/system/Cook.js'))
  }



  // Open last analysis ?
  var open_last_analyse = Prefs.getValueOfPref('open_last_at_launch') === true
  var last_analyse_path = Prefs.getValueOfPref('last_analysis_path')
  var last_analyse_exists = last_analyse_path && fs.existsSync(last_analyse_path)

  // Si les préférences déterminent qu'il faut charger la dernière
  // analyse et qu'elle existe, on la charge.
  if ( open_last_analyse && last_analyse_exists){
    loadAnalyse(last_analyse_path)
  }
});
