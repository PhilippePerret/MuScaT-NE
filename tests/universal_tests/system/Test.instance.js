'use strict'

const Test = function(test_name, src){
  // console.log(document.currentScript.src);
  this.name = test_name ;
  Tests.add_test(this);
  // this.script = document.currentScript.src;
  this.script = src
  // Liste des instances Case du test
  this.cases  = new Array();
}

window.Test = Test
/**
 * Quand on joue le test
 */
Test.prototype.run = function(){
  console.log(RC+RC);
  Tests.log(`${this.name} (${this.relative_path})`, STYLE2);
  if(Options.get('shuffle tests')){this.cases = shuffle(this.cases)}
  this.run_case(0);
};
Test.prototype.run_case = function(case_idx){
  // console.log(`-> Je passe au cas ${case_idx} du test ${this.name}`)
  var my = this;
  var cas = my.cases[case_idx];
  if(!cas){return Tests.next()};
  // On joue le test et on passe au suivant
  try {
    cas.run().then(my.run_case.bind(my, ++case_idx));
  } catch (e) {
    console.log(`ERROR TEST: ${e}`)
    return Tests.next()
  }
};
/**
 * Définition d'un cas du test
 */
Test.prototype.case = function(intitule, fn_test){
  this.cases.push(new TCase(intitule, fn_test));
};
Object.defineProperties(Test.prototype,{
    relative_path:{
      get: function(){
        if(undefined == this._relative_path){
          var borne = 'xlib/tests/tests';
          var index = this.script.indexOf(borne) + borne.length + 1 ;
          this._relative_path = this.script.substring(index, this.script.length) ;
        };
        return this._relative_path ;
      }
    }
})

const TCase = function(intitule, fn_test){
  this.intitule = intitule;
  this.fn       = fn_test;
};
TCase.prototype.run = function(){
  var my = this ;
  Tests.log(RC+`---> Cas : ${my.intitule}`, STYLE3);
  return new Promise(function(ok,ko){
    try{
      var res = my.fn();
      if(res && res.constructor.name == 'Promise'){
        // console.log('-> une PROMESSE => j’attends');
        res.then(ok);
      } else {
        ok();
      };
    } catch(err){
      Tests.add_sys_error(my, err);
    }
  });
};
