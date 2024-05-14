// on importe le module HTTP intégré de Node.js dans notre application. 
const http = require('http');
//on importe l'application express via le fichier app.js : 
const app = require('./app');
// on configure express pour lui dire sur quel port elle va tourner
app.set('port', process.env.PORT || 3001);
// on créé un serveur HTTP en utilisant le module http de Node.js
// et on lui passe l'application Express ‘app’ comme gestionnaire de requêtes. 
const server = http.createServer(app);
//le serveur est configuré pour écouter les connexions sur le port spécifié. 
server.listen(process.env.PORT || 3001);
