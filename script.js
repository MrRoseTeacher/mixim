/*
Builder JS
*/

//handle files
//handle remix

function displayDeleteRow(){
  const deleteIcons = document.getElementsByClassName("delete-row");
  if(document.getElementsByClassName("content-row").length <= 1){    
    for(let i = 0; i<deleteIcons.length; i++){
      deleteIcons[i].style.display = "none";
    }
  }
  else{
    for(let i = 0; i<deleteIcons.length; i++){
      deleteIcons[i].style.display = "block";
    }
  }
}

function deleteRow(){
  this.parentNode.remove();
  displayDeleteRow();
}

function addRow(){
  //create row
  const newRow = document.createElement("div");
  newRow.classList.add("content-row");
  
  //create content col
  const newWord = document.createElement("div");
  newWord.classList.add("content-col");
  newWord.append(document.createTextNode("Word"));
  const newWordInput = document.createElement("input");
  newWordInput.classList.add("mixim-input");
  newWord.append(newWordInput);
  newRow.append(newWord);
  
  //create content col 2
  const newDesc = document.createElement("div");
  newDesc.classList.add("content-col");
  newDesc.append(document.createTextNode("Description/Definition"));
  const newDescInput = document.createElement("input");
  newDescInput.classList.add("mixim-input");
  newDesc.append(newDescInput);
  newRow.append(newDesc);
  
  //create deleteButton and add listener
  const newDelete = document.createElement("button");
  newDelete.classList.add("delete-row");
  newDelete.onclick = deleteRow;
  newDelete.innerHTML = '<span class="material-symbols-outlined">delete</span>';
  newRow.append(newDelete);
  
  //append new row before addRow
  eid("main").insertBefore(newRow, this.parentNode);
  
  //call delete-row display function
  displayDeleteRow();
}

//code to run when builder page loads
function builderOnLoad(){
  //add event listener to first delete button
  document.getElementsByClassName("delete-row")[0].onclick = deleteRow;
  //add event listener for addrow
  eid("add-row").onclick = addRow;
  
  //run check for deleteIcons. Makes first button invisible at the beginning.
  displayDeleteRow();
}

//get info from form and put it together in a link
eid("gen-mixim").onclick = function(){
  //need to make a query string for the URL
  let query = "";
  const allInputs = document.getElementsByClassName("mixim-input");
  
  //check for empties, display modal if not
  let missing = false;
  for(let i=0; i<allInputs.length; i++){
    if(allInputs[i].value == ""){
      missing = true;
    }
  }
  if(missing){
    showModal("Please fill in all fields", 3000);
    return;
  }
  
  //add the topic, trim and replace space chars with +
  query += "topic=" + allInputs[0].value.trim().replaceAll(" ", "+");
  
  //use word-iteration and desc-iteration as the placeholder variables for the query
  //iteration works in pairs of word and desc
  let iteration = 1;
  for(let i = 1; i < allInputs.length -1; i++){
    let part = "&";
    if(i % 2 == 1){
      part += "word" + String(iteration) + "=";
    }
    else{
      part += "desc" + String(iteration) + "=";
      iteration++;
    }
    part += allInputs[i].value.trim().replaceAll(" ", "+");
    query += part;
  }
  
  //add the success message, trim and replace spaces
  query += "&successMsg=" + allInputs[allInputs.length -1].value.trim().replaceAll(" ", "+");
  
  //base64 encoded
  query = btoa(query);
  
  //URIencoded
  query = encodeURIComponent(query);

  const domain = "https://codepen.io/tv58777/pen/wBGqPMM";
  const fullURL = domain + "?data=" + query
  
  //populate the link box below
  const link = document.createElement("a");
  link.innerHTML = fullURL;
  link.href = fullURL;
  link.target = "_blank";
  eid("copy-link").parentNode.insertBefore(link, eid("copy-link"));
  eid("mixim-link").style.visibility = "visible";
  
  eid("copy-link").onclick = function(){
    navigator.clipboard.writeText(link.innerHTML);
    showModal("Mixim link copied to clipboard", 3000);
  }
}

builderOnLoad();

/* TEMP CODE */

function popDefault(){
  eid("add-row").click();
  eid("add-row").click();
  const allInputs = document.getElementsByClassName("mixim-input");
  const initial = [
    "Words that English borrowed from Indigenous Language",
    "Sound",
    "A noise made",
    "Light",
    "What your eyes see",
    "Touch",
    "What you feel with your fingers",
    "Congratulations on finishing the game!"
  ];
  
  for(let i=0; i < allInputs.length; i++){
    allInputs[i].value = initial[i];
  }
}

popDefault();

