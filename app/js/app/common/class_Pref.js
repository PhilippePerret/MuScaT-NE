'use strict'

const DATA_PREFS = require('./data_prefs.js')

class Pref {
  constructor(pid){
    this.data = DATA_PREFS[pid]
    this._id = pid
  }
  get id() { return this._id }
  set value(v){ this._value = v}
  get value() { return this._value || this.data.defValue }
  // Valeurs de transformation
  get fct()   { return this.data.fct }
  get tag()   { return this.data.tag }
  get dom()   { return this.data.dom }
  get prop()  { return this.data.prop }
  get u()     { return this.data.u }
  /**
   * Applique la préférence courante.
   *
   * Noter que la valeur (this.value) est toujours définie. C'est la valeur
   * par défaut en cas d'absence d'autre définition. On peut la passer aussi
   * en premier argument de la fonction.
   */
  apply(value) {
    if ('undefined' != typeof(value)){this.value = value}

    if (this.fct){
      // <= Une fonction est définie pour traiter la préférence
      // => On l'appelle avec la valeur courante
      this.fct(this.value)
    } else if (this.dom) {
      // <= Un objet DOM est défini
      // => On le prend pour lui appliquer les valeurs
      var jqRef = `${this.tag ? '#tags .tag' : ''}${this.dom}`
      log(`[TABLE] jqRef:${jqRef} => "${this.prop}": "${this.value}${this.u}"`)
      $(jqRef).css(this.prop, `${this.value}${this.u}`)
    } else {
      F.error(`Je ne sais pas traiter la préférence "${this.id}"`)
    }
  }

}


module.exports.Pref = Pref
module.exports.DATA_PREFS = DATA_PREFS
