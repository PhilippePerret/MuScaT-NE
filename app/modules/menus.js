'use strict'

const {app} = require('electron');
const path  = require('path')

const AppMenu = {
    class: 'AppMenu'
    // L'objet qui va contenir les données des menus
  , getMenuData: null
  , getMenu: function(id) {
      var d = this.getMenuData[id]
      if(undefined == typeof(d)) throw(`Menu <${id}> is not defined…`)
      // console.log("d:", d)
      var m = mainMenuBar.items[d[0]].submenu.items[d[1]] ;
      // console.log("m:", m)
      // Si hiérarchie plus profonde
      if (d.length > 2){ m = m.submenu.items[d[2]] }
      // console.log("m final:", m)
      return m ;
    }
  , enableMenus: function(ids_list) {
      this.setMenusState(ids_list, true)
    }
  , disableMenus: function(ids_list) {
      this.setMenusState(ids_list, false)
    }
  , setMenusState: function(id_menus, state) {
      var my = this
      for(var mid of id_menus){
        my.getMenu(mid).enabled = state
      }
    }

  , MULTISEL_MENUS: ['align-tag-top','align-tag-bottom','align-tag-left','align-tag-right', 'ajust-tags','group-tags']
  , CUR_ANALYSE_MENUS: ['save-analysis-menu-item', 'export-pdf','open-pdf-file', 'open-folder']
  , NEW_ANALYSE_MENUS: ['save-analysis-menu-item']
  , setMenusSelectionMultiple: function(on){
      var my = this
      my[on?'enableMenus':'disableMenus'](my.MULTISEL_MENUS)
    }

    // Construit le menu et le retourne
  , menuTemplate: function() {
      var my = this ;
      my.getMenuData = {}
      var mTemp = [
        {
            label: t('Analyse')
          , type: 'submenu' // for clarity
          , submenu: [
              {
                  label: t('new-analysis')
                , accelerator: 'CmdOrCtrl+N'
                , click: () => {
                  AppMenu.disableMenus(my.CUR_ANALYSE_MENUS)
                  AppMenu.enableMenus(my.NEW_ANALYSE_MENUS)
                  Analyser.initNew(win)
                }
              }
            , {
                  label: t('open-analysis')
                , accelerator: 'CmdOrCtrl+O'
                , click: () => {
                  let fpath = Analyser.open(win);
                  if (fpath){
                    // console.log('Dossier choisi : ', fpath);
                    mainWindow.webContents.send('tags-loaded', {
                        properties: 'of the analysis FOLDER'
                      , path: fpath
                      , analyse_name: path.basename(fpath)
                    })
                    AppMenu.enableMenus(my.CUR_ANALYSE_MENUS)
                  }
                }
              }
            , {
                  label: t('show-folder')
                , id: 'open-folder'
                , accelerator: 'CmdOrCtrl+Shift+N'
                , enabled: false
                , click: () => {Analyser.openFolder()}
              }
            , { type: 'separator' }
            , {
                  label: t('save-analysis')
                , accelerator: 'CmdOrCtrl+S'
                , click: () => {
                    win.webContents.send('get-tags-code');
                    // En cas de nouvelle :
                    AppMenu.enableMenus(my.CUR_ANALYSE_MENUS)
                }
                , enabled: false
                , id: 'save-analysis-menu-item'
              }
            , {type: 'separator'}
            , {label: t('export-pdf'), accelerator: 'CmdOrCtrl+E', click: () => {
                  Analyser.exportToPDF();
                }
                , enabled: false
                , id: 'export-pdf'
              }
            , {label: t('open-pdf'), accelerator: 'CmdOrCtrl+Shift+E', click:()=>{
                    Analyser.openPDF();
                }
                , enabled: false
                , id: 'open-pdf-file'
              }
            , {type: 'separator'}
            , {role: 'quit', accelerator: 'CmdOrCtrl+Q'}

          ]

          }
        , {
            label: t('Edit')
          , role: 'edit'
          , submenu:[
              {
                label: t('Paste'),
                role: 'paste'
              }
          ]
        }
        , {
            label: t('Tag')
          , submenu: [
              {
                  label: t('new-tag')
                , accelerator: 'CmdOrCtrl+T'
                , click:() => { win.webContents.send('new-tag') }
              }
            , {
                  label: t('del-tag')
                , id: 'delete-tag'
                , enabled: false
                , click:() => { console.log("Destruction de tag sélectionné") }
              }
            , {type: 'separator'}
            , {
                  label: t('Selection')
                , type: 'submenu'
                , id: 'group-multiselect'
                // , enabled: false // pas pour mac
                , submenu: [
                    {
                        label: t('align-tag-top')
                      , id: 'align-tag-top'
                      , enabled: false
                      , accelerator: 'CmdOrCtrl+L'
                      , click: () => { win.webContents.send('align-tags','top')}
                    }
                  , {
                        label: t('align-tag-bottom')
                      , id: 'align-tag-bottom'
                      , enabled: false
                      , click: () => { win.webContents.send('align-tags','bottom')}
                    }
                  , {
                        label: t('align-tag-left')
                      , id: 'align-tag-left'
                      , enabled: false
                      , click: () => { win.webContents.send('align-tags','left')}
                    }
                  , {
                        label: t('align-tag-right')
                      , id: 'align-tag-right'
                      , enabled: false
                      , click: () => { win.webContents.send('align-tags','right')}
                    }
                  , { type:'separator' }
                  , {
                        label: t('group-tags')
                      , id: 'group-tags'
                      , enabled: false
                      , accelerator: 'CmdOrCtrl+G'
                      , click:()=>{win.webContents.send('group-tags')}
                    }
                  , {
                        label: t('ajust-tags')
                      , id: 'ajust-tags'
                      , enabled: false
                      , accelerator: 'CmdOrCtrl+J'
                      , click:()=>{win.webContents.send('ajust-tags')}
                    }
                  ]
              }
          ]
        }
        , {
            label: t('Options')
          , type: 'submenu'
          , submenu: [
                {
                    label: t('Reference-lines')
                  , type: 'checkbox'
                  , id: 'references-lines'
                  , checked: false
                  , enabled: true
                  , click: () => {win.webContents.send('toggle-reference-lines')}
                }
            ]
          }
        , {
            label: t('Help')
          , role: 'help'
          , submenu: [
                {label: t('Manual'), click:()=>{console.log("Affichage du manuel demandé")}}
              , {type: 'separator'}
              , {label: 'Inspection', click: ()=>{
                    win.toggleDevTools();
                  }
                }
          ]
        }
      ];
      var dataMenuPreferences = {
            role: 'preferences'
          , label: t('Preferences')
          , accelerator: 'CmdOrCtrl+,'
          , click: () => {MainPrefs.show()}
        }
      if (process.platform === 'darwin') {
        mTemp.unshift({
            label: app.getName()
          , type: 'submenu'
          , submenu: [
              { role: 'about' }
            , { type: 'separator' }
            , dataMenuPreferences
            , { role: 'services' }
            , { type: 'separator' }
            , { role: 'hide' }
            , { role: 'hideothers' }
            , { role: 'unhide' }
            , { type: 'separator' }
            , { role: 'quit' }
          ]
        })
      } else if(process.platform === 'win'){
        // Pour window
        mTemp[2].submenu.push({type:'separator'})
        mTemp[2].submenu.push(dataMenuPreferences)
      } else {
        // Pour linux
        mTemp[1].submenu.push({type:'separator'})
        mTemp[1].submenu.push(dataMenuPreferences)
      }

      // Avant de construire le Menu, on mémorise les positions des menus
      // qui possède un identifiant pour pouvoir les retrouver par `getMenu(id)`
      var nbMainMenus = mTemp.length, nbSubMenus, nbSubSubMenus
        , iMainMenu, iSubMenu, iSubSubMenu
        , mainMenu, subMenu, subSubMenu
        ;
      for(iMainMenu = 0; iMainMenu < nbMainMenus; ++iMainMenu ){
        mainMenu = mTemp[iMainMenu]
        // mainMenu contient {label: 'Analyse', submenu: [] etc.}
        nbSubMenus = mainMenu.submenu.length
        for(iSubMenu = 0; iSubMenu < nbSubMenus; ++iSubMenu){
          subMenu = mainMenu.submenu[iSubMenu]
          if (subMenu.submenu){
            // Si c'est aussi un groupe de menu
            nbSubSubMenus = subMenu.submenu.length
            for(iSubSubMenu=0; iSubSubMenu < nbSubSubMenus; ++iSubSubMenu){
              subSubMenu = subMenu.submenu[iSubSubMenu]
              if(!subSubMenu.id){continue}
              my.getMenuData[subSubMenu.id] = [iMainMenu, iSubMenu, iSubSubMenu]
            }
          }
          if (!subMenu.id){ continue }
          // On l'enregistre dans les données pour pouvoir le récupérer facilement
          // par getMenu(id)
          // console.log("Ce menu a un ID:", subMenu, iMainMenu, iSubMenu)
          my.getMenuData[subMenu.id] = [iMainMenu, iSubMenu]
        }

      }//fin de boucle sur tous les menus principaux

      return mTemp
    }

}

module.exports = AppMenu
