'use strict';

/**
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

/**
 * Les préférences utilisateur
 */
const userPrefsPath = path.join(app.getPath('userData'), 'user-preferences.json')

global.Analyser   = require('./app/modules/analyse.js')
global.Locales    = require('./app/modules/Locales.js')
global.MainPrefs  = require('./app/modules/main-prefs.js')
const AppMenu     = require('./app/modules/menus.js')

// La gestion des menus en a besoin
global.bWindow = null       // Fenêtre background
global.win = null
global.mainWindow = null // remplacer 'win' par ça
global.mainMenuBar = null // défini au ready

// Translation
global.t = (msg_id, msg_replacements) => {
  return Locales.translate(msg_id, msg_replacements)
}
// Pour utiliser indifféremment 'log' dans le main process et dans les
// renderers.
global.log = (message) => {
  console.log(message)
}

var winPrefs

// var mainMenuBar = new Menu();

app.on('ready', () => {


  bWindow = new BrowserWindow({
      title: 'Background'
    , x: 0
    , y: 0
    , width: 400
    , height: 1000
    , show: true // quand on veut déboggeur (tous les messages sont envoyés)
  })
  bWindow.loadURL(`file://${__dirname}/app/background.html`)
  bWindow.toggleDevTools();

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
    , height: height
    , width: width - 400
    , x: 400
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

  winPrefs = MainPrefs.build()
  winPrefs.on('move', (ev) => {
    console.log("Ça bouge dans main process")
  })
  winPrefs.on('beforeunload', (ev) => {
    console.log("On quitte les préférences (beforeunload)")
  })
  winPrefs.on('quit', (ev) => {
    console.log("On quitte les préférences")
  })
  winPrefs.on('close', (ev) => {
    MainPrefs.win = null
    MainPrefs.built = false
    console.log("On close les préférences")
  })

})// Fin de app ready

app.on('window-all-closed', (event)=>{
  if(IsNotMac){app.quit()}
})
app.on('quit', (event) => {
  console.log('-> quit')
  console.log('<- quit')
})
;


// Pour sauver l'analyse courante
const AnalyserB = Analyser.save.bind(Analyser)
ipc.on('save-tags', (err, data) => {
  AnalyserB(data, win)
});

// Pour obtenir (de façon synchrone) une valeur de locale
// Car elles sont gérées au niveau du main process
ipc.on('get-locale', (event, data) => {
    event.returnValue = t(data.id, data.replacements);
  })
ipc.on('set-menus-multiselections', (err, yes) => {
    AppMenu.setMenusSelectionMultiple(yes)
  })
ipc.on('log', (ev, data) => {
    console.log(data.message)
    if('string' == typeof(data)){data = {message: data}}
    bWindow.webContents.send('debug', data)
  })
ipc.on('quit-preferences', (ev) => {
  console.log("Je quitte les préférences depuis le main process")
  MainPrefs.quit()
  // app.quit()
})
