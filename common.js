const opacityDuration = 500;

// Encode with compression + Base64 (URL-safe)
function encodeCompressed(str) {
  // Compress to Base64
  let compressed = encodeURIComponent(LZString.compressToBase64(str));
  // Make URL-safe by replacing +, /, =
  return compressed;
}

// Decode back to original
function decodeCompressed(encoded) {
  // Restore Base64 padding and symbols
  let base64 = encoded
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(LZString.decompressFromBase64(base64));
}

function eid(name){
  return document.getElementById(name);
}

function showModal(content, duration, reset = false){
  eid("modal").innerHTML = "";
  eid("modal").style.visibility = "visible";
  eid("modal").innerHTML = "<p>" + content + "</p>";
  if(reset){
    const resetMsg = document.createElement("p");
    resetMsg.innerHTML = "Getting a strange error?";
    eid("modal").append(resetMsg);
    const resetButton = document.createElement("button");
    resetButton.classList.add("link-button");
    resetButton.style.display = "block";
    resetButton.style.margin = "1rem auto";
    resetButton.innerHTML = "Reset Word";
    eid("modal").append(resetButton);
    resetButton.onclick = function(){
      eid("gameplay-container").innerHTML = initialState;
    }
  }
  eid("modal").style.opacity = 0.97;
  setTimeout(function(){
    eid("modal").style.opacity = 0;
  }, opacityDuration + duration);
  setTimeout(function(){
    eid("modal").style.visibility = "hidden";
  }, opacityDuration*2 + duration);
}