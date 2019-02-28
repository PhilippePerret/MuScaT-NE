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
     */
  , setLocales: function(){
      // var l = ['ok']
      // for(var suf of l){
      //   $(`.ui-${suf}`).html(t(`ui-${suf}`))
      // }
      $('.locale').each(function(i, o){
        o.innerHTML = t(`ui-${o.id}`)
      })
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
