var stringify = require("@aitodotai\\json-stringify-pretty-compact");
var collapsible = require('collapsible');
var JSONEDITOR = require("@json-editor\\json-editor");

async function getIDListOfType(type, includeAbstract = false){
  let jsonList = await getFilteredJsonItemsFromFolderList(await getContentFolderList(), [["type", type, true, true]]);
  let returnList = [];
		let jsonElementID = "", jsonObject, retrievedItem;
		var i = 0;
		for (let i = 0, jsonListLen = jsonList.length; i < jsonListLen; i++) {
			retrievedItem = jsonList[i];
			jsonObject = retrievedItem.jsonObject
			jsonElementID = jsonObject["id"];
      if(jsonElementID){
        returnList.push(jsonElementID);
      } else if(includeAbstract){
        jsonElementID = jsonObject["abstract"];
        if(jsonElementID){
          returnList.push(jsonElementID);
        } 
      }
		}
  return returnList;
}

async function getIDListOfTypeFromCollection(type, collection, includeAbstract = false){
  let jsonList = collection.find({ "jsonObject.type": { $eq: type } });
  let returnList = [], jsonElementID = "", jsonObject, retrievedItem;
  for (let i = 0, jsonListLen = jsonList.length; i < jsonListLen; i++) {
    retrievedItem = jsonList[i];
    jsonObject = retrievedItem.jsonObject
    jsonElementID = jsonObject["id"];
    if(jsonElementID){
      returnList.push(jsonElementID);
    } else if(includeAbstract){
      jsonElementID = jsonObject["abstract"];
      if(jsonElementID){
        returnList.push(jsonElementID);
      } 
    }
  }
  return returnList;
}

//Will return a list of values provided by the displaykey. Filters by type
//Will only return items where the displaykey is present or if abstract is present and includeabstract is true.
async function getTypeFromCollection(type, collection, includeAbstract = false, displayKey){
  let jsonList = collection.find({ "jsonObject.type": { $eq: type } });
  let returnList = [], displayKeyValue = "", jsonObject, retrievedItem;
  for (let i = 0, jsonListLen = jsonList.length; i < jsonListLen; i++) {
    retrievedItem = jsonList[i];
    jsonObject = retrievedItem.jsonObject
    displayKeyValue = jsonObject[displayKey];
    if(displayKeyValue){
      returnList.push(displayKeyValue);
    } else if(includeAbstract){
      displayKeyValue = jsonObject["abstract"];
      if(displayKeyValue){
        returnList.push(displayKeyValue);
      } 
    }
  }
  return returnList;
}

//Will return a list of values provided by the displaykey. Filters by type
//Will only return items where the displaykey is present or if abstract is present and includeabstract is true.
async function getFilteredListFromCollection(filter, collection, includeAbstract = false, displayKey){
  let jsonList = collection.find(filter);
  let returnList = [], displayKeyValue = "", jsonObject, retrievedItem;
  for (let i = 0, jsonListLen = jsonList.length; i < jsonListLen; i++) {
    retrievedItem = jsonList[i];
    jsonObject = retrievedItem.jsonObject
    displayKeyValue = jsonObject[displayKey];
    if(displayKeyValue){
      returnList.push(displayKeyValue);
    } else if(includeAbstract){
      displayKeyValue = jsonObject["abstract"];
      if(displayKeyValue){
        returnList.push(displayKeyValue);
      } 
    }
  }
  return returnList;
}



