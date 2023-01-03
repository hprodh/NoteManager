<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title> ❒ NoteManager ❒ </title>
  <link rel="stylesheet" href="style.css">
  <script type="text/javascript" src="scripts.js"></script>
  <!-- ColorSVGPicker from https://github.com/dolfelt/color-svg/ -->
  <link href="dolfelt-color-svg/color-svg.css" media="screen" rel="stylesheet" type="text/css" />
  <script src="dolfelt-color-svg/dependencies.min.js"></script>
  <script src="dolfelt-color-svg/color-svg.js"></script>
</head>

  <div id="divtitle">
    <div id="divbuttonsleft" class="divbuttonleft">
      <button id="buttonload" onclick='reloadSession()'>
	       <img src='reload_white.svg' height=12px />
       </button>
      <button id="buttonsave" onclick='saveSession()'>
	       <img src="save_white.svg" height=12px />
       </button>
      <button id="buttonlist" onclick="toggleDiv('divlist')">
	       <img src="listnotes_white.svg" height=12px />
         [ ]
       </button>
      <button id="buttonadd" onclick="addDivNote()">
	       <img src="addnote_white.svg" height=12px />
       </button>
    </div>
    <div class="ghost-div left"></div>
    <div>NoteManager</div>
    <div class="ghost-div right"></div>
    <div class="color-picker-wrapper" onclick="changeBgColor()">
      <input id="colorpickerbg" type="text" class="color-picker">
    </div>
    <div id="divbuttonuser" class="divbuttonright">
      <input id="buttonuser" type="button" onclick="toggleDiv('divconn')" value="👤">
    </div>
  </div>

  <script type="text/javascript">
    ColorSVG.init(document.getElementById('colorpickerbg'));
  </script>

  <div id="divconn" style="display:none">
      <form id="formconn">
          <div class="input-line" id="divinputuser" style="display:none">
              user : <input type="text" id="inputuser"
                            placeholder="Entrer le nom d'utilisateur" required>
          </div>
          <div class="input-line" id="divinputpass" style="display:none">
              pass : <input type="password" id="inputpass"
                            placeholder="Entrer le mot de passe" required>
          </div>
        <input type="button" id="buttonconn">
      </form>
  </div>

  <div id="divlist" style="display:none">
    <form  id="formdivlist">
    </form>
  </div>

  <script type="text/javascript">
    initializeAJAX();
  </script>

</body>
</html>
