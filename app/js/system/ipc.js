'use strict'
/**
 * Ce module est le module de "contact" entre le main process et le processus
 * de rendu. Il doit être chargé par toutes les fenêtre BrowserWindow
 */
const electron = require('electron');
const ipc = electron.ipcRenderer ;
const IPC = ipc

const TESTING = false
const ANALYSE = 'Essai'

/**
 * Méthode principale qui affiche un message d'erreur
 * Dans le main process, c'est la méthode `msg_error` qui appelle cet
 * évènement.
 */
ipc.on('error', (event, data) => {
  F.error(data.message)
});

const log = function(message){
  ipc.send('log', {message: message})
}
