<?php

session_start();

$operation = $_REQUEST['operation'];

//==============================================================================
// Chargement du contexte
// -- (selon le type d'operation)
//==============================================================================

if ($operation=="connect" OR $operation=="register"
    OR $operation=="disconnect" OR $operation=="check")
{
  $user = $_REQUEST['user'];
  $pass = $_REQUEST['pass'];
  if ($pass) { $hashpass = password_hash($_REQUEST['pass'], PASSWORD_DEFAULT); }
}

elseif ($operation=="save" OR $operation=="load" )
{
  $id = $_SESSION['id'];

  $operation = $_REQUEST['operation'];
  $data = $_REQUEST['data'];
  $settings = $_REQUEST['settings'];
}

//==============================================================================
// Fonction de Connection Mysqli    ----    A MODIFIER !!!!
// -- utilisee pour toutes les requetes mysql
// -- A modifier en cas de changement de Serveur
//==============================================================================

function connect_mysqli()
{

  $servername = "myverysecuresqlserverURL";
  $userDB = "myverysecuresqlDBNAME";
  $passDB = "myverysecuresqlDBPASSWORD";
  $database = "notemanager_sql";
  
  if ( $conn = new mysqli($servername, $userDB, $passDB, $database) )
  { return $conn; }
  else
  { echo "DataBaseConnectionError"; }
}

//==============================================================================
// Connection Functions
// -- Pour gerer l'acces et l'inscription au site.
//==============================================================================

function register($user, $hashpass)
{
  $conn = connect_mysqli();
  if ( $stmt = $conn->prepare("INSERT INTO Accounts (username, password) VALUES ( ? , ? )") )
  {
    $stmt->bind_param("ss", $user, $hashpass);
    $stmt->execute();
    $stmt->close();
    if ($conn->affected_rows==-1)
    { echo "RegisteredSuccesfully"; }
  }
  else
  { echo "DataBaseRequestError"; }
}

function checkUser($user, $pass=false)
// -- Tries to connect if argument $pass is set.
// -- Returns whether $user is registered.
{
  $conn = connect_mysqli();
  if ( $stmt = $conn->prepare("SELECT id, username, password FROM Accounts WHERE username=?") )
  {
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_row();
    $stmt->close();

    if ($row[1]==$user)
    {
      if ($pass)
      {
        if ( password_verify($pass, $row[2]) )
        {
          $_SESSION['user'] = $user;
          $_SESSION['id'] = $row[0];
          $_SESSION['connected'] = true;
          echo "Connected:".$user;
          return true;
        }
        else
        { echo "WrongPassword"; return false; }
      }
      else
      { echo "UserRegistered"; return true; }
    }
    else
    { echo "UserNotRegistered"; return false; }
  }
  else
  { echo "DataBaseRequestError"; return false; }
}

//==============================================================================
// Load/Save Data Functions
// -- Pour sauvegarder/charger les donnees et parametres utilisateur.
//==============================================================================

function saveData($data, $id)
{
  $conn = connect_mysqli();
  if ( $stmt = $conn->prepare("UPDATE Accounts SET Data = ? WHERE id = ?") )
  {
    $encdata = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $stmt->bind_param("si", $encdata, $id);
    $stmt->execute();
    $stmt->close();
    if ($conn->affected_rows==-1)
    { echo "SavedSuccesfully"; }
  }
  else
  { echo "DataBaseRequestError"; }
}

function saveSettings($settings, $id)
{
  $conn = connect_mysqli();
  if ( $stmt = $conn->prepare("UPDATE Accounts SET Settings = ? WHERE id = ?") )
  {
    $stmt->bind_param("si", $settings, $id);
    $stmt->execute();
    $stmt->close();
    if ($conn->affected_rows==-1)
    { echo "SavedSuccesfully"; }
  }
  else
  { echo "DataBaseRequestError"; }
}

function loadData($id)
{
  $conn = connect_mysqli();
  if ( $stmt = $conn->prepare("SELECT Data FROM Accounts WHERE id = ?") )
  {
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_row();
    $stmt->close();
    $encdata = $row[0];
    $data = json_decode($encdata, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    echo $data;
  }
  else
  { echo "DataBaseRequestError"; }
}

function loadSettings($id)
{
  $conn = connect_mysqli();
  if ( $stmt = $conn->prepare("SELECT Settings FROM Accounts WHERE id = ?") )
  {
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_row();
    $stmt->close();
    echo $row[0];
  }
  else
  { echo "DataBaseRequestError"; }
}

//==============================================================================
// Connection Operations
// -- Suite des fonctions a executer selon l'operation d'acces
//==============================================================================

if ($operation=="connect")
{
  checkUser($user, $pass);
}
elseif ($operation=="register")
{
  if (!checkUser($user))
  {
    register($user, $hashpass);
    ob_end_clean();
    checkUser($user, $pass);
  }
}
elseif ($operation=="disconnect")
{
  $_SESSION['connected'] = false;
  echo "Disconnected";
}
elseif ($operation=="check")
{
    if ($_SESSION['connected'])
    { echo "Connected:".$_SESSION['user']; }
    else
    { echo "NotConnected"; }
}

//==============================================================================
// Load/Save Data Operations
// -- Suite des fonctions a executer selon l'operation de donnees
//==============================================================================

elseif ($_SESSION['connected'])
{
  if ($operation=="save")
  {
    if ($data)
    { saveData($data, $id); }
    if ($settings)
    { saveSettings($settings, $id); }
  }
  elseif ($operation=="load")
  {
    if ($data)
    { loadData($id); }
    elseif ($settings)
    { loadSettings($id); }
  }
}
else
{ echo "NotConnected"; }

?>
