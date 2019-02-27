'use strict';

const { dialog } = require('electron')
const fs    = require('fs'); // file system
const ipc   = require('electron').ipcMain
const path  = require('path')

/**
 * Objet locales pour traiter les translations, les différentes langues
 * de l'application.
 */
const MSG = {}
const Locales = {
    class: 'Locales'
    /**
     * Méthode principale de traduction
     */
  , translate: function(msg_ids, args){
      var msg, k, rg, arr = new Array() ;
      // msg_ids peut être composé de plusieurs mots
      msg_ids.split(' ').forEach(function(msg_id){
        if('undefined' == typeof(MSG)){
          switch(msg_id){
            case 'value-option-required':
              msg = `Value of option '${args['option']}' is required.${RC}(la valeur de l'option '${args['option']}' est requise).`;
              break;
            case 'unknown-option':
              msg = `The '${args['option']}' option is unknown.${RC}(l'option '${args['option']}' est inconnue de nos services…).`;
              break;
            default:
              msg = `No translation for '${msg_id}'`;
          }
        } else {
          msg = MSG[msg_id];
          if(args){
            for(var k in args){
              rg = new RegExp(`%{${k}}`, 'gi');
              msg = msg.replace(rg,args[k]);
            }
          }
        }
        arr.push(msg);
      });
      return arr.join(' ');
    }

    /**
     * Méthode qui charge les fichiers de langue (fichier json)
     */
  , load: function(lang) {
      // ['messages', 'things', 'ui']
      let l = ['messages', 'things', 'ui'];
      for(var aff of l){
        var p = path.resolve(__dirname,'..','locales',lang,`${aff}.json`)
        Object.assign(MSG, JSON.parse(fs.readFileSync(p)))
        // Object.assign(MSG, JSON.parse(fs.readFileSync(`./app/locales/${lang}/${aff}.json`)))
      }
    }
}

module.exports = Locales
