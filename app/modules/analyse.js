'use strict';

const { dialog, shell } = require('electron')
const fs    = require('fs'); // file system
const ipc   = require('electron').ipcMain
const path  = require('path')

let msg_error = (win, msg) => {
  win.webContents.send('error', {message: msg})
}

class Analyse {
  constructor(data){
    this.folder = data.folder;
    this.window = data.window;
  }
  set folder(v)   { this._folder = v }
  get folder()    { return this._folder }
  set window(v)   { this._window = v }
  get window()    { return this._window }
  get name()      { return path.basename(this.folder) }
  get tags_path() { return `${this.folder}/_tags_.js` }
  get pdf_path()  { return `${this.folder}/${this.name}.pdf` }
  // --- Méthodes ---

  /**
   * Retourne TRUE si le dossier est valide, c'est-à-dire s'il contient
   * bien le fichier _tags_.js
   *
   * Pour le moment, l'analyse est valide si le fichier _tags_.js existe
   */
  is_valid(){
    let tags_js_exists = fs.existsSync(this.tags_path);
    if(!tags_js_exists){
      msg_error(this.window, t('not-a-muscat-folder', {motif: t('tags-js-required')}))
    }
    return tags_js_exists;
  }
  // Sauver le fichier
  // TODO on pourra faire toute la procédure dans cette classe, même la
  // récupération du code.
  save(code){
    let my = this ;
    fs.writeFile(my.tags_path, code, 'utf8', (err) => {
      if (err) throw(err);
      // Pour dire au renderer que l'analyse a été sauvé avec succès
      my.window.webContents.send('analysis-saved')
    });
  }
  // Exporter l'analyse
  exportToPDF(){
    let my = this ;
    let printOptions = {
      marginsType:2,
      pageSize:"A4",
      landscape:false,
      printBackground:true
    }
    this.window.webContents.printToPDF(printOptions, (error, data) => {
        if (error) throw error
        fs.writeFile(my.pdf_path, data, (error) => {
          //Silent Print
          if (error) throw error
          // Confirmation du bon export
          this.window.webContents.send('pdf-successfully-writen', {pdf_path: my.pdf_path});
          console.log('Write PDF successfully.')
        })
    })

  }
  // Ouvrir le fichier PDF s'il existe
  openPDF(){

  }
}


// Ce module s'appelle Analyser dans main.js
const Analyser = {
    class: 'Analyser'

  , win: null // la fenêtre de main

  , current: null   // Instance de l'analyse courante

    /**
     * Méthode appelée par le bouton 'Ouvrir' pour ouvrir une analyse musicale
     */
  , open: function(win) {
      var my = this

      // Pour le moment, jusqu'à ce que ça fonctionne
      // Mettre `true` pour ne pas avoir à choisir l'analyse
      if(false){
        var p = '/Users/philippeperret/Programmation/MuScaT/_analyses_/SONATE-MOZARTInPlace';
        my.current = new Analyse({folder: p, window: win});
        if(my.current.is_valid()){return p}
      }

      var folder = my.askForAnalysisFolder()
      if (folder){
        // On la met en analyse courante
        my.current = new Analyse({folder: folder, window: win});
        if(my.current.is_valid()){
          console.log("Dossier analyse valide", my.current.folder)
          return my.current.folder
        }else{
          console.log("Dossier analyse invalide")
          my.current = null;
          return false;
        }
      }
    }
    /**
     * Méthode appelée par le menu pour ouvrir le dossier dans le bureau
     */
  , openFolder: function() {
      shell.openItem(this.current.folder)
    }
  , askForAnalysisFolder: function(win, msg) {
      var msg = msg || 'Dossier de l’analyse :' ;
      let openOptions = {
          defaultPath:  __dirname
        , message:      msg
        // , properties:   ['openDirectory']
        , properties:   ['openDirectory', 'createDirectory']
      }
      let files = dialog.showOpenDialog(openOptions);
      if(files){ return files[0] }
      else { return false }
    }
    /**
     * Méthode qui sauve à proprement parlé l'analyse
     * data = :path:, :code, :options
     * Les options :options, c'est pour dire par exemple si l'utilisateur
     * souhaite faire une nouvelle version de son code. Pour le moment, on
     * fait toujours une nouvelle version.
     */
  , save: function(data, win) {
      var my = this
      // console.log('-> Analyse#save');
      if(!my.current){
        // S'il n'y a pas d'analyse courante, il faut la créer (c'est-à-dire
        // demander son dossier)
        console.log("Demande de path pour la nouvelle analyse")
        let folder = my.askForAnalysisFolder(win)
        console.log("folder:", folder)
        if (!folder){return false}
        my.current = new Analyse({folder: folder, window: win});
      }
      my.current.save(data.code);
    }
    /**
     * Méthode appelée par le bouton 'Nouveau/New' pour créer une nouvelle
     * analyse.
     */
  , initNew: function(win) {
      var my = Analyser
      my.current = null;
      win.webContents.send('init-new-analysis')
    }
    /**
     * Pour exporter l'analyse courante vers PDF
     */
  , exportToPDF: function() {
      this.current.exportToPDF();
    }
  , openPDF: function() {
      this.current.openPDF();
    }
}

module.exports = Analyser
