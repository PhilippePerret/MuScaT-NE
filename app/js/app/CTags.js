
// Objet gérant les Tags dans leur ensemble (à commencer par
// les sélections)
const CTags = {
    class: 'CTags'
  , last_tag_id: 0      // Dernier ID attribué à un tag
  , selection: null    // La sélection courante (Tag)
  , selections: []     // Les sélections (Tag(s))
  , last_group_id: 0   // Pour les tags groupés

    /**
     * Initialisation
     */
  , reset: function(){
      var my = this ;
      for(var i = 1; i <= my.last_tag_id; ++i){ delete my[i] }
      my.selection    = null ;
      my.selections   = [] ;
      my.last_tag_id  = 0 ;
      my.length       = 0 ;
      Page.table_analyse[0].innerHTML = '' ;
    }

  /**
   * Exécute la méthode +method+ sur tous les tags
   */
  , onEachTag: function(method, options){
      var i = 1, len = this.length ;
      if(options && options.from){i = options.from}
      if(options && options.to){len = options.to + 1}
      // console.log(`Boucle dans onEachTag de ${i} à ${len} (length=${this.length})`);
      for(i;i<=len;++i){method(this[i], i)};
    }

  /**
   * Pour répéter une opération sur tous les éléments sélectionnés
   */
  , onEachSelected: function(method){
      for(var itag of this.selections){
        method(itag);
      }
    }

    /**
      * Reçoit une ligne de code de TAG et retourne une table des
      * données qui en sont tirées.
      *
      * TODO Faire de cette méthode la seule qui analyse une ligne de
      * données de Tag. Il faut qu'elle soit complète et fiable.
      */
  , parseLine: function(str){
      var h = {} ;
      str = str.trim().replace(/[\t ]/g, ' ') ;
      str = str.replace(/ +/g, ' ') ;
      str.split(' ').forEach(function(paire){
        [prop, value] = paire.split('=');
        h[prop] = value || true ;
      });
      if (h.left)   { h.x = delete h.left   };
      if (h.top)    { h.y = delete h.top    };
      if (h.width)  { h.w = delete h.width  };
      if (h.height) { h.h = delete h.height };
      ['x','y'].forEach(function(prop){
        if(h[prop]){h[prop] = asPixels(h[prop])}
      });
      ['w','h'].forEach(function(prop){
        if(h[prop]){
          var pair = valueAndUnitOf(h[prop]);
          h[prop] = pair[0] ;
          h[`${prop}_unit`] = pair[1];
        };
      });
      return h ;
    }

  /**
    * Inverse de la précédente
    * Reçoit {x: 120, y: 130} et retourne " x=120 y=130"
    * TODO Faire aussi de cette méthode une méthode générale/générique
    */
  , compactLine: function(h){
      var arr = new Array();
      for(var k in h){arr.push(`${k}=${h[k]}`)};
      return arr.join(' ')
    }


  , push: function(itag){
      if(undefined == itag.id){itag.id = ++ this.last_tag_id;}
      this[itag.id] = itag;
      this.length += 1 ;
      return itag; // pour chainage
    }

    /**
     * Méthode principale de sélection
     *
     * La méthode appelle aussi le main process pour activer/désactiver
     * les menus qui sont accessibles lorsqu'il y a plusieurs sélections
     */
  , onSelect: function(itag, with_maj){
      var my = this ;
      if (itag.selected){
        // console.log('-> itag est sélectionné')
        // Si c'est une reselection de l'élément déjà sélectionné,
        // on le désélectionne
        my.remove_from_selection(itag);
      } else {
        if (false == with_maj) { my.deselectAll() }
        my.selections.push(itag);
        itag.select();
        my.selection = itag ;
      }
      my.setMenusMultiSelection()
    } // onSelect

  , deselectAll: function(){
      var my = this ;
      my.selections.forEach(function(el){el.deselect()})
      my.selections = new Array();
      my.selection  = null ;
      my.setMenusMultiSelection()
    }

    /**
     * Méthode qui demande à modifier les menus lorsqu'il y a une
     * sélection multiple.
     * Noter que la méthode peut être appelée plusieurs fois de suite,
     * c'est la raison pour laquelle on conserve le dernier état pour
     * ne modifier que si nécessaire.
     */
  , setMenusMultiSelection: function(){
      var my = this ;
      if (my.stateMultiActived === my.selections.length > 1){return}
      // Sinon, il faut changer l'état
      my.stateMultiActived = my.selections.length > 1 ;
      IPC.send('set-menus-multiselections', my.stateMultiActived)
    }

  /**
   * Pour retirer le tag +itag+ de la sélection courante
   * (lorsqu'il n'est pas le tag courant)
   */
  , remove_from_selection: function(itag){
      var my = this ;
      if(itag == my.selection){
        // Si le tag est le tag courant
        my.selections.pop();
        my.selection = null;
      } else {
        // Si le tag n'est pas le tag courant
        var new_selections = new Array();
        for(var tg of my.selections){
          if(tg.id == itag.id){continue};
          new_selections.push(tg);
        }
        my.selections = new_selections;
      };
      // Et on finit par le déselectionner
      itag.deselect();
      my.setMenusMultiSelection()
    }

  // Méthode appelée quand on veut aligner des éléments
  , align: function(alignement) {
      var my = this ;
      if (undefined == alignement){alignement = 'top'}
      if (my.selections.length < 2) { error(t('thinks-to-align-required')) }
      else {
        var referent = my.selections[0] ;
        var value, method ;
        switch (alignement) {
          case 'top':
            prop = 'y'; value = referent.y ;
            break;
          case 'bottom':
            prop = '-y' ; value = referent.y + referent.jqObj.height();
            break;
          case 'left':
            prop = 'x' ; value = referent.x ;
            break;
          case 'right':
            prop = '-x' ; value = referent.x + referent.jqObj.width();
            break;
          default:
        }
        my.onEachSelected(function(itag){itag.update(prop, value)})
      }
    }

  /**
   * Méthode appelée par le bouton outil "Grouper", quand il y a plusieurs
   * sélections, pour les grouper ou les dégrouper.
   */
  , grouper_selected: function(){
      if ( !this.selections[0].group ) {
        var new_group = new TagsGroup();
        this.onEachSelected(function(itag){itag.add_in_group(new_group)});
      } else {
        this.selections[0].group.ungroup();
      }
    }

  /**
   * Appelée par un bouton outil pour répartir les images sélectionnées.
   * Normalement, ce sont des images de système. On les répartit régulièrement
   * entre le plus haut et le plus bas verticalement.
   */
  , repartir_selected: function(){
    // Dans un premier temps, il faut trouver le plus haut
    var my = this
      , upper = null
      , lower = null
      ;
    // On classe les éléments par hauteur
    var sorteds = my.selections ;
    sorteds.sort(function(a,b){
      return a.y - b.y ;
    });

    var upper = sorteds[0] ;
    var lower = sorteds[sorteds.length - 1];
    var dist = lower.y - upper.y ;
    // console.log('dist:', dist);

    // TODO Faut-il considérer la hauteur de l'élément le plus bas, pour
    // répartir visuellement ?
    var esp = Number.parseInt(dist / (my.selections.length - 1),10);

    var i = 0 ;
    sorteds.forEach(function(itag){
      itag.update('y', upper.y + (i++ * esp)) ;
    });

  }

  /**
   * Méthode directement appelée lorsque l'on clique sur un TAG
   * quelconque
   *
   * +ev+ est l'évènement click, mais il peut être null aussi.
   */
  , onclick: function(itag, ev){
    // On traite le clic sur l'élément courant
    if(itag.group){
      ev.shiftKey = true;
      itag.group.onEachTag(function(itag){itag.onClick(ev)})
    } else {
      if( !itag.locked ) {
        itag.onClick(ev);
      }
    }
    return stop(ev);
  },

  // ---------------------------------------------------------------------
  // Méthode d'action sur la sélection

  /**
   * Retourne la valeur du pas en fonction des modifiers qui sont
   * activés :
   *  - La touche majuscule aggrandit le pas
   *  - La touche ALT le diminue
   */
  pas_by_modifiers: function(ev){
    if(ev.shiftKey){
      return 50 ;
    } else if (ev.altKey) {
      return 1 ;
    } else {
      return 10 ;
    }
  },
  moveUpSelection: function(ev) {
    this.changeSelection('y', -this.pas_by_modifiers(ev)) ;
  },
  moveDownSelection: function(ev) {
    this.changeSelection('y', this.pas_by_modifiers(ev)) ;
  },
  moveRightSelection: function(ev) {
    this.changeSelection('x', this.pas_by_modifiers(ev)) ;
  },
  moveLeftSelection: function(ev) {
    this.changeSelection('x', -this.pas_by_modifiers(ev)) ;
  },
  changeSelection: function(prop, value){
    var my = this;
    my.selections.forEach(function(itag){
      itag[prop] += value ;
      itag.update();
    })
  }

  , ask_for_erase: function(ev){
    var my = this ;
    var nb = my.selections.length ;
    var msg ;
    if (nb > 1) {
      msg = t('all-selected', {nombre: nb})
    } else {
      msg = t('the-element', {ref: my.selections[0].ref});
    }
    F.ask(t('should-destroy', {what: msg}), {onOK: $.proxy(CTags,'erase_selections')});
  }

  , erase_selections: function(){
      var my = this ;
      my.onEachSelected(function(itag){itag.update('destroyed', true)});
    }

  , lines_selected_in_clipboard: function(){
      var my = this, arr = new Array() ;
      my.onEachSelected(function(itag){
        arr.push(itag.to_line());
      });
      clip(arr.join(RC) + RC);
      F.notify(t('code-lines-in-clipboard'));
    }
};
Object.defineProperties(CTags,{

    property: {'value':'virgule'}
    // Retourne le nombre de Tag(s) consignés
  , length:{
      get:function(){return this._length || 0},
      set:function(val){this._length = val}
  }
})
