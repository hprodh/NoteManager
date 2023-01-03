//==============================================================================
// Fonctions pour afficher l'interface
//==============================================================================

function outputBackground(str)
{
  var divoutput = document.createElement("div");
  divoutput.innerHTML = str;
  document.body.appendChild(divoutput);
  setTimeout( function(){divoutput.remove();}, 4000 );
}

function changeBgColor() {
  hexcolor = rgbToHex(document.getElementById('colorpickerbg').value);
  document.body.style.backgroundColor = hexcolor;
  outputBackground("ChangedBackgroundColor:"+hexcolor);
}

function updateDivList() {
  // list all divnotes
  var divnotes = document.getElementsByClassName('divnote');
  //update divnotes counter
  var countnotes = divnotes.length;
  // document.getElementById('buttonlist').value = '🗊['+countnotes+']';
  document.getElementById('buttonlist').innerHTML = "<img src='listnotes_white.svg' height=12px />["+countnotes+"]";
  //empty divlist
  var formdivlist = document.getElementById('formdivlist');
  formdivlist.innerHTML = "";

  //create the entries :
  for (divnote of divnotes) {
    // get note number
    var numnote = divnote.numnote;
    // create line
    var line = document.createElement("div");
    line.className = "input-line";
    formdivlist.appendChild(line);
    // title field
    var titlefield = document.createElement("input");
    titlefield.id = "titlefield"+numnote;
    titlefield.type = "text";
    titlefield.value = divnote.handtitle.innerHTML;
    titlefield.style.backgroundColor = divnote.hand.style.backgroundColor;
    titlefield.style.color = divnote.hand.style.color;
    titlefield.setAttribute('onchange', 'renameDivNote('+numnote+')');
    line.appendChild(titlefield);
    // button erasetitle
    var buttonera = document.createElement("input");
    buttonera.type = "button";
    buttonera.value = "⌫";
    buttonera.setAttribute('onclick', 'clearTitle('+numnote+')');
    line.appendChild(buttonera);
    // button remove
    var buttondel = document.createElement("input");
    buttondel.type = "button";
    buttondel.value = "X";
    buttondel.setAttribute('onclick', 'removeDivNote('+numnote+')');
    line.appendChild(buttondel);
  }
}

function initializeAJAX()
{ RequestAJAX("dbio.php", "?operation=check", updateDivConn); }

function logIn() {
  let user = document.getElementById('inputuser').value;
  let pass = document.getElementById('inputpass').value;
  RequestAJAX("dbio.php",
              "?operation=connect"+"&user="+user+"&pass="+pass,
              updateDivConn);
}

function logOut() {
  RequestAJAX("dbio.php", "?operation=disconnect", updateDivConn);
  removeAllDivNotes();
}

function signIn() {
  let user = document.getElementById('inputuser').value;
  let pass = document.getElementById('inputpass').value;
  RequestAJAX("dbio.php",
              "?operation=register"+"&user="+user+"&pass="+pass,
              updateDivConn);
}

function updateDivConn(userstate) {
  outputBackground(userstate);
  if (userstate=="NotConnected" || userstate=="Disconnected") {
    document.getElementById('divinputuser').style.display = "flex";
    document.getElementById('divinputpass').style.display = "flex";
    document.getElementById('buttonconn').value = "Connect";
    document.getElementById('buttonconn').setAttribute('onclick', 'logIn()');
    document.getElementById('buttonuser').value = "👤";
  } else if (userstate=="UserNotRegistered") { //propose to register
    document.getElementById('divinputuser').style.display = "flex";
    document.getElementById('divinputpass').style.display = "flex";
    document.getElementById('buttonconn').value = "Register";
    document.getElementById('buttonconn').setAttribute('onclick', 'signIn()');
    document.getElementById('buttonuser').value = "👤";
  } else if (userstate.substring(0,10)=="Connected:") { // connected
    document.getElementById('divinputuser').style.display = "none";
    document.getElementById('divinputpass').style.display = "none";
    document.getElementById('buttonconn').value = "Disconnect";
    document.getElementById('buttonconn').setAttribute('onclick', 'logOut()');
    document.getElementById('buttonuser').value = userstate.substring(10);
    loadSession();
  }
}

// Fonctions pour afficher/cacher des divs :
function hideDiv(id) {
    var div = document.getElementById(id);
    div.style.display = 'none';
}
function showDiv(id) {
  var div = document.getElementById(id);
  div.style.display = 'flex';
}
function toggleDiv(id) {
    var div = document.getElementById(id);
    if (div.style.display=='flex') { hideDiv(id); }
    else if (div.style.display=='none') { showDiv(id); }
}