//from https://github.com/NadaCode/es6-import-test/blob/c6393c45ac5015261eaaa18e46a37f8a54f2202f/es6_test_lib.js
// https://github.com/lydell/json-stringify-pretty-compact
const stringifyPrettyCompact = (json) => {
  
  let schemaDefinition, stringifyOptions, keys, key, value, jsonEntry;
  let jsonString = "[";
  let entryString = "";
  let type, getTypeOptions = false;
  for(let x = 0, jsonlen = json.length; x < jsonlen; x++){ //Loop over every item in the file
    jsonEntry = json[x];
    if(x == 0){
      jsonString += "\n"
    }
    
    //Keep the options of the previous unless the type has changed
    if(type){
      if(type != jsonEntry.type){
        type = jsonEntry.type;
        getTypeOptions = true;
      }
    } else {
      type = jsonEntry.type;
      getTypeOptions = true;
    }
    if(getTypeOptions) {
      options = { maxLength: 120, indent: 6, arrayMargins: true, objectMargins: true}; //defaults
      //Set options defined in the schema. these are the top-level options for the whole entry.
      schemaDefinition = schemas.findOne({ "jsonObject.properties.type.default": { "$eq": type } }).jsonObject;
      if(schemaDefinition.stringifyOptions){
        stringifyOptions = schemaDefinition.stringifyOptions;
        keys = Object.keys(stringifyOptions);
        for(let n = 0, keyLen = keys.length; n < keyLen; n++){
          options[keys[n]] = stringifyOptions[keys[n]];
        }
      }
    }
    
    jsonString += recursiveStringify(jsonEntry, schemaDefinition, options);
    
    
    //Add newline
    if(x < jsonlen-1){
      jsonString += ",\n";
    }
    if(x == jsonlen-1){
      jsonString += "\n";
    }
  }
  jsonString += "]"; //end of the file
  return jsonString;
}

