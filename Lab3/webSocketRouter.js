'use strict'

let TestUnit = require('./testUnit');
let testConfigs = require('./testConfigs.json');

let test = new TestUnit(testConfigs.fileName);


const TEST_SIZE = Math.min(testConfigs.testSize, test.getSize());
const TIME_TO_RECONNECT = testConfigs.timeToReconnect; //miliseconds


let users = {};


function newConnectionRes() {
  return {
      type : "newConnectionRes",
      testSize : TEST_SIZE,
      testName : test.getName()
    }
}

function connectionDeniedRes() {
  return {
    type : 'connectionDeniedRes',
    reason : 'user is already exist'
  }
}

function reconectionBeforeTestingRes() {
  return {
    type : 'reconnectionBeforeTesting',
    testSize : TEST_SIZE,
    testName : test.getName() 

  }
}

function reconnectionTestingRes(user) {
  let tempQuestion;
  for (let i = 0; i < user.answers.length; i++) {
    if (user.answers[i] == undefined) {
      tempQuestion = i;
      break;
    }
  }
  if (tempQuestion == undefined) {
    tempQuestion = 0;
  }
  return {
    type : 'reconnectionTestingRes',
    testSize : TEST_SIZE,
    testName : test.getName(),
    answers : user.answers,
    tempQuestion : tempQuestion
  }
}

function changeConnection(user, connection) {
  if (user.reconnectionKey) {
    clearTimeout(user.reconnectionKey);
  }
  
  connection.on('close', ()=> {
    user.isActive = false;
    console.log('user ' + user.userName + ' disconnected');
    user.reconnectionKey = setTimeout(() => {
      delete users[user.userName];
    }, TIME_TO_RECONNECT);  
  });
  user.connection = connection;
}

function startTestReq(message, connection) {
  let user = users[message.userName];
  console.log('user ' + message.userName + ' started testing');
  user.state = 'testing';
}

function saveQuestionReq(message, connection) {
  let user = users[message.userName];
  user.answers[message.questionNumber] = message.answerNumber;
  console.log('user ' + message.userName + ' question #' + message.questionNumber + ' answer saved');
}

function getQuestionReq(message, connection) {
  let user = users[message.userName];
  let questionNumber = message.questionNumber;
  return getQuestionRes(user, questionNumber);
}

function getQuestionRes(user, questionNumber) {
  let question = user.questions[questionNumber];
  return {
    type : 'getQuestionRes',
    questionNumber : questionNumber,
    questionContent : question.content,
    answers : question.answers.map((val)=>{
      return val.content;
    })
  }
}

function endTestReq(message, connection) {
  let user = users[message.userName];
  user.state = "results";
  console.log('user ' + message.userName + " finished the test"); 
}

function getResultsReq(message, connection) {
  let user = users[message.userName];
  return getResultsRes(user);
}

function reconnectionResultsRes(user) {
  let correctAnswersCount = 0;
  let testSize = TEST_SIZE;
  let answers = user.answers;
  let questions = user.questions;
  let correctAnswers = new Array(TEST_SIZE);
  for (let i = 0; i < TEST_SIZE; i++) {
    let realAnswers = user.questions[i].answers;
    for (let j = 0; j < realAnswers.length; j++) {
      if (realAnswers[j].correct == true) {
        correctAnswers[i] = j;
        break;
      }
      
    }
    if (answers[i] == correctAnswers[i]) {
      correctAnswersCount++;
    }
  }
  return {
    type : "reconnectionResultsRes",
    correctAnswers : correctAnswers,
    answers : answers,
    correctAnswersCount : correctAnswersCount,
    testSize : testSize,
    testName : test.getName()
  }
}

function getResultsRes(user) {
  let correctAnswersCount = 0;
  let testSize = TEST_SIZE;
  let answers = user.answers;
  let questions = user.questions;
  let correctAnswers = new Array(TEST_SIZE);
  for (let i = 0; i < TEST_SIZE; i++) {
    let realAnswers = user.questions[i].answers;
    for (let j = 0; j < realAnswers.length; j++) {
      if (realAnswers[j].correct == true) {
        correctAnswers[i] = j;
        break;
      }
      
    }
    if (answers[i] == correctAnswers[i]) {
      correctAnswersCount++;
    }
  }
  return {
    type : "getResultsRes",
    correctAnswers : correctAnswers,
    answers : answers,
    correctAnswersCount : correctAnswersCount
  }
}

function connectionReq(message, connection) {
  let userName = message.userName;
  if (userName in users) {
    let user = users[userName];

    if (user.isActive) {
      console.log('user ' + userName + ' denied');
      return connectionDeniedRes();
    }
    
    changeConnection(user, connection);
    user.isActive = true;
    let answer;
    if (user.state == 'beforeTesting') {
      console.log('user ' + userName + ' is reconnected: before testing');
      return reconectionBeforeTestingRes();
      
    } else if (user.state == 'testing') {
      console.log('user ' + userName + ' is reconnected: testing');
      return reconnectionTestingRes(user);
      
    } else if (user.state == 'results') {
      console.log('user ' + userName + ' is reconnected: viewing results');
      return reconnectionResultsRes(user);
    }

  } else {
    let user = {};
    changeConnection(user, connection);
    user.questions = generateQuestions();
    user.answers = new Array(TEST_SIZE);
    user.state = 'connected';
    user.isActive = true;
    user.userName = userName;
    
    users[userName] = user;
    console.log('user ' + userName + 'connected, state - ' + user.state);
    
    return newConnectionRes();
  }
}


let routing = {
  connectionReq : connectionReq,
  startTestReq : startTestReq,
  getQuestionReq : getQuestionReq,
  saveQuestionReq : saveQuestionReq,
  getResultsReq : getResultsReq,
  endTestReq : endTestReq
}

function route(message, connection) {
  let m = JSON.parse(message.utf8Data);
  
  
  return routing[m.type](m, connection);
}

function generateQuestions() {
  
  let pullSize = test.getSize();
  let allQuestions = new Array(pullSize);
  for (let i = 0; i < pullSize; i++) {
    allQuestions[i] = i;
  }
  let questionNumbers = [];

  for (let i = 0; i < TEST_SIZE; i++) {
    let index = Math.floor(Math.random() * (pullSize - i - 1));
    questionNumbers.push(allQuestions[index]);
    let p = allQuestions[pullSize - i - 1];
    allQuestions[pullSize - i - 1] = allQuestions[index];
    allQuestions[index] = p;    
  }
  
  return questionNumbers.map((val)=>{
    return test.getQuestion(val);
  });


}

module.exports.route = route;