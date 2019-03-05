/**
 * Objet pour gérer les cookies
 */
const Cook = {
    class: 'Cook'
  , data: null // Les données parsées au chargement

  /**
   * Définit une valeur en cookie
   */
  , set: function(key, value){
      document.cookie = `${key}=${value}`
    }
    /**
     * Récupère une valeur en cookie
     */
  , get: function(key){
      if(this.data === null){this.parse()}
      return this.data[key];
    }
    /**
     * Au chargement, parse les cookies
     */
  , parse: function(){
      var my = this ;
      my.data = {};
      if(!document.cookie.trim().length){return};
      for(var pair of document.cookie.split(';')){
        [key, value] = pair.trim().split('=');
        my.data[key.trim()] = value.trim() ;
      }
    }
}
