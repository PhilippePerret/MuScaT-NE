# Préférences

## Création d'une nouvelle préférence

* Créer son outil de réglage dans le fichier `app/prefs.html` (dans un `div.div-pref`),
* Localiser son label en lui donnant la class `locale` et en utilisant `ui-<id de la pref>` comme ID de locale dans les fichiers des locales,
* Créer sa définition complète dans `DATA_PREFS` dans le fichier `app/common/data_prefs.js`,
* Si nécessaire (traitement particulier), faire le traitement dans `app/table_analyse/prefs.js` (mais normalement, il vaut mieux faire une fonction qui sera définie aussi dans la propriété `fct` de la préférence dans `DATA_PREFS`)

## Classe panneau

Une classe `Panel` pour gérer les panneaux (elle doit pouvoir être utilisée par n'importe quelle application)

L'idée est de la rendre au maximum autonome. Elle ne doit utiliser le mainProcess que pour envoyer les valeurs à changer.

## Convention

Les noms des préférences (`<pid>`) sont toujours délimités par des `_` (underscore/trait plat), pas par des tirets.

## Fonctionnement général

Trois "lieux" sont nécessaires pour gérer les préférences
* Le main process qui construit la *fenêtre des préférences* et charge `MainPrefs`, le module principal
* La *fenêtre des préférences* qui permet de les consulter et les modifier
* La *table d'analyse* qui doit réagir à certaines préférences (à commencer par la taille des fonts)

### Quand on change une préférence dans la fenêtre des préférences

* La fenêtre des préférences envoie un évènement au main process pour modifier provisoirement la valeur
  => C'est l'évènement `set-pref-prov` avec les données `{:pid, :value}`
* Le main process, si nécessaire, répercute la modification à la table d'analyse pour qu'elle en tienne compte. C'est la propriété `monit` (des `DATA_PREFS`) qui le détermine.
  => Ça passe par l'évènement `set-pref-prov`
* La table d'analyse reçoit l'évènement `set-pref-prov` avec la valeur à changer et la modifie. La valeur transmise est une instance `Pref`.


* Le mieux serait d'avoir une définition général des préférences, comme par exemple, dans DATA_PREFS qu'on trouve dans main-prefs.js

## Synopsis général

Le main process charge le module `modules/main-prefs.js` qui contient la base des préférences, à commencer par la constante `DATA_PREFS` qui contient la définition de toutes les préférences. Noter qu'on utiliser `DATA_PREFS[<pid>].defValue` pour obtenir la valeur par défaut de la préférence `<pid>` tandis qu'on utilise `PREFS[<pid>]` pour obtenir sa valeur utilisateur.

> Note : il peut exister un fichier des préférences générales et un fichier des préférences propres à l'analyse courante.


## Les panneaux

On les atteint par une liste à gauche

### Général

* Dossier de départ (par défaut) pour les analyses (`default_analysis_folder`)

### Aspect de l'analyse

- Thème courant

- taille des cadences (pixels) (`cadence_fsize`)
- taille des accords (pixels) (`chord_fsize`)
- taille des degrés (px) (`degree_fsize`)
- taille des chiffrages (`harmony_fsize`)
- taille des modulatioins (`modulation_fsize`)
- taille des parties (`part_fsize`)
- taille des textes (`text_fsize`)

Rappeler que toutes les tailles peuvent être modifiées ponctuellement à l'aide de `fs=`

### Outils

- Utiliser le rectangle de sélection (`rectangle_selection` / `false`)
- Afficher les lignes repères (`references_line`) — penser à régler aussi le menu
- Utiliser le viseur