function saveDivNotes() {
  // Faire une liste de tableau des attributs chaque divnote
  let divnotes = document.getElementsByClassName("divnote");
  let divnotearrlist = [];
  for (let divnote of divnotes)
  { divnotearrlist.push(getDivNoteAttributes(divnote)); }
  // Stringifier ça avec JSON et requete AJAX
  let strreq = "?operation=save&data="+JSON.stringify(divnotearrlist);
  RequestAJAX("dbio.php", strreq, outputBackground);
}

function saveProfile() {
  let arrsettings = { "backgroundColor" : document.body.style.backgroundColor };
  let strreq = "?operation=save&settings="+JSON.stringify(arrsettings);
  RequestAJAX("dbio.php", strreq, function(){});
}

function saveSession() {
  saveDivNotes();
  saveProfile();
}

function loadDivNotes() {
  let strreq = "?operation=load&data=1";
  RequestAJAX("dbio.php", strreq, createDivNotesFromList);
}

function loadProfile() {
  let strreq = "?operation=load&settings=1";
  RequestAJAX("dbio.php", strreq, applySettings);
}

function loadSession() {
  loadDivNotes();
  loadProfile();
  outputBackground("SessionLoaded");
}

function reloadSession() {
  removeAllDivNotes();
  loadDivNotes();
  loadProfile();
  outputBackground("SessionReloaded");
}

function createDivNotesFromList(json_listdiv) {
  var listdiv = JSON.parse(json_listdiv);
  for (var divnotearr of listdiv)
  { createDivNoteFromArr(divnotearr); }
  updateDivList();
}

function applySettings(json_settings) {
  var settings = JSON.parse(json_settings);
  document.body.style.backgroundColor = settings['backgroundColor'];
}


function RequestAJAX(filename, strreq, callbackfunction) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200)
      { callbackfunction(this.responseText); }
  };

  xmlhttp.open("POST", filename + strreq, true);
  xmlhttp.send();
}

//==============================================================================
// Fonctions pour les divnotes
//==============================================================================

function createDivNote(numnote, title, text, editable, color,
                       xpos, ypos, xsize, ysize) {
  var divnote = document.createElement('div');
  divnote.numnote = numnote;
  divnote.id = 'divnote'+numnote;
  divnote.className = 'divnote';
  document.body.appendChild(divnote);

  divnote.hand = document.createElement('div');
  divnote.hand.className = 'divnotehand';
  divnote.hand.style.backgroundColor = color;
  divnote.appendChild(divnote.hand);

  divcolorpicker = document.createElement('div')
  divcolorpicker.className = 'color-picker-wrapper';
  divcolorpicker.setAttribute("onclick", "setColor("+numnote+")");
  divcolorpicker.setAttribute("onmouseover", "unclip("+numnote+")")
  divcolorpicker.setAttribute("onmouseout", "clip("+numnote+")")
  divnote.hand.appendChild(divcolorpicker);

  divnote.handtitle = document.createElement('div');
  divnote.handtitle.className = 'handtitle';
  divnote.handtitle.innerHTML = title;
  divnote.hand.appendChild(divnote.handtitle);

  divnote.buttonedit = document.createElement('button');
  divnote.buttonedit.className = 'buttonedit';
  if (editable==true) { divnote.buttonedit.innerHTML ='🔓'; }
  else { divnote.buttonedit.innerHTML ='🔒'; }
  divnote.buttonedit.setAttribute('onclick', 'toggleEdit('+numnote+')')
  divnote.hand.appendChild(divnote.buttonedit);

  divnote.colorpicker = document.createElement('input');
  divnote.colorpicker.type = 'button';
  divnote.colorpicker.className = 'color-picker';
  divnote.colorpicker.value = color;
  divcolorpicker.appendChild(divnote.colorpicker);
  ColorSVG.init(divnote.colorpicker);

  divnote.text = document.createElement('div');
  // divnote.text.id = 'divnote'+numnote+'text';
  divnote.text.className = 'divnotetext';
  divnote.text.innerHTML = text;
  divnote.text.contentEditable = editable;
  divnote.appendChild(divnote.text);

  divnote.style.left = xpos;
  divnote.style.top = ypos;
  divnote.style.width = xsize;
  divnote.style.height = ysize;

  setColor(numnote);
  dragElement(divnote);
  updateDivList();
}

function createDivNoteFromArr(divnotearr) {
  createDivNote( seekFreeNumNote(), //Pour éviter les doublons d'id
                  divnotearr['title'],
                  divnotearr['text'],
                  divnotearr['editable'],
                  divnotearr['color'],
                  divnotearr['xpos'],
                  divnotearr['ypos'],
                  divnotearr['xsize'],
                  divnotearr['ysize']  );
}

