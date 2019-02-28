'use strict'

const Panels = {
    class: 'Panels'
  , items: null
  , selected: null    // Instance Panel du panneau courant (toujours défini)
  , init: function(){
      console.log('-> Panels.init()')
      var my = this
      my.items = []
      // TODO On relève tous les panneaux dans le DOM pour en faire des
      // class Panel
      $('#panels .panel').each(function(i, pan){
        my.items.push(new Panel($(pan)))
      })

      my.setDim()
      my.setLocales()
      my.setMenus()
      my.setValues()

      my.select(my.items[0]);
      console.log('<- Panels.init()')
    }
  , setDim: function(){
      var my = this
      // On définit les dimensions des éléments
      // Noter la virgule, ci-dessous, qui est normale
      $('#panels, .panel, #onglets-panels').css('height', `${MainPrefs.WIN_HEIGHT - 41}px`)
      $('#onglets-panels').css({'width': `${MainPrefs.ONGLETS_WIDTH}px`})
      $('#panels').css({
          'width': `${MainPrefs.WIN_WIDTH - MainPrefs.ONGLETS_WIDTH}px`
        , 'left':  `${1 + MainPrefs.ONGLETS_WIDTH}px`
      })
      $('#footer').css('width', `${MainPrefs.WIN_WIDTH - 30}px`)
    }
    /**
     * Localise le panneau
     *
     * Pour localiser un élément HTML, il suffit :
     *  - qu'il ait la class 'locale'
     *  - qu'une locale portant le nom "ui-<id élément>" soit définie
     */
  , setLocales: function(){
      $('.locale').each(function(i, o){o.innerHTML = t(`ui-${o.id}`)})
    }
    /**
     * Définit les <select>
     */
  , themes: ['muscat', 'fantasy', 'serioso']
  , languages: {'fr': 'Français', 'en': 'English'}
  , setMenus: function(){
      var options = []
      for(var i=7;i<41;++i){ options.push(`<option value="${i}">${i}</option>`)}
      $('.sizes-select').html(options.join(''))

      options = []
      for(var i=1;i<101;++i){ options.push(`<option value="${i}">${i}</option>`)}
      $('#animation_speed').html(options.join(''))

      options = []
      for(var theme of this.themes)
        {options.push(`<option value="${theme}">${theme}</option>`)}
      $('#theme').html(options.join(''))

      options = []
      for(var lg in this.languages)
        {options.push(`<option value="${lg}">${this.languages[lg]}</option>`)}
      $('#lang').html(options.join(''))
    }
    /**
     * Règle toutes les valeurs
     */
  , setValues: function(){
      for(var pid in PREFS){
        if (PREFS[pid] === false || PREFS[pid] === true){
          // <= Boolean
          // => Checkbox
          document.getElementById(pid).checked = PREFS[pid]
        } else {
          // <= Not Boolean
          // => value
          $(`#${pid}`).val(PREFS[pid])
        }
      }
    }
  , select: function(panel){
      var my = this
      if (my.selected){my.selected.deselect()}
      my.selected = panel
      my.selected.select()
    }
}
class Panel {
  constructor(jqObj){
    this._jqObj = jqObj
    this._id    = jqObj[0].id
    this._ongletId = `o-${this._id}`
    this.observeOnglet()
  }

  open(){

  }
  close(){

  }
  select(){
    this.onglet.addClass('selected')
    this.panel.addClass('visible')
  }
  deselect(){
    this.onglet.removeClass('selected')
    this.panel.removeClass('visible')
  }
  onClickOnglet(){
    Panels.select(this)
  }
  observeOnglet(){
    this.onglet.bind('click', this.onClickOnglet.bind(this))
  }
  get id()      { return this._id }
  get onglet()  { return $(`#${this._ongletId}`) }
  get panel()   { return $(`#${this.id}`) }
  get jqObj()   { return this._jqObj }
}
