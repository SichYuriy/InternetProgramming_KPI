
var socket;

var userName;
var testName;
var testSize;
var tempQuestionNumber;
var answers;
var questions;
var loadedQuestionsCount = 0;
var connectionClosed = true;

var correctAnswers
var correctAnswersCount;

var showResultsMode = false;

socket = new WebSocket('ws://localhost:2000');

socket.onclose = function(){ connectionClosed = true; };

socket.onopen = function() {
  console.log('open');
  connectionClosed = false;
  authorizationReq();
}

function authorizationReq() {
  do {
    userName = prompt('UserName:');
  } while (userName == null || userName == '');

  socket.send(JSON.stringify({
    type : 'connectionReq',
    userName : userName
  }));
}

function reconnectionBeforeTestingRes(message) {
  newConnectionRes(message);
}

function connectionDeniedRes(message) {
  alert('Fail: ' + message.reason);
  authorizationReq();
}

function reconnectionResultsRes(message) {
  correctAnswers = message.correctAnswers;
  answers = message.answers;
  correctAnswersCount = message.correctAnswersCount;
  testSize = message.testSize;
  testName = message.testName;
  questions = new Array(testSize);

  showResultsMode = true;

  updateTestAttributesHTML();
  updateScoreHTML();
  loadQuestions();
  buildNavigationHTML();

  var interval = setInterval(function(){
    if (connectionClosed) {
      alert('connection lost');
      clearInterval(interval);
      return;
    }
    if (loadedQuestionsCount == testSize) {
      clearInterval(interval);
      
      updateNavigationDuringResults();
      gotoQuestion(0);
      console.log(123);
    } else {
      loadQuestions();
    }
  }, 100);
  

}

function reconnectingTestingRes(message) {
  tempQuestionNumber = message.tempQuestion;
  testSize = message.testSize;
  testName = message.testName;
  answers = message.answers;
  questions = new Array(testSize);

  updateTestAttributesHTML();

  loadQuestions();
  buildNavigationHTML();
  var interval = setInterval(function(){
    if (connectionClosed) {
      alert('connection lost');
      clearInterval(interval);
      return;
    }
    if (loadedQuestionsCount == testSize) {
      clearInterval(interval);
      gotoQuestion(tempQuestionNumber);
      updateNavigationDuringTest();
    } else {
      loadQuestions();
    }
  }, 100);


}

function newConnectionRes(message) {
  tempQuestionNumber = 0;
  testSize = message.testSize;
  testName = message.testName;
  answers = new Array(testSize);
  questions = new Array(testSize);

  updateTestAttributesHTML();

  alert('Press "OK" to start the test!!!');
  startTestReq();
}

function startTestReq() {
  socket.send(JSON.stringify({
    type : 'startTestReq',
    userName : userName
  }));

  loadQuestions();
  buildNavigationHTML();
  var interval = setInterval(function(){
    if (connectionClosed) {
      alert('connection lost');
      clearInterval(interval);
      return;
    }
    if (loadedQuestionsCount == testSize) {
      clearInterval(interval);
      gotoQuestion(0);
    } else {
      loadQuestions();
    }
  }, 100);
}

function loadQuestions() {
  for (var i = 0; i < testSize; i++) {
    if (questions[i] == undefined) {
      getQuestionReq(i);
    }
    
  }
}

function getQuestionReq(questionNumber) {
  socket.send(JSON.stringify({
    type : 'getQuestionReq',
    userName : userName,
    questionNumber : questionNumber
  }));
}

function getQuestionRes(message) {
  if (questions[message.questionNumber] == undefined) {
    loadedQuestionsCount++;
    questions[message.questionNumber] = {
      content : message.questionContent,
      answers : message.answers
    }
  }
  
}

function gotoQuestion(questionNumber) {
  tempQuestionNumber = questionNumber;
  updateQuestionHTML();
}

function updateTestAttributesHTML() {
  var testSizeSpan = document.getElementById('testSizeSpan');
  var testNameSpan = document.getElementById('testNameSpan');
  var userNameSpan = document.getElementById('userNameSpan');
  testSizeSpan.textContent = testSize;
  testNameSpan.textContent = testName;
  userNameSpan.textContent = userName;
}

function createNavButton(index) {
  var button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.className = 'btn btn-default';
  button.textContent = '' + (index + 1);
  button.onclick = function() {
    if (index == tempQuestionNumber) {
      return;
    }
    if (!showResultsMode) {
      saveQuestion();
    }
    
    gotoQuestion(index);
  };
  return button;
}

function updateNavigationDuringResults() {
  var navButtons = document.getElementById('navigationDiv').children;

  for (var i = 0; i < testSize; i++) {
    if (answers[i] == correctAnswers[i]) {
      navButtons[i].className = 'btn btn-success';
    } else {
      navButtons[i].className = 'btn btn-danger';
    }

  }
}

