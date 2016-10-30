var searchSystems_urls = {
  "google" : "https://www.google.com.ua/#q=",
  "yandex" : "https://yandex.ua/search/?text=",
  "mail.ru" : "http://go.mail.ru/search?q=",
  "yahoo" : "https://search.yahoo.com/search;?p=",
  "bing" : "http://www.bing.com/search?q="
}

function search(frameId, searchSystem, searchStr) {
  searchUrl = searchSystems_urls[searchSystem];
  document.getElementById(frameId).src = searchUrl + searchStr;
}

var statistics = searchSystemRequests;

function getRecall(searchSystem) {
  var r_sum = 0;
  var r_count = 0;
  var requests = statistics[searchSystem];
  for (var i = 0; i < requests.length; i++) {
    var request = requests[i];
    r_sum += request.a / (request.a + request.c);
    r_count++;
  }
  return r_sum / r_count;
}

function getPrecision(searchSystem) {
  var p_sum = 0;
  var p_count = 0;
  var requests = statistics[searchSystem];
  for (var i = 0; i < requests.length; i++) {
    var request = requests[i];
    p_sum += request.a / (request.a + request.b);
    p_count++;
  }
  return p_sum / p_count;
}

function getAccuracy(searchSystem) {
  var acc_sum = 0;
  var acc_count = 0;
  var requests = statistics[searchSystem];
  for (var i = 0; i < requests.length; i++) {
    var request = requests[i];
    acc_sum += (request.a + request.d) / (request.a + request.b + request.c + request.d);
    acc_count++;
  }
  return acc_sum / acc_count;
}

function getError(searchSystem) {
  var err_sum = 0;
  var err_count = 0;
  var requests = statistics[searchSystem];
  for (var i = 0; i < requests.length; i++) {
    var request = requests[i];
    err_sum += (request.b + request.c) / (request.a + request.b + request.c + request.d);
    err_count++;
  }
  return err_sum / err_count;
}



