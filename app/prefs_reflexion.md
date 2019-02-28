# Préférences

Une classe `Panel` pour gérer les panneaux (elle doit pouvoir être utilisée par n'importe quelle application)

L'idée est de la rendre au maximum autonome. Elle ne doit utiliser le mainProcess que pour envoyer les valeurs à changer.

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
