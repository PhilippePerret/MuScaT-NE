/**
 * Pour la gestion des évènements
 *
 * Cet objet a été initié surtout à cause du problème de gestion des
 * flèches.
 */

const MEvents = {
    pour: 'virgule'

  , ARROWKEY_TO_PROP: {37: 'w', 38: 'h', 39: 'w', 40: 'h'}
  , ARROWKEYS_SENS:   {37: 'l', 38: 't', 39: 'r', 40: 'd'}

  /**
   * Pour écrire en console les données importantes de l'évènement
   * keypress
   */
  , console_key: function(ev){
      console.log(`keyCode:${ev.keyCode} | charCode:${ev.charCode} | which:${ev.which}`);
    }
  /**
   * Gestionnaire général des touches.
   * Normalement, on ne devrait faire appel qu'à lui, quelle que soit
   * la circonstance.
   */
  , onkeypress: function(ev) {
      // console.log('-> onkeypress');
      if(ULTags.activated){return true};
      if (!this.onkeypress_always(ev)){return};
      if (CTags.selections.length) {
        this.onkeypress_with_selection(ev);
      } else {
        this.onkeypress_else(ev);
      }
    }

  , onkeyup: function(ev){
      if(ULTags.activated){return true};
      if (!this.onkeyup_always(ev)){ return };
      if (CTags.selections.length) {
        this.onkeyup_with_selection(ev);
      } else {
        // this.onkeyup_else(ev);
      }
    }

  , onkeydown: function(ev){
      if(ULTags.activated){return true};
      if (!this.onkeydown_always(ev)){ return };
      if (CTags.selections.length) {
        this.onkeydown_with_selection(ev);
      } else {
        // this.onkeydown_else(ev);
      }
    }
  /**
   * Les flèches ne génèrent pas d'évènement keypress,
   */
  , onkeyup_with_selection: function(ev){
      // console.log('-> onkeyup_with_selection');
      if (ev.which == 87 /* w */ ){
        this.w_is_pressed = false; return stop(ev);
      } else if (ev.which == 72 /* h */){
        this.h_is_pressed = false; return stop(ev);
      }
      if (this.w_is_pressed || this.h_is_pressed){

      };
      if (this.w_is_pressed || this.h_is_pressed) {
        // Flèches avec "w" ou "y" appuyé
        switch (ev.keyCode) {
          case 37: // ALT + L  => diminuer en largeur (par la droite)
          case 38: // ALT + UP => diminuer en hauteur (par le haut)
          case 39: // ALT + R => diminuer en largeur (par la gauche)
          case 40: // ALT + DOWN => diminuer en hauteur par le bas
            prop = this.w_is_pressed ? 'w' : 'h' ;
            sens = this.ARROWKEYS_SENS[ev.keyCode];
            CTags.onEachSelected(function(itag){itag.resize(prop, sens, ev.shiftKey)})
            return stop(ev);
            break;
        }
      };
      // this.console_key(ev);
    }
  , onkeydown_with_selection: function(ev){
      // this.console_key(ev);
      // switch (ev.keyCode) {
      // };
      // console.log('-> onkeydown_with_selection');
      switch (ev.which) {
        case 87: /*  w */
        case 72: /* h  */
          var prop = ev.which == 87 ? 'w' : 'h';
          CTags.selection.resize(prop, ev.altKey, ev.shiftKey, ev.ctrlKey);
          return stop(ev);
        case 88: /*  x */
        case 89: /*  y */
          // l, t, r, d
          var sens = ev.which == 88 ? (ev.altKey ? 'l' : 'r') : (ev.altKey ? 't' : 'd')
          CTags.onEachSelected(function(itag){itag.move(sens, ev.shiftKey, ev.ctrlKey)});
          return stop(ev);
        default:
      }
      switch (ev.keyCode) {
        case 9:
          if(ULTags.activated){return true};
          CTags.selection.focus_litag();
          return stop(ev);
        case 37: // LEFT ARROW
        case 38: // UP ARROW
        case 39: // RIGH ARROW
        case 40: // DOWN ARROW
          sens = this.ARROWKEYS_SENS[ev.keyCode];
          CTags.onEachSelected(function(itag){itag.move(sens, ev.shiftKey, ev.ctrlKey)});
          return stop(ev);
      }
    }
  /**
   * Gestionnaire de touches qui est toujours appelé
   * S'il retourne true, on poursuit avec les autres gestionnaires, sinon
   * on s'arrête là.
   */
  , onkeypress_always: function(ev){
      if (ev.metaKey){
        switch(ev.charCode){
          case 122: // CMD Z / Annulation
            Historique.undo_last();
            return stop(ev);
        };
        // this.console_key(ev);
      };
      if(ev.charCode == 32 && this.onSpaceBar){
        this.onSpaceBar();
        this.onSpaceBar = null ;
        return stop(ev);
      };
      // this.console_key(ev);
      return true ;
    }

  , onkeyup_always: function(ev){
      switch (ev.which) {
        case 9:
          return stop(ev);
        case 27: // la touche escape, pour se tirer des mauvais pas
          // console.log('ESCAPE');
          return stop(ev);
      }
      // this.console_key(ev);
      return true ;
    }

  , onkeydown_always: function(ev){
      switch (ev.which) {
        // case 9:
        //   return stop(ev);
      }
      // this.console_key(ev);
      return true ;
    }
  /**
   * Gestionnaire d'évènements lorsqu'il y a une sélection mais qu'on
   * ne se trouve pas dans le champ de code
   */
  , onkeypress_with_selection: function(ev){
    // console.log('-> onkeypress_with_selection');
    if ( ev.metaKey ){
      switch(ev.charCode){
        case 103: // CMD G => Grouper/dégropuer
          CTags.grouper_selected();return stop(ev);
          break;
        default:
          // this.console_key(ev);
      }
    } else {
      switch (ev.charCode) {
        case 67: /* c */
          // console.log('touche c')
          return stop(ev);
      }
      switch (ev.keyCode) {
        case 13: /* ENTRÉE */
          ULTags.updateTag();return stop(ev);
        case 8:  // ERASE
          CTags.ask_for_erase(ev);return stop(ev);
        default:
        // Rien pour le moment
          // this.console_key(ev);
      };
    }
    return true ;
  },

  /**
   * Gestionnaire de touche pressée quand on n'est ni dans le champ
   * de code et qu'il n'y a aucune sélection
   */
  onkeypress_else: function(ev){
    // console.log('-> onkeypress_else');
    switch (ev.charCode) {
      case 13: /* ENTRÉE */
        return stop(ev);
      default:
    }
  }
}
window.onkeypress = $.proxy(MEvents,  'onkeypress') ;
window.onkeyup    = $.proxy(MEvents,  'onkeyup');
window.onkeydown  = $.proxy(MEvents,  'onkeydown');
