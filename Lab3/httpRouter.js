'use strict'
let fs = require('fs');

let index = fs.readFileSync('index.html');
let clientjs = fs.readFileSync('client.js');
let style = fs.readFileSync('style.css');

let router = {
  '/' : index,
  '/client.js' : clientjs,
  '/style.css' : style,
  'default' : ''
}

module.exports = router;