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

global.Analyser  = require('./app/modules/analyse.js')
global.Locales   = require('./app/modules/Locales.js')
const AppMenu   = require('./app/modules/menus.js')

// La gestion des menus en a besoin
global.win = null ;
global.mainMenuBar = null ; // défini au ready

// Translation
global.t = (msg_id, msg_replacements) => {
  return Locales.translate(msg_id, msg_replacements)
}

// var mainMenuBar = new Menu();

app.on('ready', () => {

  // On charge la configuration (pour le moment, notamment pour :
  // - la dernière analyse (qui se charge automatiquement))
  // - la langue (anglais pour le moment)
  // TODO Charger la configuration

  // On charge les locales
  // console.log('Langue :', process.env.LANG)
  Locales.load(process.env.LANG.substring(0,2) || 'en');

  // Construction des menus
  // Note : on a besoin de `mainMenuBar` pour retrouver les menus par
  // leur identifiant (cf. le modules modules/menus.js)
  mainMenuBar = Menu.buildFromTemplate(AppMenu.menuTemplate())
  Menu.setApplicationMenu(mainMenuBar);

  // Prend la taille de l'écran entier
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  // win = new BrowserWindow({ width, height })
  win = new BrowserWindow({
    height: height, width: width
  });

  // Pour l'atteindre depuis le module Analyser
  // Note : maintenant que `win` est global, ça ne doit plus être utile
  Analyser.win = win;

  // On charge dans la fenêtre créée le fichier principal, c'est-à-dire la
  // table d'analyse.
  win.loadURL(`file://${__dirname}/app/table_analyse.html`);

  // Ajouter cette ligne pour voir les outils de développement
  // TODO Les mettre dans un menu
  // win.toggleDevTools();
});

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