/*
This receives 1 json entry from a file and lints it
jsonEntry: one entry form a json file when depth=0, otherwise it's a object, string, array or whatever that is currently being processed
schemaDefinition: The definition of the json entry. this includes some properties required for linting
options: the stringifyOptions, this contains the maximum length for a line for example
depth: the recursion depth
extraspace: a hack to allow the first object in an array of object to have more space
*/
function recursiveStringify(jsonEntry, schemaDefinition, options, depth = 0, extraspace = 0){
  let jsonString = "", keys, key, value, tempstring = "", arrItem, addSpace, schemakey, optionsCopy, optionsKeys, isNumber;
  
  if(typeof jsonEntry === 'object' && jsonEntry !== null){
    if(Array.isArray(jsonEntry)){ //It's an array
      for(let x = 0, arrLen = jsonEntry.length; x < arrLen; x++){ //Loop over every item in the array
        optionsCopy = getStringifyOptions(schemaDefinition, options, x);
        arrItem = jsonEntry[x];
        if(typeof arrItem === 'object' && arrItem !== null){
          if(x == 0){ //the first entry in an object list gets 3 space extra in a line length because that's what the official linter does.
             tempstring += recursiveStringify(arrItem, schemaDefinition, optionsCopy, depth+1, 3);
          } else {
             tempstring += recursiveStringify(arrItem, schemaDefinition, optionsCopy, depth+1);
          }
        } else {
          tempstring += stringify(arrItem, optionsCopy);
        }
        if(x < arrLen-1){
          tempstring += "||==|| ";
        }
      }
      addSpace = ""
      for(let x = 0; x < depth; x++){ addSpace = addSpace + "  " }
      if(tempstring.length - (jsonEntry.length-1)*5  > options.maxLength){
        tempstring = "[\n    " + addSpace + replaceAll(tempstring, "||==|| ", ",\n    " + addSpace) + "\n  " + addSpace + "]"
      } else {
        tempstring = "[ " + replaceAll(tempstring, "||==|| ", ", ") + " ]";
      }
      jsonString += tempstring;
    } else { //It's an object
      optionsCopy = options
      keys = Object.keys(jsonEntry);
      
      for(let y = 0, keyLen = keys.length; y < keyLen; y++){ //Loop over every key in the entry
        key = keys[y];
        value = jsonEntry[key];
        if(key.includes("comment")){key = "//"} //Comments are transformed from // to commentx where x is a number. Transform them back to // here.
        if(depth == 0){ jsonString += "    " }
        jsonString += "\"" +key+ "\": "
        if(!schemaDefinition){
          console.log("no schemaDefinition")
        }
        if(schemaDefinition.properties){
          schemakey = schemaDefinition.properties[key];
          if(schemakey){
            isNumber = schemakey.type == "number";
            optionsCopy = getStringifyOptions(schemakey, options);
          } else {
            schemakey = schemaDefinition;
          }
        } else {
          schemakey = schemaDefinition;
        }
        if(typeof value === 'object' && value !== null){
          if(key == "starting_ammo"){ //Here we convert key starting_ammo back to a object. This is required because it sometimes uses numeric keys that will always sort on top and we want to maintain order.
            jsonString += "{ "
            for(let x = 0, valLen = value.length; x < valLen; x++){
              jsonString += "\"" + value[x][0] + "\": " + value[x][1];
              if(x<valLen-1){jsonString+= ", "}
            }
            jsonString += " }"
          } else {
            jsonString += recursiveStringify(value, schemakey, optionsCopy, depth+1);
          }
        } else {
          jsonString += stringify(value, optionsCopy); //forward the options to the stringify function
          if(isNumber && Number.isInteger(value)){ 
            jsonString.replace(/.$/,".0\"");
            // jsonString = jsonString.slice(0, -1) + '.0\"'; 
            jsonString += ".0"
          } //If the value is a integer but the schema sais it's a number, put a .0 in the string to make it a number again.
        }
        
        if(y < keyLen-1){
          if(depth == 0){ 
            jsonString += ",\n";
          } else {
            jsonString += "||==|| "; //||==|| represents a comma that will be replaced later
          }
        }
      }
      if(depth == 0){
        jsonString = "  {\n" + jsonString + "\n  }";
      } else {
        if(jsonString.length - (keys.length-1)*5 > optionsCopy.maxLength + extraspace){
          addSpace = ""
          for(let x = 0; x < depth; x++){ addSpace = addSpace + "  " }
          jsonString = replaceAll(jsonString, "||==|| ", ",\n    " + addSpace);
          jsonString = "{\n    " + addSpace + jsonString + "\n  " + addSpace + "}"
        } else {
          jsonString = replaceAll(jsonString, "||==|| ", ", ");
          jsonString = "{ " + jsonString + " }";
        }
      }
    }
  } else {
   if(typeof jsonEntry == 'number'){
    console.log("it's a number");
   }
    return stringify(jsonEntry, options)
  }
  return jsonString;
}

function getStringifyOptions(schemaDefninition, options, x = 0){
  let optionsKeys, type, stringifyOptions, items;
  
  if(schemaDefninition){
    //Try to get the stringify options based off the type of property
    type = schemaDefninition.type;
    if(type){
      if(type == "object"){
        stringifyOptions = schemaDefninition.stringifyOptions;
      } else {
        if(type == "array"){
          items = schemaDefninition.items
          if(typeof items === 'object' && items !== null){
            if(Array.isArray(items)){ //It's an array
              stringifyOptions = schemaDefninition.items[x].stringifyOptions;
            } else { //It's an object
              stringifyOptions = schemaDefninition.items.stringifyOptions;
            }
          }
        }
      }
    } else { //No type was specified. if there are still stringify options, use that.
      if(schemaDefninition.stringifyOptions){
        stringifyOptions = schemaDefninition.stringifyOptions;
      }
    }
  }
  if(stringifyOptions){
    optionsKeys = Object.keys(stringifyOptions);
    for(let n = 0, optkeyLen = optionsKeys.length; n < optkeyLen; n++){
      options[optionsKeys[n]] = stringifyOptions[optionsKeys[n]];
    }
  }
  return options;
}



