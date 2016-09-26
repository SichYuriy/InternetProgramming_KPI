'use strict'

let fs = require('fs');

function Test(fileName) {
  let fileContent = JSON.parse(fs.readFileSync(fileName)).test;
  
  for (let key in fileContent) {
    
    this[key] = fileContent[key];
  }
} 

Test.prototype.getSize = function() {
  return this.questions.length;
}

Test.prototype.getQuestion = function(index) {
  return this.questions[index];
}

Test.prototype.getName = function() {
  return this.name;
}

module.exports = Test;
