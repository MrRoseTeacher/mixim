//creates a key/value pair of the parameters
const urlParams = new URLSearchParams(window.location.search);
//access the 'data'
const encoded = urlParams.get('data');
//decode the URI (url safe) encoding
let decoded;
if(encoded){
  decoded = decodeCompressed(encoded);
}
else{
  decoded = "Sample~Game:~Common~English~words~and~Canadian~place~names~derived~from~Indigenous~languages&toboggan&A~long,~flat~sled~traditionally~used~for~winter~travel~and~recreation.~[Mi'kmaq]&moccasin&A~soft~leather~shoe,~historically~worn~by~Indigenous~peoples.~[Algonquin]&kayak&A~small,~narrow~watercraft~originally~used~for~hunting~and~travel.~[Inuktitut]&caribou&A~large~deer~species~native~to~northern~regions,~known~as~reindeer~elsewhere.~[Mi'kmaq]&pecan&A~type~of~nut~from~a~tree~native~to~North~America.~[Algonquin]&chipmunk&A~small~striped~rodent~found~in~North~America.~[Ojibwe]&skunk&A~small~mammal~known~for~its~strong~defensive~odor.~[Algonquin]&Quebec&Derived~from~a~word~meaning~'where~the~river~narrows'.~[Algonquin]&Toronto&Derived~from~a~word~meaning~'meeting~place'.~[Mohawk]&Manitoba&From~a~term~meaning~'strait~of~the~spirit'~or~'lake~of~the~spirit'.~[Cree]&Well~done!~Hopefully~you~learned~a~bit~more~about~these~words.";
}
const scrambledWords = [];
const unscrambledWords = [];
const descriptions = [];
let topic = "";
let successMsg = "";
let totalQuestions = 1;
let currentQuestion = 0;
let currentDrag;
let currentDragParent;
const builderURL = "https://mrroseteacher.github.io/mixim/";
const remixLink = builderURL + window.location.search;
let gameContainerVisible = false;
let firstGame = true;
let minutes = 0;
let seconds = -1;
let preseconds;
let gameInterval;
let swapHint = false;
let initialState;

function startTimer(){
  gameInterval = setInterval(function(){
    seconds++;
    if(seconds >= 60){
      minutes++;
      seconds -= 60;
    }
    if(seconds < 10){
      preseconds = "0";
    }
    else{
      preseconds = "";
    }
    let elapsed = String(minutes) + ":" + preseconds + String(seconds);
    eid("timer").innerHTML = elapsed;
  }, 1000);
}

function endTimer(){
  clearInterval(gameInterval);
}

eid("timer-button").onclick = function(){
  eid("flippable-timer").style.transform = "rotateY(-180deg)";
}

eid("timer").onclick = function(){
  eid("flippable-timer").style.transform = "";
}

//function must split up the String, replace + with " ", separate the words into an array (maybe keep the original as well?)
function parseContent(text){
  const raw = text.split("&");
  for(let i=0; i<raw.length; i++){
    //trim out things like topic= and remove + with " "
    raw[i] = raw[i].replaceAll("~", " ");
    
    if(i == 0){
      topic = raw[i];
    }
    else if(i == raw.length -1){
      successMsg = raw[i];
    }
    else if(i % 2 == 1){
      unscrambledWords.push(raw[i].toUpperCase());
    }
    else{
      descriptions.push(raw[i]);
    }
  }
  
  //now scramble all of the words and put them in the scrambled array
  for(let i=0; i<unscrambledWords.length; i++){
    //turn each word into an array and send to scramble function
    let scrambled = scramble(unscrambledWords[i].split(""));
    //make scrambled word a String and push it to the scrambled array
    scrambledWords.push(scrambled.join(""));
  }
  
  totalQuestions = scrambledWords.length;
  eid("topic-container").innerHTML = topic;
  eid("question-number").innerHTML = totalQuestions + " Questions";
}