/*
function recursiveStringify(jsonEntry, schemaDefinition, options, depth = 0){
  let jsonString = "", keys, key, value, tempstring = "", arrItem, addSpace, schemakey, optionsCopy, optionsKeys, isNumber;
  
  if(typeof jsonEntry === 'object' && jsonEntry !== null){
    if(Array.isArray(jsonEntry)){ //It's an array
      for(let x = 0, arrLen = jsonEntry.length; x < arrLen; x++){ //Loop over every item in the array
        arrItem = jsonEntry[x];
        if(typeof arrItem === 'object' && arrItem !== null){
          tempstring += recursiveStringify(arrItem, schemaDefinition, options, depth+1);
        } else {
          tempstring += stringify(arrItem, options);
        }
        if(x < arrLen-1){
          tempstring += "||==|| ";
        }
      }
      addSpace = ""
      for(let x = 0; x < depth; x++){ addSpace = addSpace + "  " }
      if(tempstring.length - (jsonEntry.length-1)*5  > options.maxLength){
        tempstring = "[\n    " + addSpace + replaceAll(tempstring, "||==|| ", ",\n    " + addSpace) + "\n  " + addSpace + "]"
      } else {
        tempstring = "[ " + replaceAll(tempstring, "||==|| ", ", ") + " ]";
      }
      jsonString += tempstring;
    } else { //It's an object
      optionsCopy = options
      keys = Object.keys(jsonEntry);
      for(let y = 0, keyLen = keys.length; y < keyLen; y++){ //Loop over every key in the entry
        key = keys[y];
        value = jsonEntry[key];
        if(key == "magazines"){ 
          console.log("magazines")
        }
        if(key.includes("comment")){key = "//"} //Comments are transformed from // to commentx where x is a number. Transform them back to // here.
        if(depth == 0){ jsonString += "    " }
        jsonString += "\"" +key+ "\": "
        schemakey = schemaDefinition.properties[key];
        if(schemakey){
          isNumber = schemakey.type == "number";
          stringifyOptions = schemakey.stringifyOptions;
          if(stringifyOptions){
            optionsKeys = Object.keys(stringifyOptions);
            for(let n = 0, optkeyLen = optionsKeys.length; n < optkeyLen; n++){
              optionsCopy[optionsKeys[n]] = stringifyOptions[optionsKeys[n]];
            }
          } else {
            optionsCopy = options;
          }
        }
        if(typeof value === 'object' && value !== null){
          if(key == "starting_ammo"){ //Here we convert key starting_ammo back to a object. This is required because it sometimes uses numeric keys that will always sort on top and we want to maintain order.
            jsonString += "{ "
            for(let x = 0, valLen = value.length; x < valLen; x++){
              jsonString += "\"" + value[x][0] + "\": " + value[x][1];
              if(x<valLen-1){jsonString+= ", "}
            }
            jsonString += " }"
          } else {
            jsonString += recursiveStringify(value, schemaDefinition, optionsCopy, depth+1);
          }
        } else {
          jsonString += stringify(value, optionsCopy); //forward the options to the stringify function
          if(isNumber && Number.isInteger(value)){ 
            jsonString.replace(/.$/,".0\"");
            // jsonString = jsonString.slice(0, -1) + '.0\"'; 
            jsonString += ".0"
          } //If the value is a integer but the schema sais it's a number, put a .0 in the string to make it a number again.
        }
        
        if(y < keyLen-1){
          if(depth == 0){ 
            jsonString += ",\n";
          } else {
            jsonString += "||==|| "; //||==|| represents a comma that will be replaced later
          }
        }
      }
      if(depth == 0){
        jsonString = "  {\n" + jsonString + "\n  }";
      } else {
        if(jsonString.length - (keys.length-1)*5 > optionsCopy.maxLength){
          addSpace = ""
          for(let x = 0; x < depth; x++){ addSpace = addSpace + "  " }
          jsonString = replaceAll(jsonString, "||==|| ", ",\n    " + addSpace);
          jsonString = "{\n    " + addSpace + jsonString + "\n  " + addSpace + "}"
        } else {
          jsonString = replaceAll(jsonString, "||==|| ", ", ");
          jsonString = "{ " + jsonString + " }";
        }
      }
    }
  } else {
   if(typeof jsonEntry == 'number'){
    console.log("it's a number");
   }
    return stringify(jsonEntry, options)
  }
  return jsonString;
}*/


		
//Loads a json file, appends one entry and writes it to disk.
async function appendJsonEntryInFile(jsonEntry, fileName){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		sourceJSON.push(jsonEntry);
		writeJsonFile(stringifyPrettyCompact(sourceJSON, stringify, jsonEntry.type), fileName);
	}
}

		
//Loads a json file, updates one entry and writes it to disk.
async function updateJsonEntryInFileById(jsonEntry, fileName){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		for(x in sourceJSON){
			if(sourceJSON[x].id == jsonEntry.id){
				sourceJSON[x] = jsonEntry;
				break;
			}
		}
		writeJsonFile(stringifyPrettyCompact(sourceJSON, stringify, jsonEntry.type), fileName);
	}
}

		
//Loads a json file, updates one entry and writes it to disk.
async function updateJsonEntryInFileByIndex(jsonEntry, fileName, index){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		sourceJSON[index] = jsonEntry;
		writeJsonFile(stringifyPrettyCompact(sourceJSON, stringify, jsonEntry.type), fileName);
	}
}

		
//Loads a json file, updates one entry and writes it to disk.
async function deleteJsonEntryInFileByIndex(jsonEntry, fileName, index){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		var result1 = deleteEntryFromJSONObjectByIndex(sourceJSON).remove(index);
		writeJsonFile(stringifyPrettyCompact(result1.data, stringify, jsonEntry.type), fileName);
	}
}

		
//Loads a json file, updates one entry and writes it to disk.
async function deleteJsonEntryInFileById(jsonEntry, fileName){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		var result1 = deleteEntryFromJSONObject(sourceJSON).remove('id', jsonEntry.id);
		writeJsonFile(stringifyPrettyCompact(result1.data, stringify, jsonEntry.type), fileName);
	}
}






