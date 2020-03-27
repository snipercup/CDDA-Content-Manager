function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}


//Writes the settings for the user to a json file.
function writeUserSettingsFile(userSettingsJSON){
  const fs = require('fs'); // file system module to perform file operations
   
  // Write the settings to disk
  var jsonContent = JSON.stringify(userSettingsJSON);
  fs.writeFile("userSettings.json", jsonContent, 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }
  }); 
}