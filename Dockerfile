# Image de base légère et optimisée
FROM node:20-slim

# Définition du répertoire de travail
WORKDIR /usr/src/app

# Optimisation du cache Docker : copie préalable des définitions de package
COPY package*.json ./

# Installation stricte des dépendances de production (nouvelle syntaxe NPM)
RUN npm ci --omit=dev

# Copie de l'intégralité du code source, y compris /public
COPY . .

# Passer à l'utilisateur non-privilégié intégré pour maximiser la sécurité
USER node

# Cloud Run injecte dynamiquement la variable PORT au démarrage (souvent 8080)
EXPOSE 8080

# Commande pour lancer l'application
CMD [ "node", "server.js" ]