//This will update the json entry data in jsonObjectContainer. It will be updated with the information in the edit form.
function updateEntryJsonData(){
	let htmlElement = document.getElementById("jsonObjectContainer");
	if(htmlElement.textContent == ""){
		return false;
	}
	let jsonObj = JSON.parse(htmlElement.textContent);
	let jsonEntry = jsonObj.jsonObject;
	let htmlNodes = document.getElementsByClassName("basicFormEntry");
	let htmlNode, htmlNodeValue, htmlNodeId;
	//Loop textnodes, these are typically plain text entry fields
	for (x in htmlNodes) {
		htmlNode = htmlNodes[x];
		htmlNodeId = htmlNode.id;
		if(jsonEntry[htmlNodeId]){	//If the id of the text input element corresponds to a key in the json object
			htmlNodeValue = htmlNode.value;
			if(Number.isInteger(jsonEntry[htmlNodeId])){
				jsonEntry[htmlNodeId] = parseInt(htmlNodeValue); //Update the value
			} else {
				jsonEntry[htmlNodeId] = htmlNodeValue; //Update the value
			}
		} else {
			let parentTable = getNearestTableAncestor(htmlNode);
			if(parentTable){
				let parentTableId = parentTable.id;
				let parentEntry = jsonEntry[parentTableId];
				if(parentEntry){
					htmlNodeValue = htmlNode.value;
					if(Number.isInteger(parentEntry[htmlNodeId])){
						parentEntry[htmlNodeId] = parseInt(htmlNodeValue); //Update the value
					} else {
						parentEntry[htmlNodeId] = htmlNodeValue; //Update the value
					}
				}
			}
		}
	}
	
	let selectNodes = document.getElementsByTagName("SELECT");
	let selectValues, childNodes, childNode;
	//Loop selectNodes, these are typically plain lists
	for (x in selectNodes) {
		htmlNode = selectNodes[x];
		htmlNodeId = htmlNode.id;
		if(htmlNodeId && htmlNode.multiple){	//If the node as an id and the user can select multiple options.
			selectValues = [];
			if(jsonEntry[htmlNodeId]){	//If the id of the text input element corresponds to a key in the json object
				childNodes = htmlNode.childNodes
				for (y = 0; y < childNodes.length; y++){ //Loop over the select list options
					childNode = childNodes[y];
					if(childNode){
						selectValues.push(childNode.value);
					}
				}
				jsonEntry[htmlNodeId] = selectValues; //Update the value
			}
		}
	}
	
	let objListNodes = document.getElementsByClassName("objectListContainer");
	let objList, objRowInput, obj, tableList, table;
	//Loop objListNodes, these are typically lists of objects in the form of tables and rows
	for (let r = 0, len = objListNodes.length; r < len; r++) {
		objList = [];
		htmlNode = objListNodes[r]; //This objectListContainer contains a list of tables representing the object lists
		htmlNodeId = htmlNode.id; //This is the property name of the main JSON we will edit
		tableList = htmlNode.childNodes; //get the list of tables form this objectListContainer
		for (let y = 0, tableslen = tableList.length; y < tableslen; y++) {
			table = tableList[y];
			if(table.tagName == "TABLE"){	
				objRowInput = table.getElementsByTagName("INPUT"); //The table contains rows and cells, and in those sells are the input elements we want.
				obj = {};
				for (let z = 0, rowslen = objRowInput.length; z < rowslen; z++) {
					obj[objRowInput[z].id] = objRowInput[z].value; //Get the keyname and value into the empty object
				}
				objList.push(obj); //Add the object to the object list
			}
		}
		if(jsonEntry[htmlNodeId]){	//If the id of the text input element corresponds to a key in the json object
			jsonEntry[htmlNodeId] = objList; //Update the value
		}
	}
	
	jsonObj.jsonObject = jsonEntry;
	document.getElementById("jsonObjectContainer").innerHTML = JSON.stringify(jsonObj);
}



