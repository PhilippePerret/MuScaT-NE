
function  write(str) {
  $('body').append('<div>' + str + '</div>')
}

const UI = {
    pour: 'virgule'
  , TOP_FIRST_PAGE_END: 1150
  , HEIGTH_PRINTED_PAGE: 1230

  , tableAnalyse: null        // {jQuery} La section #tags

  , init: function(){
      UI.setInterface = UI.setInterface.bind(UI);
      UI.set_ui = UI.set_ui.bind(UI);
      UI.setInterface();
    }
    /**
     * Méthode appelée lorsque la page est chargée (Electron).
     */
  , setInterface: function(){
      // On règle la dimension du champ de code, pour qu'il occupe bien toute
      // la hauteur de la page
      let h = $(window).height() - $('#footer').height();
      let innerH = h - 100 ;
      // $('#div-ultags').css('height', `${h}px`);
      $('#code-column').css({'height':`${h}px`,'min-height':`${h}px`});
      $('#div-ultags, ul#ultags').css({'height':`${innerH}px`,'min-height':`${innerH}px`});
      // console.log("hauteur de div-code à:", h, innerH);
      this.set_ui();
      // Pour notamment réagir au click sur la table d'analyse
      Page.observe();
    }

    , toggleVisor: function(visible){
        log(`Je vais mettre le viseur à ${visible}`)
      }
    , toggleReferenceLines: function(visible){
        log(`Je vais mettre les lignes de référence à ${visible}`)
      }
      /**
       * Application du thème +theme+
       *
       * Utilisée principalement au chargement d'une analyse, par les
       * préférences
       */
    , setTheme: function(theme) {
        log(`Je vais appliquer le thème ${theme}`)
      }
      /**
       * Application de la langue +lang+ à l'interface
       *
       * Utilisée principalement au chargement d'une analyse, par les
       * préférences
       */
    , setLang: function(lang) {
        log(`Je vais appliquer la langue ${lang}`)
      }
    /**
     * Méthode pour définir l'interface en fonction de la langue
     *
     * C'est aussi cette méthode qui dessine des lignes repères pour
     * les sauts de page.
     */
  , set_ui: function(){
      this.tableAnalyse = $('#tags');
      this.ulTags       = $('ul#ultags');
      // Le mieux, c'est la tournure ci-dessous, où l'on met "t-<id locale>"
      // dans la classe de l'élément, qui renvoie à "<id locale>"
      ['clipboard', 'source-code', 'selected-tags', 'Open', 'the-help', 'sur', 'operations'].forEach(function(tid){
        $(`.t-${tid}`).text(t(tid));
      });
      $('#fs-alignment-legend').text(t('alignment'));
      $('#Align-the').html(t('Align the'));
      $('.Align').html(t('Align'));
      $('.to-up').text(t('to-up'));
      $('.to-down').text(t('to-down'));
      $('.to-left').text(t('to-left'));
      $('.to-right').text(t('to-right'));
      $('.the').text(t('the'));
      // Pour pouvoir répartir les scores
      $('#verb-repartir').text(t('Arrange'));

      // Les deux lignes qui indiquent les marges gauche/droite
      for(var i = 0; i < 10 ; ++i){
        var top = this.TOP_FIRST_PAGE_END + Number.parseInt(this.HEIGTH_PRINTED_PAGE * i) ; // +10 pour la marge top
        $('body').append(`<div class="page-break" style="top:${top}px;"></div>`);
      };
    }
};
Object.defineProperties(UI,{
    property: {'pour':'virgules'}
})

// Permet de stopper complètement n'importe quel évènement
window.stop = function(ev){
  ev.stopPropagation();
  ev.preventDefault();
  return false
}

window.onresize = function(ev){
  ULTags.setULHeight();
}