function scramble(ar){
  //scrambles the array based on Fisher-Yates
  for(let i = 0; i < ar.length; i++){
    const rnd = Math.ceil(Math.random()*(ar.length-1));
    const temp = ar[i];
    ar[i] = ar[rnd];
    ar[rnd] = temp;
  }
  return ar;
}

//displays scrambled word. Creates letterboxes, and calculates needed width.
function nextWord(n){
  eid("progress-counter").innerHTML = String(n+1) + "/" + String(totalQuestions);
  eid("description-container").innerHTML = "Description: " + descriptions[n];
  MathJax.Hub.Typeset()
  eid("scrambled-container").innerHTML = "";
  eid("unscrambled-container").innerHTML = "";
  // const boxWidth = (window.innerWidth - 16 - 32 - (scrambledWords[n].length - 1)*(16))/scrambledWords[n].length;
  for(let i=0; i<scrambledWords[n].length; i++){
    eid("scrambled-container").append(createLetterBlock(scrambledWords[n][i]));
    const node = createDragTarget();
    eid("unscrambled-container").append(node);
    node.append(createEmptyLetterBlock());
  }
  eid("page-container").style.height = eid("page-container").clientHeight - 8*16 + "px";
  initialState = eid("gameplay-container").innerHTML;
}

function createLetterBlock(letter){
  const node = document.createElement("div");
  node.classList.add("letter-block-filled");
  // node.style.width = width + "px";
  node.draggable = true;
  node.ondragstart = dragStartHandler;
  //mobile touch listeners
  node.addEventListener("touchstart", touchStartHandler, { passive: false });
  node.addEventListener("touchmove", touchMoveHandler, { passive: false });
  node.addEventListener("touchend", touchEndHandler, { passive: false });
  node.innerHTML = letter;
  return node;
}

function createDragTarget(){
  const node = document.createElement("div");
  node.classList.add("drag-target");
  node.ondragover = dragoverHandler;
  node.ondrop = dropHandler;
  return node;
}

function createEmptyLetterBlock(){
  const node = document.createElement("div");
  node.classList.add("letter-block-empty");
  return node;
}

function checkWord(n){
  let passed = true;
  const correctWord = unscrambledWords[n];
  const guessArray = eid("unscrambled-container").getElementsByClassName("letter-block-empty");
  const lettersFilledArray = eid("unscrambled-container").getElementsByClassName("letter-block-filled");
  const lettersFilled = lettersFilledArray.length;
  
    //start check. Check if there are empties first
  if(correctWord.length > lettersFilled){
    showModal("You must first use all of the letters.", 2000, true);
    return;
  }
  //clear any previous correct or incorrect classes
  for(let i=0; i<lettersFilled; i++){
    if(lettersFilledArray[i].classList.contains("correct")){
      lettersFilledArray[i].classList.remove("correct");
    }
    if(lettersFilledArray[i].classList.contains("incorrect")){
      lettersFilledArray[i].classList.remove("incorrect");
    }
  }
  for(let i=0; i< guessArray.length; i++){
    const currentBlock = guessArray[i].firstChild;
    if(currentBlock.innerHTML == correctWord[i]){
      currentBlock.classList.add("correct");
      currentBlock.classList.add("correct-animation");
      currentBlock.draggable = false;
      currentBlock.removeEventListener("touchstart", touchStartHandler, { passive: false });
      currentBlock.removeEventListener("touchmove", touchMoveHandler, { passive: false });
      currentBlock.removeEventListener("touchend", touchEndHandler, { passive: false });
    }
    else{
      currentBlock.classList.add("incorrect");
      currentBlock.classList.add("incorrect-animation");
      passed = false;
    }
  }
  if(passed){
    if(currentQuestion >= totalQuestions - 1){
      setTimeout(function(){showSucessModal(3000);}, 1000);
      endTimer();
    }
    else{
      setTimeout(function(){
        eid("flippable-button").style.transform = "rotateY(-180deg)";
    }, 500);
    currentQuestion++;
    }
  }
  else{
    if(!swapHint){
      showModal("Drag one letter onto another to swap. Check your answer again when you are ready.", 5000);
      swapHint = true;
    }    
  }
  
  //clear animations
  setTimeout(function(){
    for(let i=0; i<lettersFilled; i++){
      if(lettersFilledArray[i].classList.contains("correct-animation")){
        lettersFilledArray[i].classList.remove("correct-animation");
      }
      if(lettersFilledArray[i].classList.contains("incorrect-animation")){
        lettersFilledArray[i].classList.remove("incorrect-animation");
      }
    }
  }, 300);
}