async function getFilterFromFiltersFile(filterName){
	let filePath = getFiltersFilePath();
	let jsonFilterList = await getJsonFromFile(filePath);
	return getItemFromListOfJsonItems(jsonFilterList, [["filterName", filterName, true, true]]).jsonObject.filter;						
}



//Takes a basic JSON object and transforms each key and value pair into a HTML table.
function buildHtmlTableFromJSON_andFile(jsonObject) {
	let htmlString = "<table>"
	// jsonObject[0] is the json object itself.
	// jsonObject[1] is the file name it came from.
	htmlString += buildHtmlRowsFromJSON(jsonObject.jsonObject);
	htmlString += "<tr><td>file:</td><td>"+jsonObject.fileName+"</td></tr>"
	htmlString += "</table>"
	return htmlString;
}

//Builds a simple HTML table based on json input.
function buildHtmlRowsFromJSON(jsonObject) {
	let htmlString = ""
	Object.keys(jsonObject).forEach(function(key) {
		htmlString += "<tr class='basictr"+key+"' id='"+key+"'>"
		htmlString += "<td class='basictd"+key+"' id='"+key+"'>"+key+":</td>"
		htmlString += "<td class='basictd"+key+"' id='"+key+"'>"+jsonObject[key]+"</td>"
		htmlString += "</tr>"
	})
	return htmlString;
}

