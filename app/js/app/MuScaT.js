/*
  Gestion de la partition
  -----------------------

  Class MuScaT (alias : M)
  -------------

*/
// La classe principale
// MuScaT pour "Mu Sc Ta (à l'envers)" pour "Music Score Tagger"
const MuScaT = {
    class: 'MuScaT'

    // Version nodejs/Electron, le path absolu au dossier d'analyse
  , analyse_folder_path: null

    // Version nodejs/Electron, le path au fichier analyse _tags_.js
  , analyse_file_path: null

    // Version de l'analyse, si elle est définie
  , analyse_version: null

    // Indique que l'analyse a été modifiée (pas encore utilisé)
  , analyse_modified: false

    // Liste des erreurs rencontrées (sert surtout aux textes)
  , motif_lines_added: null

    // Pour les tests, pour savoir que le premier fichier tags.js a été
    // chargé et ne pas le charger à chaque fois
  , tags_file_loaded: false

    // Exécute la fonction +method+ sur toutes les lignes de la
    // constante Tags.
  , onEachTagsLine: function(method){
      var  i = 0, lines = Tags.trim().split(RC), len = lines.length ;
      for(i;i<len;++i){method(lines[i])};
    }

    /**
     * Nouvelle méthode utilisant les promises pour charger tous les
     * premiers éléments asynchrones.
     */
  , preload: function(){
      return new Promise(function(ok, ko){
        Theme.PLoad()
          .then(ok)
      })
    }

  , loading_error: function(){
      F.error(function(){
        switch(M.lang){
          case 'en':
            return 'An error occured. Can’t launch MuScaT, sorry.';
            break;
          default:
            return 'Une erreur fatale est malheureusement survenue. Je ne peux pas lancer MuScaT…';
          }
        }());
    }
  , load_analyse_of: function(analyse_file_path){
      var nodetags;
      return new Promise(function(ok, ko){
        nodetags = document.body.appendChild(document.createElement('script'));
        nodetags.id = 'script_tags_js';
        try {
          // Avant, avec un navigateur :
          // nodetags.src = `_analyses_/${analyse_folder_name}/_tags_.js`;
          // Maintenant, avec node.js/Electron
          nodetags.src = analyse_file_path;
          D.dv('tags.js src', nodetags.src, 4);
        } catch (e) {
          $(nodetags).remove();
          return ko();
        };
        $(nodetags)
          .on('load', ok)
          .on('error',function(e){
            // console.error(e);
            $(nodetags).remove();
            ko();
          });
      })
    }

  , start_and_run: function(){
      D.dfn('MuScat#start_and_run');
      return new Promise(function(ok,ko){
        // On doit construire les éléments d'après les définitions faites dans
        // le fichier tag.js
        M.load()
          .then(M.postLoad)
          .then(function(){
            D.d('--- END STARTUP ---');
            ok();
          })
          .catch(function(err){
            console.error('Une erreur s’est produite');
            console.error(err);
          });
      });
    }

    /**
     * Quand l'animation est demandée
     */
  , run_animation: function(){
      this.loadModule('Anim').then(function(){Anim.start()});
    }
    /**
     * Chargement du fichier _tags_.js, analyse du code et construction de
     * l'analyse sur la table.
     */
  , load: function(){
      D.dfn('Muscat#load')
      var my = this
      return new Promise(function(ok,ko){
        my.load_analyse_of(my.analyse_file_path)
          .then(function(){
            if ('undefined' == typeof Tags) {return alert(t('tags-undefined'))};
            M.reset_all();
            M.parse_tags_js();
            M.build_tags();
            M.traite_images()
              .then(ok);
          })
      });
    } // Fin du chargement des éléments

  , postLoad: function(){
      D.dfn('MuScaT#postLoad');
      return new Promise(function(ok,ko){
        // On met le titre du dossier d'analyse
        $('span#analyse_name').text(M.analyse_name);

        // Pour une raison pas encore expliquée, il arrive que les
        // éléments se bloquent et ne prenent plus leur position
        // absolute (bug dans le draggable de jQuery).
        // Donc, ici, on s'assure toujours que les éléments draggable
        // soit en bonne position
        // On fera la même chose, un peu plus bas, avec les lignes de
        // référence
        CTags.onEachTag(function(tg){tg.jqObj.css('position','absolute')});

        // Dans tous les cas, on construit les liTags
        ULTags.build();
        // Si c'est une animation, on est prêt à la jouer
        if(M.animated){M.run_animation()};
        ok();
      });
    }
  , traite_images: function(){
      D.dfn('MuScaT#traite_images');
      return new Promise(function(ok,ko){
        if (M.treate_images_spaces) {
          Page.wait_to_treate_images_spaces().then(ok);
        } else {
          Page.wait_for_images().then(ok);
        }
      });
    }

  /**
   * Méthode qui construit les tags sur la table
   *
   * Note les watchers ne sont pas placés, ici, car ils le seront
   * d'un seul coup (cette méthode est seulement appelée par load)
   */
  , animated: false
  , build_tags: function(){
      var my = this ;
      // On construit d'abord tous les tags, mais en les masquant si c'est
      // pour une animation.
      CTags.onEachTag(function(itag){
        if(itag.real){itag.build({visible: !my.animated})};
        if(itag.is_anim_start){my.animated = true}
      });
    }

    /**
     * Construit (de façon asychrone) le code complet du fichier _tags_.js
     */
  , build_very_full_code: function(options_to_tags_js){
      var my = this ;
      // TODO définir la version de l'application
      options_to_tags_js = RC+RC + '// Version X.X' + RC+RC ;
      return options_to_tags_js + 'Tags = `'+ RC + this.full_code() + RC + '`;';
    }

  // Retourne le code complet des lignes de tags
  , full_code: function(){
      var arr = new Array() ;
      ULTags.onEachLITag(function(litag){
        arr.push(CTags[litag.id].to_line());
      })
      return arr.join(RC) ;
    }

  /**
   * Méthode qui prend le code du fichier Tags.js et le décompose pour
   * en tirer le code de l'analyse.
   */
  , parse_tags_js: function(){
      var my = this, itag ;
      my.check_sequence_image_in_tags();
      my.onEachTagsLine(function(line){
        var t = new Tag(line)
        if(t.isValid){CTags.push(t)}
      });
    }

  /**
   * Méthode qui, avant toute autre opération sur les lignes de la donnée
   * Tags, regarde s'il n'y a pas une séquence d'images à traiter
   * Si c'est le cas, elle modifie le code pour que cette séquence soit
   * bien traitée.
   *
   * Note : l'option 'espacement images' peut modifier l'espacement par
   * défaut
   */
  , check_sequence_image_in_tags: function(){
      var my = this
        , lines_finales = new Array()
        , rg
        ;
      my.onEachTagsLine(function(line){
        if(rg = line.match(/^([^\/].*)\[([0-9]+)\-([0-9]+)\]([^ ]+)( (.*))?$/)){
          my.treate_as_sequence_images(rg, lines_finales);
        } else {
          lines_finales.push(line);
        }
      })
      Tags = lines_finales.join(RC);
    }
  , treate_as_sequence_images: function(dreg, lines_finales) {
      var my          = this
        , bef_name    = dreg[1]
        , from_indice = Number.parseInt(dreg[2], 10)
        , to_indice   = Number.parseInt(dreg[3], 10)
        , suffix      = dreg[4]
        , aft_name    = (dreg[5]||'')
        , src_name
        , itag
        , i = from_indice
        , data_img    = CTags.parseLine(aft_name)
        , images_list = new Array()
        ;

      var left      = asPixels(getPref('marge gauche') || DEFAULT_SCORE_LEFT_MARGIN) ;
      var top_first = asPixels(getPref('marge haut') || DEFAULT_SCORE_TOP_MARGIN) ;
      var voffset   = asPixels(getPref('espacement images')) ;

      // Pour indiquer qu'il faut calculer la position des images en fonction
      // de 1. l'espacement choisi ou par défaut et 2. la hauteur de l'image
      my.treate_images_spaces = true ;

      // Il faut étudier aft_name pour voir si des données de position ou de
      // taille sont définies
      if (data_img.x) {
        // console.log('La marge gauche est définie à ', data_img.x);
      } else {
        data_img.x = asPixels(left) ;
      }
      if (data_img.y) {
        // console.log("La marge haute est définie à ", data_img.y)
        top_first = asPixels(data_img.y) ;
      } else {
        data_img.y = top_first - voffset ; // -voffset pour éviter une condition ci-dessous
      }
      if (data_img.w) {
        // console.log("La largeur est définie à ", data_img.w);
      };
      // if (data_img.h){
      //   console.log("La hauteur est définie à ", data_img.h);
      // }
      for(i;i<=to_indice;++i){
        // Placement vertical provisoire. La vraie position sera recalculée dans
        // Page.treate_images_spaces
        data_img.y += voffset ;
        lines_finales.push(`${bef_name}${i}${suffix} ${CTags.compactLine(data_img)}`);
      };
      M.motif_lines_added = t('image-sequentielle');
    }


  // ---------------------------------------------------------------------
  // Méthodes fonctionnelles

  // Pour tout réinitialiser chaque fois qu'on actualise l'affichage
  // Pour les tests, appeler plutôt `reset_for_tests` (qui appelle aussi
  // celle-ci)
  , reset_all: function(){
      var my = this ;
      my.errors = new Array();
      CTags.reset();
      ULTags.reset();
      my.treate_images_spaces = false ;
      my.motif_lines_added    = null ;
    }

  , loadModule: function(module_name){
      return new Promise(function(ok,ko){
        var nod = document.body.appendChild(document.createElement('script'));
        nod.src = `./js/modules/${module_name}.js`;
        $(nod)
          .on('load', ok)
          .on('error', function(e){
            F.error(t('loading-module-failed', {name: module_name}));
          })
      });
  }
};
Object.defineProperties(MuScaT,{
  // Langue de l'application (on la change avec l'option 'lang'/'langue')
  lang:{
    get: function(){ return Prefs.get('lang').toLowerCase() } // 'fr par défaut'
  }
    /**
     * Le dossier contenant les images de l'analyse courante
     */
  , images_folder: {
      get:function(){
        if(!this._images_folder){
          // // Avant (dans chrome)
          // this._images_folder = `_analyses_/${this.analyse_name}/images`;
          // Maintenant avec nodejs/Electron
          this._images_folder = `${this.analyse_folder_path}/images`;
        };
        return this._images_folder;
      }
      , set: function(value){
          // Pour les tests, on a besoin de redéfinir le path des images
          this._images_folder = value;
        }
    }

})

// Alias
const M = MuScaT ;
