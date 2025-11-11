# SITE_DESSIN_EN_LIGNE

## Présentation

**SITE_DESSIN_EN_LIGNE** est une application web de dessin collaboratif en temps réel.  
Elle permet à plusieurs utilisateurs de partager un même tableau et de dessiner simultanément depuis leur navigateur, sans installation préalable.  

Le projet vise à offrir une expérience fluide, réactive et intuitive, comparable aux outils de dessin collaboratifs modernes.

---

## Fonctionnalités principales

- Dessin en temps réel sur un canvas partagé.  
- Sélection des outils : couleur, taille du pinceau, etc.  
- Affichage des pointeurs des utilisateurs connectés.  
- Attribution d’un pseudo visible pour chaque utilisateur.  
- Création et partage de sessions collaboratives.  
- Interface minimaliste et réactive, adaptée à un usage immédiat.

---

## Technologies utilisées

### Frontend
- **HTML5 / CSS3 / JavaScript (vanilla)**
- **Canvas API** pour le rendu du dessin
- **WebSocket** (ou équivalent) pour la communication en temps réel

### Backend
- **Node.js** avec **Express**
- Gestion des connexions utilisateurs et des événements collaboratifs via WebSocket

---

## Installation et exécution

### 1. Cloner le dépôt
```bash
git clone https://github.com/JLFlo12/SITE_DESSIN_EN_LIGNE.git
cd SITE_DESSIN_EN_LIGNE/SITE_DESSIN_EN_LIGNE
2. Installer les dépendances
bash
Copier le code
npm install
3. Lancer le serveur
bash
Copier le code
npm start
4. Accéder à l’application
Ouvrir un navigateur et se rendre sur :

arduino
Copier le code
http://localhost:3000
Remarque : si un autre port est utilisé par le projet, ajuster l’URL en conséquence.

Structure du projet
csharp
Copier le code
SITE_DESSIN_EN_LIGNE/
├── public/           # Fichiers statiques (HTML, CSS, JS, images)
├── src/              # Code source principal
│   ├── js/           # Scripts de gestion du canvas et de la synchronisation
│   ├── css/          # Feuilles de style et interface utilisateur
│   └── server.js     # Serveur Node.js (Express / WebSocket)
├── package.json      # Dépendances et scripts npm
└── README.md         # Documentation du projet
Fonctionnement général
L’utilisateur accède au site et saisit un pseudo.

Une connexion en temps réel est établie entre le client et le serveur.

Les tracés et mouvements de pointeurs sont diffusés instantanément à l’ensemble des utilisateurs connectés.

Les éléments sont rendus localement pour assurer une expérience fluide et sans latence perceptible.

Scripts npm
npm start : démarre le serveur de l’application en mode production/développement (selon configuration).

npm install : installe les dépendances du projet.

Consulter package.json pour la liste exacte des scripts disponibles.

Licence
Ce projet est distribué sous licence MIT.
L’utilisation, la modification et la redistribution sont autorisées sous les conditions de cette licence.
