'use strict'

let http = require('http');
let websocket = require('websocket');
let httpRouter = require('./httpRouter');
var webSocketRouter = require('./webSocketRouter');
var Test = require('./testUnit.js');


let users = {};




let server = http.createServer((req, res) => {
  res.writeHead(200);
  console.log(req.url);
  res.end(httpRouter[req.url] || httpRouter.default);
  
});
server.listen(2000);

let ws = new websocket.server({
  httpServer : server,
  autoAcceptConnections: false
});


ws.on('request', (req) => {
  
  
  let connection = req.accept('', req.origin);
  connection.on('message', (message) => {
     console.log(message);
     let answer = webSocketRouter.route(message, connection);
     
     if (answer) {
      console.log(answer);
      console.log('JSON:');
      console.log(JSON.stringify(answer));
      connection.send(JSON.stringify(answer));
     }
     
  });
  
});