function addDivNote() {
  var num = seekFreeNumNote();
  // position(en fonction de num) et taille par défaut
  var xpos = 280 + 100*(num-1) + "px";
  var ypos = 160 + 60*(num-1) + "px";
  var xsize = 280 + "px";
  var ysize = 200 + "px";
  createDivNote(num, 'note'+num, '...', true, "rgb(23, 74, 167)",
                xpos, ypos, xsize, ysize);
  outputBackground("NoteCreated");
}

function seekFreeNumNote() {
  // on cherche un numero libre
  var num = 1;
  var seek = true;
  while (seek) {
    if (document.getElementById('divnote'+num)) { num = num + 1; }
    else { seek = false; }
  }
  return num;
}

function renameDivNote(numnote) {
  var divnote = document.getElementById('divnote'+numnote);
  var title = document.getElementById('titlefield'+numnote).value;
  divnote.handtitle.innerHTML = title;
  updateDivList();
}

function clearTitle(numnote) {
  document.getElementById('divnote'+numnote).handtitle.innerHTML = "";
  updateDivList();
}

function removeDivNote(numnote) {
  var divnote = document.getElementById('divnote'+numnote);
  divnote.remove();
  updateDivList();
  outputBackground("NoteRemoved")
}

function removeAllDivNotes() {
  var doRemove = true;
  while (doRemove) {
    var divnotes = document.getElementsByClassName('divnote');
    if (divnotes.length > 0)
    {
      for (var divnote of divnotes)
      { divnote.remove(); }
    }
    else { doRemove = false; }
  }
  updateDivList();
}

function toggleEdit(numnote) {
  var divnote = document.getElementById('divnote'+numnote);
  var editable = divnote.text.contentEditable;

  if (editable == 'inherit' || editable == 'false') {
    divnote.text.contentEditable = true;
    divnote.buttonedit.innerHTML = '🔓';
  } else {
    divnote.text.contentEditable = false;
    divnote.buttonedit.innerHTML = '🔒';
  }
}

function setColor(numnote) {
  var divnote = document.getElementById('divnote'+numnote);
  var color = divnote.colorpicker.value;
  divnote.hand.style.backgroundColor = color;
  //choose black or white color based on lightness for divnote title
  if (isLightColor(color)) { var fontcolor = 'black'; }
  else { var fontcolor = 'white'; }
  divnote.hand.style.color = fontcolor;
  updateDivList();
}

function clip(numnote) {
  var divnote = document.getElementById('divnote'+numnote);
  divnote.style.overflow = "scroll";
}

function unclip(numnote) {
  var divnote = document.getElementById('divnote'+numnote);
  divnote.style.overflow = "visible";
}

function getDivNoteAttributes(divnote) {
  let divnotearr = { "numnote" : divnote.numnote,
                     "title" : divnote.handtitle.innerHTML,
                     "text" : divnote.text.innerHTML,
                     "editable" : divnote.text.contentEditable,
                     "color" : divnote.hand.style.backgroundColor,
                     "xpos" : divnote.style.left,
                     "ypos" : divnote.style.top,
                     "xsize" : divnote.style.width,
                     "ysize" : divnote.style.height };
  return divnotearr;
}

//==============================================================================
// Fonctions pour rendre les divnotes draggable
//==============================================================================

//Make the div element draggagle:
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (elmnt.hand) {
    /* if present, the header "hand" is where you move the DIV from:*/
    elmnt.hand.onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

//==============================================================================
// Fonctions pour gerer les couleurs
//==============================================================================


// Fonctions pour savoir si une couleur est claire
function lightnessFromRGB(rgbcolor)
{
  rgb = rgbDemux(rgbcolor);
  let fR = parseInt(rgb[0]) / 255.0;
  let fG = parseInt(rgb[1]) / 255.0;
  let fB = parseInt(rgb[2]) / 255.0;

  let max = Math.max(fR, fG, fB);
  let min = Math.min(fR, fG, fB);
  let lightness = (min + max) / 2.0;
  return lightness;
}

function isLightColor(rgbcolor) {
  return lightnessFromRGB(rgbcolor)>=0.5;
}

// Fonctions pour convertir couleur rgb en HEX
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgbcolor) {
  rgb = rgbDemux(rgbcolor);
  return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function rgbDemux(rgbcolor) {
  // "splits" a string 'rgb(X, Y, Z)' in a three-elements array
  rgbs = rgbcolor.substring(4, rgbcolor.length-1).split(', ');
  rgb = [parseInt(rgbs[0]), parseInt(rgbs[1]), parseInt(rgbs[2])];
  return rgb;
}
