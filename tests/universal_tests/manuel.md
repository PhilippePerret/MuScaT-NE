# Universal Test

Permet de faire des tests de façon très simple, dans l'application elle-même (ce qui produit autant de limites que d'avantages).

## Instalation des tests

Il suffit d'appeler la méthode :

```javascript
  require('./tests/universal_tests/require.js')
```

## Définition des tests

On les définit soit dans le dossier `./tests/universal_tests/app` soit dans le dossier `./tests/app/`.

Une feuille de test ressemble simplement à :

```javascript
'use strict'

var t = new Test("Mon nouveau test", __filename)

t.case("C'est un nouveau cas", function(){
  // ... ici le code du nouveau cas
  assert(true, 'doit être vrai')
})
```
