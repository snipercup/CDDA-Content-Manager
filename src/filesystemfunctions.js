const fs = require('fs');
const path = require('path');
const app = require('electron').remote.app


//Gets the directory from which the application was launched.
function getWorkingDirectory(){
	const basepath = app.getAppPath();
	return basepath;
}



//Gets the cataclysm game folder previously selected by the user
async function getCataclysmGameFolder(){
	if(!fileExists("userSettings.json")){
		return false;
	}
	
	const util = require('util');
	const readfile = util.promisify(fs.readFile);

	let names;
	try {
		data = await readfile('userSettings.json');
	} catch (err) {
		console.log(err);
	}
	if (data === undefined) {
		console.log('[getCataclysmGameFolder]:undefined');
	} else {
		let jsonParsed = JSON.parse(data);
		return jsonParsed["cataclysmGameFolder"];
	}
}



//Gets the cataclysm game folder previously selected by the user
async function getUserSetting(settingName){
	if(!fileExists("userSettings.json")){
		return false;
	}
	
	const util = require('util');
	const readfile = util.promisify(fs.readFile);

	let names;
	try {
		data = await readfile('userSettings.json');
	} catch (err) {
		console.log(err);
	}
	if (data === undefined) {
		console.log('[getCataclysmGameFolder]:undefined');
	} else {
		let jsonParsed = JSON.parse(data);
		return jsonParsed[settingName];
	}
}


//Takes a directory string, i.e. c:\users\tom\somefolder
//Returns a list of all the files in the folder and subfolders
//The returned filenames are full path names, i.e. c:\users\tom\somefolder\somesettings.json
async function getAllFiles(dirPath, arrayOfFiles) {
	let files = fs.readdirSync(dirPath)
    let i = 0;
    let amountOfFiles = files.length;
	let fullFilePath = "";

    for (; i < amountOfFiles; i++) {
		if (files[i]) {
			fullFilePath = dirPath + "/" + files[i];
			if (fs.statSync(fullFilePath).isDirectory()) {
				arrayOfFiles = await getAllFiles(fullFilePath, arrayOfFiles)
			} else {
				arrayOfFiles.push(path.join(dirPath, "/", files[i]))
			}
		} else {
			console.log("files[i] does not have a name");
		}
    }
	return arrayOfFiles
}

//Takes a directory string, i.e. c:\users\tom\somefolder
//Returns a list of all the JSON files in the folder and subfolders
//The returned filenames are full path names, i.e. c:\users\tom\somefolder\somesettings.json
async function getJSONFilesFromFolder(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);
  let fullFilePath = "";

  //Loop over all files and folders in the given directory
  for (let i = 0, amountOfFiles = files.length; i < amountOfFiles; i++) {
    if (files[i]) {
      fullFilePath = dirPath + "/" + files[i];
      if (fs.statSync(fullFilePath).isDirectory()) { //If it is a directory, get all files from that directory
        arrayOfFiles = await getJSONFilesFromFolder(fullFilePath, arrayOfFiles)
      } else {
        if(files[i].split('.').pop() == "json"){
          if(Array.isArray(arrayOfFiles)){
           arrayOfFiles.push(path.join(dirPath, "/", files[i]));
          } else {
            console.log("arrayOfFiles is not an array");
          }
        }
      }
    } else {
      console.log("files[i] does not have a name");
    }
  }
  return arrayOfFiles
}

//Takes a list of folders and returns a list of all JSON files in all folders, recursively.
//The list of folders must include full folder path, i.e. c:\users\tom\somfolder
async function getJSONFilesFromFolderList(folderList) {
    let fullFilePath = "";
    arrayOfFiles = [];
    for (let i = 0, amountOfFolders = folderList.length; i < amountOfFolders; i++) {
        arrayOfFiles = (await getJSONFilesFromFolder(folderList[i], arrayOfFiles));
    }
    return arrayOfFiles
}



//Checks if the user wants to include core and/or mods in the folder list
//Returns a list of all accepted folders. For core this will be \data\json and 
//for mods this will be a list of folders in \data\mods
async function getContentFolderList() {
    let fullFilePath = "", addCore = true, addMods = true;
    let listOfFolders = [];
    
    let userSettingsJSON = await getJsonFromFile("userSettings.json");
    if(!userSettingsJSON){
      return; //Cataclysm game folder is not set!
    } else {
      if(userSettingsJSON.includeCore == false){
        addCore = false;
      }
      if(userSettingsJSON.includeMods == false){
        addMods = false;
      }
    }
    
    if(addCore) {
      listOfFolders.push(await getCataclysmGameFolder() + DATA_JSON);
    }
    if(addMods) {
      let modlist = await getFoldersFromFolder(await getCataclysmGameFolder() + DATA_MODS, false);
      listOfFolders.push.apply(listOfFolders, modlist);
    }
    return listOfFolders;
}



