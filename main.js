'use strict';

/**
 * Stratégie à employer pour passer de l'application Chrome à l'app Electron
 *
 *  - mettre un évènement sur le redimensionnement de la fenêtre
 *  - pouvoir visualiser la partition seule, en plus gros
 *  - Tous les scripts doivent devenir des menus
 *
 *  TODO : voir mousetrap qui a l'air très puissant pour les raccourcis
 *  https://electronjs.org/docs/tutorial/keyboard-shortcuts#raccourcis-dans-un-browserwindow
 */
const electron = require('electron');
const fs = require('fs');
const {app, BrowserWindow} = require('electron');
const path = require('path')
// Définition des raccourcis clavier
const { Menu, MenuItem } = require('electron')
const ipc = electron.ipcMain

const IsMac     = process.platform === 'darwin'
const IsNotMac  = !IsMac

global.Analyser   = require('./app/modules/analyse.js')
global.Locales    = require('./app/modules/Locales.js')
global.MainPrefs  = require('./app/modules/prefs.js')
const AppMenu     = require('./app/modules/menus.js')

// La gestion des menus en a besoin
global.win = null ;
global.mainWindow = null ; // remplacer 'win' par ça
global.mainMenuBar = null ; // défini au ready

// Translation
global.t = (msg_id, msg_replacements) => {
  return Locales.translate(msg_id, msg_replacements)
}

// var mainMenuBar = new Menu();

app
.on('ready', () => {

  // On charge la configuration (pour le moment, notamment pour :
  // - la dernière analyse (qui se charge automatiquement))
  // - la langue (anglais pour le moment)
  // TODO Charger la configuration

  // On charge les locales
  // console.log('Langue :', process.env.LANG)
  Locales.load(process.env.LANG ? process.env.LANG.substring(0,2) : 'en');

  // Construction des menus
  // Note : on a besoin de `mainMenuBar` pour retrouver les menus par
  // leur identifiant (cf. le modules modules/menus.js)
  mainMenuBar = Menu.buildFromTemplate(AppMenu.menuTemplate())
  Menu.setApplicationMenu(mainMenuBar);

  // Prend la taille de l'écran entier
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  // win = new BrowserWindow({ width, height })
  mainWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true // parce que j'utilise node.js dans les pages
      }
    , height: height, width: width
    // Pour Linux Ubutu:
    , icon: path.resolve(__dirname,'assets','build','osx','logo-icon.png')
  });

  win  = mainWindow

  // Pour l'atteindre depuis le module Analyser
  // Note : maintenant que `win` est global, ça ne doit plus être utile
  Analyser.win = win;

  // On charge dans la fenêtre créée le fichier principal, c'est-à-dire la
  // table d'analyse.
  win.loadURL(`file://${__dirname}/app/table_analyse.html`);

  // Ajouter cette ligne pour voir les outils de développement
  // TODO Les mettre dans un menu
  // win.toggleDevTools();

})
.on('window-all-closed', (event)=>{
  if(IsNotMac){app.quit()}
})
.on('quit', (event) => {
  if (MainPrefs.win){
    // <= La fenêtre des préférences a été ouverte
    // => Il faut la détruire
    console.log("Fermeture de la fenêtre des préférences au quit")
    MainPrefs.win.close()
  }
})
;

// Pour sauver l'analyse courante
const AnalyserB = Analyser.save.bind(Analyser)
ipc.on('save-tags', (err, data) => {
  AnalyserB(data, win)
});

// Pour obtenir (de façon synchrone) une valeur de locale
// Car elles sont gérées au niveau du main process
ipc
  .on('get-locale', (event, data) => {
    event.returnValue = t(data.id, data.replacements);
  })
  .on('set-menus-multiselections', (err, yes) => {
    AppMenu.setMenusSelectionMultiple(yes)
  })