//Generates a nested HTML table based on the input json.
function buildRecursiveHtmlRowsFromJSON(jsonObject, data) {
	let htmlString = "";
	Object.keys(jsonObject).forEach(function(key) {
		htmlString += "<tr title='"+data+"' class='tr"+key+"' id='"+key+"'>"
		htmlString += "<td title='"+data+"' class='td"+key+"' id='"+key+"'>"+key+"</td>"
		const mobject = jsonObject[key];
		if(typeof mobject === 'object' && mobject !== null){
			// It's an object.
			htmlString += "<td title='"+data+"' class='td"+key+"' id='"+key+"'>";
			htmlString += "<table class='table"+key+"' id='"+key+"'>";
			htmlString += buildRecursiveHtmlRowsFromJSON(mobject, data);
			htmlString += "</table></td>";
		} else {
			htmlString += "<td title='"+data+"' class='td"+key+"' id='"+key+"'>"+mobject+"</td>"
		}
		htmlString += "</tr>"
	})
	return htmlString;
}




//from https://stackoverflow.com/questions/10020422/deleting-row-from-json-array-leaves-null
//similar to jQuery, wrap them in an object
function deleteEntryFromJSONObjectByIndex(param) {
    var obj = {};

    //set data
    obj.data = param;

    //augment the object with a remove function
    obj.remove = function(i) {
		//splice changes the array length so we don't increment
		this.data.splice(i, 1);
		
        //be sure to return the object so that the chain continues
        return this;
    }
    //return object for operation
    return obj;
}

//from https://stackoverflow.com/questions/10020422/deleting-row-from-json-array-leaves-null
//similar to jQuery, wrap them in an object
function deleteEntryFromJSONObject(param) {
    var obj = {};

    //set data
    obj.data = param;

    //augment the object with a remove function
    obj.remove = function(key, val) {
        var i = 0;
        //loop through data
        while (this.data[i]) {
            if (this.data[i][key] === val) {
                //if we have that data, splice it
                //splice changes the array length so we don't increment
                this.data.splice(i, 1);
            } else {
                //else move on to the next item
                i++;
            }
        }
        //be sure to return the object so that the chain continues
        return this;
    }

    //return object for operation
    return obj
}

//Returns the first item found in the filter
function getItemFromListOfJsonItems(jsonObj, filter) {
	let items;
	items = getItemsFromListOfJsonItems(jsonObj, filter);
	if(items){
		if(items.length > 0){
			return items[0];
		} else {
			console.log("[getItemFromListOfJsonItems]: Items was returned as an empty list!")
		}
	} else {
		console.log("[getItemFromListOfJsonItems]: tried to get items from getItemsFromListOfJsonItems, but not items were returned")
	}
	return false;
}




		
//Get all json entries from a given folder.
//See the description of getItemsFromListOfJsonItems for the filter properties
async function getFilteredJsonItemsFromFolder(folderName, filter){
	//Get all files from a folder
	let allfiles = await getAllFiles(folderName, []);
	
	let i = 0;
	let amountOfFiles = allfiles.length;
	let objFileContent; //JSON object representing the contents of the file
	let filteredJSONItems = []; 
	let retreivedItems = [];
	let y;
	for (; i < amountOfFiles; i++) {
		y = 0;
		objFileContent = await getJsonFromFile(allfiles[i])
		if(objFileContent){
			retreivedItems = await getItemsFromListOfJsonItems(objFileContent, filter, allfiles[i]);
			if(retreivedItems.length > 0){
				filteredJSONItems.push.apply(filteredJSONItems, retreivedItems);
			}
		}
	}
	return filteredJSONItems;
}
		
//Get all json entries from a given folder.
//See the description of getItemsFromListOfJsonItems for the filter properties
async function getFilteredJsonItemsFromFolderList(folderList, filter){
	//Get all files from a folderlist
  let allfiles = await getJSONFilesFromFolderList(folderList);
	
	let objFileContent; //JSON object representing the contents of the file
	let filteredJSONItems = []; 
	let retreivedItems = [];
	for (let i = 0, amountOfFiles = allfiles.length; i < amountOfFiles; i++) {
		objFileContent = await getJsonFromFile(allfiles[i])
		if(objFileContent){
			retreivedItems = await getItemsFromListOfJsonItems(objFileContent, filter, allfiles[i]);
			if(retreivedItems.length > 0){
				filteredJSONItems.push.apply(filteredJSONItems, retreivedItems);
			}
		}
	}
	return filteredJSONItems;
}
		
