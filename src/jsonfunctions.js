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



//from https://github.com/NadaCode/es6-import-test/blob/c6393c45ac5015261eaaa18e46a37f8a54f2202f/es6_test_lib.js
// https://github.com/lydell/json-stringify-pretty-compact
const stringifyPrettyCompact = (json, stringify, type) => {
  // console.log("type = " + type);
  let options;
  if(type == "morale_type"){
    options = { maxNesting: 0, indent: 2, arrayMargins: true, objectMargins: true};
  } else {
    options = { maxLength: 140, indent: 2, arrayMargins: true, objectMargins: true};
  }
	return stringify(json, options)
  
  // var options = {
    // maxLength: 80,
    // sameLineBraces: false,
    // sameLineBrackets: false
  // };
  // let jsonString = "[";
  // let entryString = "";
  // console.log("json.length = " + json.length);
  // for(let x = 0, jsonlen = json.length; x < jsonlen; x++){
    
    // if(x == 0){
      // jsonString += "\n"
    // }
    ////entryString = collapsible.stringify(json[x], options).replace(/^\s*[\r\n]/gm, "");
    // entryString = collapsible.stringify(json[x], options);
    // let ks = entryString.split("\n");
    // for(let y = 0, kslen = ks.length; y < kslen; y++){
      // jsonString += "  " +  ks[y];
      // if(y < kslen-1){
        // jsonString += "\n"; 
      // }
    // }
    // if(x < jsonlen-1){
      // jsonString += ",\n";
    // }
    // if(x == jsonlen-1){
      // jsonString += "\n";
    // }
  // }
  // jsonString += "]";
  // return jsonString;
}





		
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



// When an user doubleclicks on an entry in one of the lists.
// function addedEntryListItem_doubleclick(htmlElement){
	// let addedEntryList = htmlElement.parentElement;
	// let listTrElement = addedEntryList.parentElement.parentElement;
	// let availableEntryList = listTrElement.childNodes[2].childNodes[0];
	// moveEntryBetweenLists(htmlElement, addedEntryList, availableEntryList, function(){availableEntryListItem_doubleclick(this)});
// }

// When an user doubleclicks on an entry in one of the lists.
// function availableEntryListItem_doubleclick(htmlElement){
	// let availableEntryList = htmlElement.parentElement;
	// let listTrElement = availableEntryList.parentElement.parentElement;
	// let addedEntryList = listTrElement.childNodes[0].childNodes[0];
	// moveEntryBetweenLists(htmlElement, availableEntryList, addedEntryList, function(){addedEntryListItem_doubleclick(this)});
// }

		
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
