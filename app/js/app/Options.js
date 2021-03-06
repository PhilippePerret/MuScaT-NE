/**
 * Class Options
 * -------------
 * Pour la gestion des options
 */
 // Les options utilisables
 const OPTIONS = {
   // Note : `user_name` permet de garder la trace du nom de l'option que l'user
   // à employée, en cas de "aka" pour lui redonner la même.
     'animation speed':             {boolean: false, value: null, default: 50, user_name: null}
   , 'coordonates':                 {boolean: true, value: false} // afficher les coordonnées lors des déplacementss
   , 'lines of reference':          {boolean: true, value: false} // si true, affiche les lignes de guide
   , 'space between scores':        {boolean: false, value: null, default: 10}
   , 'top first score':             {boolean: false, value: null}
   , 'left margin':                 {boolean: false, value: null}
   , 'horizontal line offset':      {boolean: false, value: null, default: 46}
   , 'theme':                       {boolean: false, value: null}
   , 'visor':                       {boolean: true, value: null, default: false}
   , 'vertical line offset':        {boolean: false, value: null, default: 42}
   , 'shuffle tests':               {boolean: true, value: null, default: true}
 }

 // pour ajouter une option
 window.options = function(){
   Options.set(arguments);
 }
 window.option = window.options;

const Options = {
    class: 'Options'
    /**
     * Retourne la valeur de l'option d'identifiant opt_id ou sa valeur
     * par défaut si elle est définie,
     * Ou undefined si l'option n'existe pas
     */
  , get: function(opt_id, options) {
      if (undefined == options){options = {}}
      if (undefined == OPTIONS[opt_id]){
        if(options.no_alert != true){
          error(t('unknown-option', {option: opt_id}));
        }
        return undefined ;
      } else if (OPTIONS[opt_id].aka){
        opt_id = OPTIONS[opt_id].aka ;
      }
      return OPTIONS[opt_id].value || OPTIONS[opt_id].default ;
    }

  , set: function(){
      var opt, opt_id ;
      try {
        // console.log('args: ', arguments);
        // var seq_options = arguments.entries();
        var seq_options = [];
        for(var arg of arguments[0]){
          seq_options.push(arg);
        };

        seq_options = seq_options.entries();
        while(dopt = seq_options.next().value){
          opt_id = dopt[1] ;
          opt_id_init = `${opt_id}`;
          // console.log('Traitement de opt_id: ', opt_id);
          if(undefined == OPTIONS[opt_id]){
            error(t('unknown-option', {option: opt_id}));
            continue;
          }

          if (OPTIONS[opt_id].aka) {
            opt_id = OPTIONS[opt_id].aka ;
          }
          doption = OPTIONS[opt_id] ;
          doption.user_name = opt_id_init;
          if (doption.boolean) {
            OPTIONS[opt_id].value = true ;
          } else {
            err_msg = t('value-option-required', {option: opt_id});
            var nextopt = seq_options.next() ;
            if (nextopt.value){
              var valopt = nextopt.value[1] ;
              if(undefined == OPTIONS[valopt]){
                // C'est une vraie valeur
                OPTIONS[opt_id].value = valopt ;
              } else {
                // Puisque la valeur est un id d'option, c'est un oubli
                error(err_msg);
              }
            } else {
              // La valeur a été oubliée
              error(err_msg);
            }
          }
        };
      } catch (err) {
        console.error(err);
      } finally {
        return true ;
      }
    }

    /**
     * Construit et retourne le texte qui doit être inscrit dans le
     * code de _tags_.js
     *
     * Note : c'est une méthode asynchrone car elle demande à l'utilisateur
     * s'il faut enregistrer la position des lignes de repère.
     */
  , to_tags_js: function(memo_guides){
      var   my = this
          , opts = new Array()
          , opt
          , val
          ;
      // Dans le cas spécial des repères, on demande s'il faut prendre
      // la nouvelle position ou garder l'ancienne
      if (undefined === memo_guides){
        opt_vline = OPTIONS['vertical line offset'].value ;
        opt_hline = OPTIONS['horizontal line offset'].value ;
        if (opt_vline || opt_hline){
          cur_vline = $('#refline_v').offset().top  ;
          cur_hline = $('#refline_h').offset().left ;
          req_vline = opt_vline && opt_vline != cur_vline ;
          req_hline = opt_hline && opt_hline != cur_hline ;
          if (req_vline || req_hline){
            dask = {
              onOK: $.proxy(my, 'to_tags_js', true),
              onCancel: $.proxy(my, 'to_tags_js', false)
            }
            F.ask(t('memo-guides-offsets'), dask);
            return ; // en attendant de revenir
          }
        }
      } else {
        if (memo_guides === true){
          OPTIONS['vertical line offset'].value = $('#refline_v').offset().top;
          OPTIONS['horizontal line offset'].value = $('#refline_h').offset().left;
        }
      }
      for(opt in OPTIONS){
        if(OPTIONS[opt].aka){continue};
        var opt_user_name = OPTIONS[opt].user_name||opt;
        if(OPTIONS[opt].boolean){
          if (OPTIONS[opt].value) {opts.push("'" + opt_user_name + "'")};
        } else if (val = OPTIONS[opt].value) {
          if ('string' == typeof(val)){ val= "'"+val+"'"}
          opts.push("'" + opt_user_name + "', " + val);
        };
      };
      if (opts.length){
        opts = 'options(' + opts.join(', ') + ') ;' + RC + RC ;
      } else {
        opts = '' ;
      };
      return M.build_very_full_code(opts); // ~asynchrone
    }

    // Pour remettre toutes les options à false (utile pour les tests)
  , reset: function(){
      for(var k in OPTIONS){
        if (OPTIONS[k].aka){continue}
        else {OPTIONS[k].value = null};
      }
    }
};
