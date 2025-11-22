const opacityDuration = 500;

function eid(name){
  return document.getElementById(name);
}

function showModal(content, duration){
  eid("modal").innerHTML = "";
  eid("modal").style.visibility = "visible";
  eid("modal").innerHTML = "<p>" + content + "</p>";
  eid("modal").style.opacity = 0.97;
  setTimeout(function(){
    eid("modal").style.opacity = 0;
  }, opacityDuration + duration);
  setTimeout(function(){
    eid("modal").style.visibility = "hidden";
  }, opacityDuration*2 + duration);
}