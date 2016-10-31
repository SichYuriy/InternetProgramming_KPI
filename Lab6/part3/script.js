var options = [
  {value:"link1.html", text:"link1"},
  {value:"link2.html", text:"link2"},
  {value:"link3.html", text:"link3"},
  {value:"link4.html", text:"link4"}
];

var select = document.getElementById("selectId");
options.forEach(function(val){
  var option = document.createElement("option");
  option.textContent = val.text;
  option.value = val.value;
  select.options.add(option);
})