//drag and drop CHROME
function dragStartHandler(e){
  currentDrag = e.target;
  currentDragParent = e.target.parentNode;
  console.log("target");
  console.log(e.target);
  console.log("parent");
  console.log(currentDragParent);
}

function dragoverHandler(e){
  e.preventDefault();
}

function determineDropContainer(item, target){
  if(target.firstChild){
    let newTarget = target.parentNode;
    currentDragParent.append(target);
    newTarget.append(item);
  }
  else{
    target.append(item);
  }
}

function dropHandler(e){
  e.preventDefault();
  console.log("Drop Target");
  console.log(e.target);
  if(e.target.classList.contains("letter-block-empty") || e.target.classList.contains("letter-block-filled")){
    determineDropContainer(currentDrag, e.target);
  }
  else if(e.target.classList.contains("drag-target")){
    determineDropContainer(currentDrag, e.target.firstChild);
  }
  else if(e.target.id == "scrambled-container" || e.target.parentNode.id == "scrambled-container"){
    eid("scrambled-container").append(currentDrag);
  }
  console.log(eid("unscrambled-container").getElementsByClassName("letter-block-empty"));  
  currentDrag = null;
  currentDragParent = null;
}

//drag and drop MOBILE
//Add enlarged zones and ability to drag back to unscrambled container
function touchStartHandler(e) {
  currentDrag = e.target;
  currentDragParent = e.target.parentNode;
  //reduce opacity for visual feedback
  e.target.style.opacity = "0.6"; 
}


function touchMoveHandler(e) {
  e.preventDefault(); // prevent scrolling
  const touch = e.touches[0];  //corresponds to a single finger touch or the first in a two-finger press
  const elem = currentDrag;
  if (elem) {
    elem.style.position = "absolute";
    elem.style.left = touch.clientX + "px";
    elem.style.top = touch.clientY - currentDrag.parentNode.getBoundingClientRect().top + "px";
  }
}


function touchEndHandler(e) {
  const touch = e.changedTouches[0];  //corresponds to the movement of the first finger
  let target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (currentDrag) {
    if(target.classList.contains("letter-block-filled") && target.parentNode != eid("title")){
      //element is occupied by a current draggable object
      let newTarget = target.parentNode;
      currentDragParent.append(target);
      newTarget.append(currentDrag);
    }
    else if(target.classList.contains("letter-block-empty")){
      target.append(currentDrag);
    }
    else if(target.classList.contains("drag-target")){
      determineDropContainer(currentDrag, target.firstChild);
    }
    else if(target.id == "scrambled-container"){
      target.append(currentDrag);
    }
  }

  if (currentDrag) {
      currentDrag.style.opacity = "1";
      currentDrag.style.position = "";
      currentDrag.style.left = "";
      currentDrag.style.top = "";
  }
  currentDrag = null;
  currentDragParent = null;
}

eid("check").onclick = function(){
    checkWord(currentQuestion);
}

eid("next").onclick = function(){
    toggleGameContainer();
    setTimeout(function(){
        nextWord(currentQuestion);
        toggleGameContainer();
    }, opacityDuration);
    eid("flippable-button").style.transform = "";
}

