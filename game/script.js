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
  decoded = "Common+English+words+and+Canadian+place+names+derived+from+Indigenous+languages.&toboggan&A+long,+flat+sled+traditionally+used+for+winter+travel+and+recreation.+[Mi'kmaq]&moccasin&A+soft+leather+shoe,+historically+worn+by+Indigenous+peoples.+[Algonquin]&kayak&A+small,+narrow+watercraft+originally+used+for+hunting+and+travel.+[Inuktitut]&caribou&A+large+deer+species+native+to+northern+regions,+known+as+reindeer+elsewhere.+[Mi'kmaq]&pecan&A+type+of+nut+from+a+tree+native+to+North+America.+[Algonquin]&chipmunk&A+small+striped+rodent+found+in+North+America.+[Ojibwe]&skunk&A+small+mammal+known+for+its+strong+defensive+odor.+[Algonquin]&Quebec&Derived+from+a+word+meaning+'where+the+river+narrows'.+[Algonquin]&Toronto&Derived+from+a+word+meaning+'meeting+place'.+[Mohawk]&Manitoba&From+a+term+meaning+'strait+of+the+spirit'+or+'lake+of+the+spirit'.+[Cree]&Well+done!+Hopefully+you+learned+a+bit+more+about+these+words.";
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
    // raw[i] = raw[i].replaceAll("+", " ");
    
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
  const boxWidth = (window.screen.width - 16 - 32 - (scrambledWords[n].length - 1)*(16))/scrambledWords[n].length;
  console.log(boxWidth);
  for(let i=0; i<scrambledWords[n].length; i++){
    eid("scrambled-container").append(createLetterBlock(scrambledWords[n][i], boxWidth));
    eid("unscrambled-container").append(createEmptyLetterBlock(boxWidth));
  }
}

function createLetterBlock(letter, width){
  const node = document.createElement("div");
  node.classList.add("letter-block-filled");
  node.style.width = width + "px";
  node.draggable = true;
  node.ondragstart = dragStartHandler;
  //mobile touch listeners
  node.addEventListener("touchstart", touchStartHandler, { passive: false });
  node.addEventListener("touchmove", touchMoveHandler, { passive: false });
  node.addEventListener("touchend", touchEndHandler, { passive: false });
  node.innerHTML = letter;
  return node;
}

function createEmptyLetterBlock(width){
  const node = document.createElement("div");
  node.classList.add("letter-block-empty");
  node.style.width = width + "px";
  //add drag and touch handlers
  node.ondragover = dragoverHandler;
  node.ondrop = dropHandler;
  return node;
}

function checkWord(n){
  let passed = true;
  const correctWord = unscrambledWords[n];
  const guessArray = eid("unscrambled-container").getElementsByClassName("letter-block-empty");
  const lettersFilledArray = eid("unscrambled-container").getElementsByClassName("letter-block-filled");
  const lettersFilled = lettersFilledArray.length;
  
  //clear any previous correct or incorrect classes
  for(let i=0; i<lettersFilled; i++){
    if(lettersFilledArray[i].classList.contains("correct")){
      lettersFilledArray[i].classList.remove("correct");
    }
    if(lettersFilledArray[i].classList.contains("incorrect")){
      lettersFilledArray[i].classList.remove("incorrect");
    }
  }
  //start check. Check if there are empties first
  if(correctWord.length > lettersFilled){
    showModal("You must first use all of the letters", 2000);
    return;
  }
  for(let i=0; i< guessArray.length; i++){
    const currentBlock = guessArray[i].firstChild;
    if(currentBlock.innerHTML == correctWord[i]){
      currentBlock.classList.add("correct");
      currentBlock.classList.add("correct-animation");
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
  if(e.target.parentNode != eid("scrambled-container")){
    currentDragParent = e.target.parentNode;
  }
}

function dragoverHandler(e){
  e.preventDefault();
}

function dropHandler(e){
  e.preventDefault();
  if(e.target.firstChild){
    //element is occupied by a current draggable object
    let newTarget = e.target.parentNode;
    currentDragParent.append(e.target);
    newTarget.append(currentDrag);
  }
  else{
    e.target.append(currentDrag);
  }
  currentDrag = null;
  currentDragParent = null;
}

//drag and drop MOBILE
function touchStartHandler(e) {
  currentDrag = e.target;
  if(e.target.parentNode != eid("scrambled-container")){
    currentDragParent = e.target.parentNode;
  }
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
    eid("menu-bar").style.visibility = "visible";
    eid("menu-bar").style.opacity = 1;
    eid("subtitle").style.visibility = "visible";
    eid("subtitle").classList.add("move-body-up");
    eid("flippable-button-container").style.visibility = "visible";
    eid("flippable-button-container").classList.add("move-body-up");
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
}

function altStyleModal(){
  if(window.screen.width >= 651 && window.screen.width <= 850){
    eid("modal").style.top = "300px";
  }
  else if(window.screen.width > 850){
    eid("modal").style.top = "380px";
  }
  else{
    eid("modal").style.top = "420px";
  }
  eid("modal").style.border = "none";
  eid("modal").style.background = "var(--darkGrey)";
  eid("modal").style.color = "var(--extraLightBG)";
  eid("modal").style.padding = "1rem";
}

parseContent(decoded);
setTimeout(function(){
    eid("main").style.opacity = 1;
    eid("main").style.top = "-240px";
    eid("main").classList.remove("move-main-up");
}, 3500);
eid("remix-link").href = remixLink;
nextWord(0);
