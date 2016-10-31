function onSubmit() {
  return isPhoneValid();
}

function isPhoneValid() {
  var phone = document.getElementById("phoneId").value;
  var result = /^[0-9 ]+$/.test(phone);
  if (!result) {
    var errorMessage = document.getElementById("invalidPhoneId");
    errorMessage.hidden = false;
    setTimeout(function() {
      errorMessage.hidden = true;
    }, 2000);
  }
  return result;
}