function toggleGameContainer(){
  if(!gameContainerVisible){
    eid("gameplay-container").style.visibility = "visible";
    eid("gameplay-container").style.opacity = 1;
    if(firstGame){
        firstGame = false;
      eid("gameplay-container").classList.add("move-body-up");
      setTimeout(function(){
        eid("gameplay-container").style.opacity = 1;
        eid("gameplay-container").style.top = "-240px";
        eid("gameplay-container").classList.remove("move-body-up");
    }, opacityDuration);
    }      
    gameContainerVisible = !gameContainerVisible;
  }
  else{
    eid("gameplay-container").style.opacity = 0;
    setTimeout(function(){
      eid("gameplay-container").style.visibility = "hidden";
    }, opacityDuration);
    gameContainerVisible = !gameContainerVisible;
  }
}

eid("start-game").onclick = function(){
  //hide main
  eid("main").style.opacity = 0;
  setTimeout(function(){
    eid("main").style.display = "none";
    eid("subtitle").style.display = "block";
    eid("gameplay-container").style.display = "block";
    eid("flippable-button-container").style.display = "block";
    eid("menu-bar").style.visibility = "visible";
    eid("menu-bar").style.opacity = 1;
    eid("subtitle").style.visibility = "visible";
    eid("subtitle").classList.add("move-body-up");
    eid("flippable-button-container").style.visibility = "visible";
    eid("flippable-button-container").classList.add("move-body-up");
    eid("page-container").style.height = eid("page-container").clientHeight - 8*16 + "px";
    toggleGameContainer();
    startTimer();
  }, opacityDuration);
}

function showSucessModal(duration){
  eid("successModal").innerHTML = "";
  eid("successModal").style.visibility = "visible";
  const miximFireworks = lottie.loadAnimation({
    container: successModal,
    path: 'https://mrroseteacher.github.io/mixim/miximFireworks.json',
    render: 'svg',
    loop: false,
    autoplay: true
  });
  eid("successModal").style.opacity = 0.97;
  setTimeout(function(){
    eid("successModal").style.opacity = 0;
  }, opacityDuration + duration);
  setTimeout(function(){
    eid("successModal").style.visibility = "hidden";
  }, opacityDuration*2 + duration);
  altStyleModal();
  showModal(successMsg, duration);
  setTimeout(function(){
    resetModalStyle();
  }, duration*1.5);
}

function resetModalStyle(){
  eid("modal").style.top = "8rem";
  eid("modal").style.border = "2px solid var(--darkGrey)";
  eid("modal").style.background = "var(--lightBG)";
  eid("modal").style.color = "var(--text)";
  eid("modal").style.padding = "2rem";
  eid("modal").style.boxShadow = "0px 10px 10px -6px var(--medLightGrey), 0px -10px 10px -6px var(--medLightGrey), -10px 0px 10px -6px var(--medLightGrey), 10px 0px 10px -6px var(--medLightGrey)";
  eid("modal").style.fontWeight = "400";
}

function altStyleModal(){
  if(window.innerWidth >= 651 && window.innerWidth <= 850){
    eid("modal").style.top = "300px";
  }
  else if(window.innerWidth > 850){
    eid("modal").style.top = "380px";
  }
  else{
    eid("modal").style.top = "420px";
  }
  eid("modal").style.border = "none";
  eid("modal").style.background = "var(--extraLightBG)";
  eid("modal").style.color = "var(--text";
  eid("modal").style.boxShadow = "none";
  eid("modal").style.fontWeight = "700";
  eid("modal").style.padding = "1rem";
}

window.onload = function(){
  parseContent(decoded);
  setTimeout(function(){
      eid("main").style.opacity = 1;
      eid("main").style.top = "-240px";
      eid("main").classList.remove("move-main-up");
  }, 3500);
  eid("remix-link").href = remixLink;
  eid("scrambled-container").ondragover = dragoverHandler;
  eid("scrambled-container").ondrop = dropHandler;
  nextWord(0);
}