function updateNavigationDuringTest() {
  var navButtons = document.getElementById('navigationDiv').children;

  for (var i = 0; i < testSize; i++) {
    if (answers[i] != undefined) {
      navButtons[i].className = 'btn btn-primary';
    }
  }
}

function buildNavigationHTML() {
  var menu = document.getElementById('navigationDiv');
  
  for (let i = 0; i < testSize; i++) {
    menu.appendChild(createNavButton(i));
  }
  
}

function saveQuestion() {
  var inputAnswers = document.getElementById('answersForm').getElementsByTagName('input');
  var answerIndex;
  for (var i = 0; i < inputAnswers.length; i++) {
    if (inputAnswers[i].checked) {
      answerIndex = i;
      break;
    }
  }
  if (answerIndex != undefined) {
    answers[tempQuestionNumber] = answerIndex;
    saveQuestionReq();
    var navButtons = document.getElementById('navigationDiv').children;
    navButtons[tempQuestionNumber].className = 'btn btn-primary';
  }
  
}

function saveQuestionReq() {
  socket.send(JSON.stringify({
    type : "saveQuestionReq",
    userName : userName,
    questionNumber : tempQuestionNumber,
    answerNumber : answers[tempQuestionNumber]
  }));
}

function endTestReq() {
  socket.send(JSON.stringify({
    type : "endTestReq",
    userName : userName
  }));
}

function getResultsReq() {
  socket.send(JSON.stringify({
    type : "getResultsReq",
    userName : userName
  }));
}

function getResultsRes(message) {
  showResultsMode = true;
  correctAnswers = message.correctAnswers;
  correctAnswersCount = message.correctAnswersCount;
  console.log('correctAnswers: ' + correctAnswersCount);
  updateNavigationDuringResults();
  updateScoreHTML();
  gotoQuestion(0);
}

function updateScoreHTML() {
  var scoreSpan = document.getElementById('scoreSpan');
  var score = Math.floor(correctAnswersCount / testSize * 100);
  scoreSpan.textContent = score;
}



function updateQuestionHTML() {
  var tempQuestionSpan = document.getElementById('tempQuestionSpan');
  var questionContentSpan = document.getElementById('questionContentSpan');
  var answerSpans = [
    document.getElementById('answer1Span'),
    document.getElementById('answer2Span'),
    document.getElementById('answer3Span'),
    document.getElementById('answer4Span')
  ];

  var inputAnswers = document.getElementById('answersForm').getElementsByTagName('input');
  for (var i = 0; i < inputAnswers.length; i++) {
    inputAnswers[i].checked = false;
  }
  var tempAnswer = answers[tempQuestionNumber];
  if (tempAnswer != undefined) {
    inputAnswers[tempAnswer].checked = true;
  }

  var question = questions[tempQuestionNumber];
  tempQuestionSpan.textContent = tempQuestionNumber + 1;
  questionContentSpan.textContent = question.content;
  for (var i = 0; i < answerSpans.length; i++) {
    answerSpans[i].textContent = question.answers[i];
  }

  if (showResultsMode) {
    var answer = answers[tempQuestionNumber];
    var correctAnswer = correctAnswers[tempQuestionNumber];
    for (var i = 0; i < inputAnswers.length; i++) {
      answerSpans[i].style.color = '';
      answerSpans[i].style.fontWeight = '';
    }
    if (answer != undefined) {
      answerSpans[answer].style.color = 'red';
      answerSpans[answer].style.fontWeight = 'bold';
    }
    answerSpans[correctAnswer].style.color = 'green';
    answerSpans[correctAnswer].style.fontWeight = 'bold';
  }
}

document.getElementById('nextButton').onclick = function() {
  if (tempQuestionNumber < testSize - 1) {
    if (!showResultsMode) {
      saveQuestion();
    }
    gotoQuestion(tempQuestionNumber + 1);
  }
};

document.getElementById('finishButton').onclick = function() {
  if (!showResultsMode) {
    if (confirm('End test?')) {
      saveQuestion();
      endTestReq();
     getResultsReq();
    }
  }
};


var routing = {
  newConnectionRes : newConnectionRes,
  getQuestionRes : getQuestionRes,
  reconnectionTestingRes : reconnectingTestingRes,
  connectionDeniedRes : connectionDeniedRes,
  reconnectionBeforeTestingRes : reconnectionBeforeTestingRes,
  getResultsRes : getResultsRes,
  reconnectionResultsRes : reconnectionResultsRes
}

socket.onmessage = function(message) {
  var m = JSON.parse(message.data);
  routing[m.type](m);
}