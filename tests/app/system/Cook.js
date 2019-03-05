'use string'

var t = new Test("Test de l'objet Cook", __filename)

t.case("L'objet contient les fonctions requises", function(){
  assert_function('get', Cook)
  assert_function('set', Cook)
  assert_function('parse', Cook)
})

t.case("L'objet contient les objets requis", function(){
  assert_object('data', Cook)
})

t.case("La méthode Cook#set permet de définir les cookies", function(){
  var uneerreur = null
  try {
    Cook.set('cookie-test', 'valeurducookietest')
  } catch (e) {
    uneerreur = e
  }
  assert(uneerreur === null)
})

// t.case("La méthode parse permet de parser les cookies", function(){
//   Cook.set('cookie-test', 'valeurducookietest')
//   Cook.data = null
//   Cook.parse()
//   console.log(Cook.data)
//   assert_equal({'cookie-test': 'valeurducookietest'}, Cook.data)
// })
