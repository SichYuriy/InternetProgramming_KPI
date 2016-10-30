
var answer;
var firstOperation = true;
var previousOperation = "plus";

var tempVal = 0;

var operationsFuncs = {
  "plus" : function(a, b) {return a + b;},
  "mult" : function(a, b) {return a * b;},
  "dev"  : function(a, b) {return Math.floor(a / b);},
  "sub"  : function(a, b) {return a - b;} 
}

function doOperation(operation) {
  if (firstOperation) {
    answer = tempVal;
    previousOperation = operation;
    firstOperation = false;
    resetTempValue();
  } else {
    answer = operationsFuncs[previousOperation](answer, tempVal);
    previousOperation = operation;
    resetTempValue();
  }
}

function reset() {
  firstOperation = true;
  resetTempValue();
}

function countAnswer(val) {
  if (!firstOperation) {
    console.log(previousOperation);
    console.log(operations);
    answer = operationsFuncs[previousOperation](answer, tempVal);
    firstOperation = true;
    tempVal = answer;
  }
  return false;
}

function getAnswer() {
  return answer;
}

function addDigit(digit) {
  tempVal = tempVal * 10 + digit;
  
}

function resetTempValue() {
  tempVal = 0;
}

function getTempValue() {
  return tempVal;
}