//Get all json entries from a given folder list.
async function addItemsToCollectionFromFolderList(folderList, collection){
	//Get all files from a folderlist
  let allfiles = await getJSONFilesFromFolderList(folderList);
	
	let objFileContent; //JSON object representing the contents of the file
	let retreivedItems = [];
	for (let i = 0, amountOfFiles = allfiles.length; i < amountOfFiles; i++) {
		objFileContent = await getJsonFromFile(allfiles[i])
		if(objFileContent){
      if(Array.isArray(objFileContent)){
        for (let y = 0, amountOfItems = objFileContent.length; y < amountOfItems; y++) {
          collection.insert({jsonObject: objFileContent[y], indexInParentObject: y, fileName: allfiles[i]});
        }
      } else {
        collection.insert({jsonObject: objFileContent, indexInParentObject: 0, fileName: allfiles[i]});
      }
		}
	}
}



/*
Get all the items from the given json object
Filter is a list of key and value pair, i.e. [["type", "npc", true, true],["faction","marloss", true, false]]
The first boolean says the key should be present
The second boolean says the key should match with the given value
This will let you do:
	- All items of type = npc
	- All items of type = NPC and faction = marloss
	- All items where faction = marloss or class = marloss
	- All items that have key chat or key ID
*/
function getItemsFromListOfJsonItems(jsonObject, filter, fileName = ""){
	if(!jsonObject){
		console.log("[getItemsFromListOfJsonItems]: I was called, but no jsonObject was provided!")
		return false;
	}
	let i = 0;
	let y = 0;
	let amountOfItems = jsonObject.length;
	let amountOfFilters = filter.length;
	let listOfJSONObjects = [];
	let strFilterKey;
	let strFilterValue;
	let blnKeyShouldBePresent;
	let blnKeyShouldMatch;
	let intFilterMatches;
	
	for (; i < amountOfItems; i++) {
		if(jsonObject[i]){
			intFilterMatches = 0;
			y = 0;
			for (; y < amountOfFilters; y++) {
				strFilterKey = filter[y][0];
				strFilterValue = filter[y][1];
				blnKeyShouldBePresent = filter[y][2];
				blnKeyShouldMatch = filter[y][3];
				objKey = jsonObject[i][strFilterKey];
				if(objKey){ //The key is present.
					//Check if the filter value matches the value of the key
					if(findMatchInKey(jsonObject[i][strFilterKey], strFilterValue)){
						intFilterMatches += 1;
					} else {
						//The key does not match. Check if the key should have matched.
						if(blnKeyShouldMatch){
							//The key should have matched, so this item cannot be added to the list.
							intFilterMatches = 0;
							break;
						} else {
							//The key did not match but it did not need to. its presence is enough to match.
							intFilterMatches += 1;
						}
					}
				} else {
					//The key is not present. Check if the key should have been present.
					if(blnKeyShouldBePresent){
						//The key should have been present, so this item cannot be added to the list.
						intFilterMatches = 0;
						break;
					}
				}
			}
			//The amount of matches should be greater then 0.
			if(intFilterMatches >= amountOfFilters){
				listOfJSONObjects.push({jsonObject: jsonObject[i], indexInParentObject: i, fileName: fileName});
			}
		}
	}
	return listOfJSONObjects;
}

//If the value is something else then a string, find a match some other way
function findMatchInKey(keyvalue, value){
	if(typeof keyvalue == "string") {
		if(keyvalue == value){
			return true;
		}
	} else if(Array.isArray(keyvalue)) {
		let i = 0;
		for (; i < keyvalue.length; i++) {
			if(keyvalue[i] == value){
				return true;
			}
		}
	}
	return false;
}