//Takes a directory string, i.e. c:\users\tom\somefolder
//Returns a list of all the folder in the folder
//The returned folder names i.e. somefolder, anotherfolder
async function getFolderNamesFromFolder(dirPath) {
	let files = fs.readdirSync(dirPath);
	let fullFilePath = "";
  let arrayOfFolders = [];

  for (let i = 0, amountOfFiles = files.length; i < amountOfFiles; i++) {
		if (files[i]) {
			fullFilePath = dirPath + "\\" + files[i];
			if (fs.statSync(fullFilePath).isDirectory()) {
				arrayOfFolders.push(files[i])
			}
		} else {
			console.log("files[i] does not have a name");
		}
  }
	return arrayOfFolders
}

//Takes a directory string, i.e. c:\users\tom\somefolder
//Returns a list of all the folder paths or folder names in the folder
//The returned folder names i.e. somefolder, anotherfolder or:
//The returned folder paths i.e. c:\users\tom\somefolder, c:\users\tom\anotherfolder
async function getFoldersFromFolder(dirPath, returnOnlyNames) {
	let files = fs.readdirSync(dirPath);
	let fullFilePath = "";
  let arrayOfFolders = [];

  for (let i = 0, amountOfFiles = files.length; i < amountOfFiles; i++) {
		if (files[i]) {
			fullFilePath = dirPath + "\\" + files[i];
			if (fs.statSync(fullFilePath).isDirectory()) {
        if(returnOnlyNames){
          arrayOfFolders.push(files[i]);
        } else {
          arrayOfFolders.push(fullFilePath);
        }
			}
		} else {
			console.log("files[i] does not have a name");
		}
  }
	return arrayOfFolders
}


		
//Writes the json object to a json file.
function writeJsonFile(jsonString, fileName){
	fs.writeFile(fileName, jsonString + "\n", 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
	}); 
}
		
function getFiltersFilePath(){
	const basePath = getWorkingDirectory();
	return basePath + "\\data\\json\\editform\\filters.json";
}



//Returns the contents of a json file in the form of a JSON object
async function getJsonFromFile(filepath){
	if(!fileExists(filepath)){
		return false;
	}
	if(filepath.split('.').pop() != "json"){
		//console.log('[getJsonFromFile]: skipped file \"'+filepath+'\", it is not a json file');
		return false;
	}
	
	const util = require('util');
	const readfile = util.promisify(fs.readFile);

	let names;
	try {
		data = await readfile(filepath);
	} catch (err) {
		console.log(err);
	}
	if (data === undefined) {
		console.log('[getJsonFromFile]:undefined');
	} else {
		let jsonObj;
		try {
      //There may be comments in the file in the form of "//": keys. These will be replaced by "commentx": where x is a number.
      //This is neede because there may be more then 1 comment and then there are duplicate keys, which have to be resolved.
      let strjson = String(data)
      if(strjson.includes('"//":')){
        let jsonArray = strjson.split('    "//":'), newstr = "";
        for(let n = 0, arrayLen = jsonArray.length; n < arrayLen; n++){
          newstr += jsonArray[n]; //Put the json string together again
          if(n < arrayLen-1){
            newstr += "    \"comment" + n + "\":"; //Replace the comment key with a unique key
          }
        }
        
        strjson = newstr;
      }
      //Here we convert starting_ammo from an object to an array. This is required because starting_ammo may use numeric keys and it messes up the order of properties.
      newstr = "";
      let line = ""
      if(strjson.includes("starting_ammo") && !filepath.includes("schema") && !filepath.includes("filter")){
        var lines = strjson.split('\n');
        for(var i = 0;i < lines.length;i++){
          line = lines[i];
          if (line.includes("starting_ammo")){
            // console.log("1starting_ammo = " + line);
            line = replaceAll(line, "{", "[ [");
            line = replaceAll(line, "},", "______");
            line = replaceAll(line, ",", " ], [");
            line = replaceAll(line, "______", "] ],");
            line = replaceAll(line, ":", ",");
            line = replaceAll(line, "starting_ammo\",", "starting_ammo\":");
            // console.log("2starting_ammo = " + line);
          }
          newstr += line;
        }
        jsonObj = JSON.parse(newstr);
      } else {
        jsonObj = JSON.parse(strjson);
      }
 
		} catch (e) {
			if (e instanceof SyntaxError) {
				console.log('[getJsonFromFile]: file \"'+filepath+'\", contains bad syntax');
				printError(e, true);
			} else {
				printError(e, false);
			}
		}
		return jsonObj;
	}
}
var printError = function(error, explicit) {
    console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
}

		
function fileExists(fileName){
	try {
	  if (fs.existsSync(fileName)) {
		//file exists
		return true;
	  }
	} catch(err) {
	  console.log(err);
    return false;
	}
}