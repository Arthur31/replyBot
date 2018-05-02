# Projet chat SAV

### Instalation :

* Créer une base mongoDB pour le projet
* Y insérer une table admin avec username et password
* Installer les dependance avec npm install
* Lancer le server


### Fonctionnement :

Les clients sont dans la partie localhost:3000 et les admins sur localhost:3000/admin

Les administrateurs ont une fenetre avec les utilisateurs à gauche et la convo actuelle au milieu.

Les customer sont authentifié par un id stoque dan un cookie pour qu'en cas de deconection il retombe avec le meme administrateur.

On peut suprimer ce cookie avec la commande :

```
Cookies.remove('id');
```

ce qui as pour effet de ne plus reconaitre l'utilisateur


### Avancemet du projet :

Ce projet n'est pas terminé, il reste notament l'ajout des liens cliquables, des emiji, des reponses rapide et d'une vue permettant la visibilité de tous les ancien messages des discussions "archivé".
