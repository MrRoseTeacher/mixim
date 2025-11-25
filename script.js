/*
Builder JS
*/

//handle files

//creates a key/value pair of the parameters
const urlParams = new URLSearchParams(window.location.search);
//access the 'data'
const encoded = urlParams.get('data');
//decode the URI (url safe) encoding
if(encoded){
  const decoded = decodeCompressed(encoded);
  const raw = decoded.split("&");
  const pairsToAdd = (raw.length - 4) / 2;
  for(let i=0; i<pairsToAdd; i++){
    addRow();
  }
  populateRemix(raw);
}

function populateRemix(ar){
  const allInputs = document.getElementsByClassName("mixim-input");
  for(let i=0; i<allInputs.length; i++){
    ar[i] = ar[i].replaceAll("+", " ");
    allInputs[i].value = ar[i];
  }
}

function displayDeleteRow(){
  const deleteIcons = document.getElementsByClassName("delete-row");
  if(document.getElementsByClassName("content-row").length <= 1){    
    for(let i = 0; i<deleteIcons.length; i++){
      if(window.screen.width <= 450){
        deleteIcons[i].previousElementSibling.previousElementSibling.style.width = "100%";
      }
      deleteIcons[i].style.display = "none";
    }
  }
  else{
    for(let i = 0; i<deleteIcons.length; i++){
      if(window.screen.width <= 450){
        deleteIcons[i].previousElementSibling.previousElementSibling.style.width = "84%";
      }
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
  eid("main").insertBefore(newRow, eid("add-row").parentNode);
  
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
  query += allInputs[0].value.trim().replaceAll(" ", "+");
  
  //information comes in pairs, so work with evens and odds
  for(let i = 1; i < allInputs.length -1; i++){
    let part = "&";
    part += allInputs[i].value.trim().replaceAll(" ", "+");
    query += part;
  }
  
  //add the success message, trim and replace spaces
  query += "&" + allInputs[allInputs.length -1].value.trim().replaceAll(" ", "+");
  
  //encoded
  query = encodeCompressed(query);

  const domain = "https://mrroseteacher.github.io/mixim/game/";
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

eid("upload").onclick = function(){
  eid("file-upload").click();
}

eid("file-upload").onchange = async function(){
  try{
    //access the file using the file API
    const file = this.files[0];
    const fileContent = await file.text();
    const parsed = JSON.parse(fileContent);
    const miximInfo = Object.values(parsed);
    const allInputs = document.getElementsByClassName("mixim-input");
    if(miximInfo.length % 2 != 0){
      showModal("Sorry, something is wrong with your file. You seem to be missing a field.", 3000);
      return;
    }
    else{
      const adds = (miximInfo.length - allInputs.length) / 2;
      for(let i=0; i<adds; i++){
        addRow();
      }
      for(let i=0; i<allInputs.length; i++){
        allInputs[i].value = miximInfo[i];
      }
    }

  }
  catch(error){
    console.error(error);
    showModal("Sorry, something went wrong with your file.", 3000);
  }
}

builderOnLoad();

/* TEMP CODE */
/*
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
*/
