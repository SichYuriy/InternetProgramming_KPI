


var recordsData = [];
var searchResults = [];

var searchResultsCount;
var showRecordsCount = 10;
var tempPage;
var totalPages;


function readData() {
  data.forEach((val)=>{
    
    var name = val.substring(0, val.indexOf('|'));
    var description = val.substring(val.indexOf('|') + 1, val.toUpperCase().indexOf('|HTTP'));
    var url = val.substring(val.toUpperCase().indexOf('|HTTP') + 1, val.length);
    recordsData.push({
      name : name,
      description : description,
      url : url
    });
  });
}

var checkString = {
  "All terms" : (str, findTerms) => {
    for (var i = 0; i < findTerms.length; i++) {
      if (str.toUpperCase().indexOf(findTerms[i].toUpperCase()) == -1) {
        return false;
      }
    }
    return true;
  },
  "Any terms" : (str, findTerms) => {
    for (var i = 0; i < findTerms.length; i++) {
      if (str.toUpperCase().indexOf(findTerms[i].toUpperCase()) != -1) {
        return true;
      }
    }
    return false;
  }
}


checkRecord = {
  "Description" : (val, findTerms, what) => {
    return checkString[what](val.description, findTerms);
  },
  "Name" : (val, findTerms, what) => {
    return checkString[what](val.name, findTerms);
  },
  "URL" : (val, findTerms, what) => {
    return checkString[what](val.url, findTerms);
  },
  "Everywhere" : (val, findTerms, what) => {
    return checkString[what](val.name, findTerms) 
      || checkString[what](val.description, findTerms)
      || checkString[what](val.url, findTerms);
  },
}

function searchStart() {
  var formSearch = document.forms[0];
  
  var findTerms = formSearch.textToSearch.value.trim().split(" ");
  if(findTerms.length == 1 && findTerms[0] == "") {
    return false;
  }
  var inputWhat = formSearch.inputWhat.value;
  var inputWhere = formSearch.inputWhere.value;
  searchResults = [];
  recordsData.forEach((val)=> {
    var check = checkRecord[inputWhere](val, findTerms, inputWhat);
    if (check) {
      searchResults.push(val);
    }

  });
  searchResultsCount = searchResults.length;
  totalPages = Math.ceil(searchResultsCount / showRecordsCount);
  return true;
}

function updatePage() {
  var tbody = document.getElementById("tbodySearchResults");
  var searchQuarySpan = document.getElementById("searchQuery"); 
  var searchResultsSpan = document.getElementById("searchResults");
  var tempPageSpan = document.getElementById("tempPage");
  var startRecordNumber = tempPage * showRecordsCount + 1;
  var endRecordNumber = startRecordNumber + showRecordsCount - 1;
  var tbodyInnerHTML = "";
  if (endRecordNumber > searchResultsCount) {
    endRecordNumber = searchResultsCount;
  }
  searchQuarySpan.innerHTML = "" + searchResultsCount + " matches";

  searchResultsSpan.innerHTML = "shown " + startRecordNumber + "-" + endRecordNumber + " of " + searchResultsCount;
  console.log(searchResults);
  for (var i = startRecordNumber - 1; i < endRecordNumber; i++) {
    tbodyInnerHTML += "<tr>"
      + "<td>" + (i + 1) + "</td>"
      + "<td><b>" + searchResults[i].name + "</b></td>"
      + "<td>" + searchResults[i].description + "</td>"
      + "<td><a href = " + searchResults[i].url + ">" + searchResults[i].url + "</a></td>"
      + "</tr>";
  }
  tbody.innerHTML = tbodyInnerHTML; 
  tempPageSpan.innerHTML = "" + (tempPage + 1) + " of " + totalPages;
  
}

document.getElementById("searchStartButton").onclick = () => {
  if (searchStart()){
    tempPage = 0;
    updatePage();
  }  
}

document.getElementById("nextPage").onclick = () => {
  if (tempPage < totalPages - 1) {
    tempPage++;
    updatePage();
  }
}

document.getElementById("previousPage").onclick = () => {
  if (tempPage > 0) {
    tempPage--;
    updatePage();
  }
}

readData();
