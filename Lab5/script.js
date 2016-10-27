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