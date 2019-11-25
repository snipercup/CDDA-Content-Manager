var stringify = require("@aitodotai\\json-stringify-pretty-compact")

//from https://github.com/NadaCode/es6-import-test/blob/c6393c45ac5015261eaaa18e46a37f8a54f2202f/es6_test_lib.js
// https://github.com/lydell/json-stringify-pretty-compact
const stringifyPrettyCompact = (json, stringify) => {
	let options = { maxLength: 140, indent: 2, arrayMargins: true, objectMargins: true}
	return stringify(json, options)
}

//Takes a basic JSON object and transforms each key and value pair into a HTML table.
function buildHtmlTableFromJSON_andFile(jsonObject) {
	let htmlString = "<table>"
	// jsonObject[0] is the json object itself.
	// jsonObject[1] is the file name it came from.
	htmlString += buildHtmlRowsFromJSON(jsonObject[0]);
	htmlString += "<tr><td>file:</td><td>"+jsonObject[1]+"</td></tr>"
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

//Takes a basic JSON object and transforms each key and value pair into a HTML table.
async function buildHtmlEditFormFromJSON_andFile(jsonObject, formJSONFile) {
	let jsonFormObj;
	let htmlString = "<table>"
	htmlString += "<tr><td colspan='3'>";
	htmlString += "<span id='jsonObjectContainer' style='display:none'></span>";
	if(!formJSONFile){
		formJSONFile = document.getElementById("editFormFile").textContent;
	}
	htmlString += "<span id='editFormFile' style='display:none'>"+formJSONFile+"</span>";		
	jsonFormObj = await getEditFormDataFromFile(formJSONFile);
	htmlString += "<button style='margin-right:20px' onclick='editFormSave_click()'>Save</button>";
	htmlString += "<button style='margin-right:20px' onclick='editFormDuplicate_click()'>Duplicate</button>";
	htmlString += "<button style='margin-right:20px' onclick='editFormDelete_click()'>Delete</button>";
	htmlString += "<span style='margin-right:2px'>Add property: </span>";
	htmlString += "<select id='hiddenPropertiesSelect' style='margin-right:2px' ></select>";
	htmlString += "<button style='margin-right:20px' onclick='editFormAddProperty_click()'>Add</button>";
	htmlString += "</td></tr>";
	// jsonObject[0] is the json object itself.
	// jsonObject[1] is the file name it came from.
	htmlString += await buildRecursiveHtmlEditFormFromJSON(jsonObject[0], null, jsonFormObj);
	htmlString += "<tr><td>file:</td><td colspan='2'>"+jsonObject[1]+"</td></tr>"
	htmlString += "</table>";
	document.getElementById("editForm").innerHTML = htmlString;
	document.getElementById("jsonObjectContainer").innerHTML = JSON.stringify(jsonObject);
	updateHiddenFieldsSelect(jsonObject, jsonFormObj);
}

function editFormDeleteProperty_click(buttonElement){
	//Get html elements
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let buttonParent = buttonElement.parentElement;
	let keyName = buttonParent.id;
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj[0];
	
	//Add the entry to the json and write it back to the jsonobjectcontainer.
	delete jsonEntry[keyName];
	jsonObj[0] = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj, "");
}

//Adds a missing property to the json.
async function editFormAddProperty_click(){
	//Get html elements
	let hiddenFieldsSelect = document.getElementById("hiddenPropertiesSelect");
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let formJSONFile = document.getElementById("editFormFile").textContent;
	let opt = hiddenFieldsSelect.options[hiddenFieldsSelect.selectedIndex];
	let optValue = opt.value; 
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj[0];
	let formJSONData = await getEditFormDataFromFile(formJSONFile);
	let formJSONEntry = getItemFromListOfJsonItems(formJSONData, [["keyname", optValue, true, true]])
	if(!formJSONEntry){return;}
	
	//Set the values we need
	let defaultValue = formJSONEntry.default_value;
	if(defaultValue == null){defaultValue = ""}
	
	//Add the entry to the json and write it back to the jsonobjectcontainer.
	jsonEntry[optValue] = defaultValue;
	jsonObj[0] = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj, formJSONFile);
}

//Makes a list of fields that are not visible but are defined in the editform json.
function updateHiddenFieldsSelect(jsonObject, jsonFormObj){
	let hiddenFieldsSelect = document.getElementById("hiddenPropertiesSelect");
	let editFormEntry, editFormKeyName;
	let jsonObjectEntry = jsonObject[0];
	hiddenFieldsSelect.innerHTML = "";
	//Loop nodes
	for (x in jsonFormObj) {
		editFormEntry = jsonFormObj[x]
		editFormKeyName = editFormEntry.keyname;
		if(!editFormKeyName){continue;}
		if(jsonObjectEntry[editFormKeyName] == null){	//If the id of the editform json corresponds to a key in the json object
			//The key name is defined in the form, but the json entry does not have that property applied.
			//The key should not be visible. Instead, add it to the hiddenproperties.
			hiddenFieldsSelect.innerHTML += "<option value='"+editFormKeyName+"'>"+editFormKeyName+"</option>";
		}
	}
}

//the entry data is stored in a hidden element called jsonObjectContainer
//Clicking save will get all the values from the edit form and modify the stored json
//It will then write the json to a file.
function editFormSave_click(){
	updateEntryJsonData()
	let jsonObj = JSON.parse(document.getElementById("jsonObjectContainer").textContent);
	updateJsonEntryInFileById(jsonObj[0], jsonObj[1]); //jsonObj[0] is the json data, jsonObj[1] is the filename
}

//This will update the json entry data in jsonObjectContainer. It will be updated with the information in the edit form.
function updateEntryJsonData(){
	let htmlElement = document.getElementById("jsonObjectContainer");
	if(htmlElement.textContent == ""){
		return false;
	}
	let jsonObj = JSON.parse(htmlElement.textContent);
	let jsonEntry = jsonObj[0];
	let htmlNodes = document.getElementsByTagName("INPUT");
	let htmlNode, htmlNodeValue, htmlNodeId;
	//Loop textnodes
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
		}
	}
	
	let selectNodes = document.getElementsByTagName("SELECT");
	let selectValues, childNodes, childNode;
	//Loop selectNodes
	for (x in selectNodes) {
		htmlNode = selectNodes[x];
		htmlNodeId = htmlNode.id;
		if(htmlNodeId){	//If the node as an id.
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
	jsonObj[0] = jsonEntry;
	document.getElementById("jsonObjectContainer").innerHTML = JSON.stringify(jsonObj);
}

//This will read the json file of the currently selected entry and then append a new item
//that is a copy of the currently selected entry and then save the json back to disk.
function editFormDuplicate_click(){
	updateEntryJsonData()
	let jsonObj = JSON.parse(document.getElementById("jsonObjectContainer").textContent);
	jsonObj[0].id = jsonObj[0].id + "_copy"
	appendJsonEntryInFile(jsonObj[0], jsonObj[1]); //jsonObj[0] is the json data, jsonObj[1] is the filename
	entryList.updateList();
	entryList.selectedEntryId = jsonObj[0].id;
	buildHtmlEditFormFromJSON_andFile(jsonObj, "");
}

//Deletes the selected item from the json file it is in.
function editFormDelete_click(){
	var result = confirm("Are you sure you want to delete this entry?");
	if (result) {
		updateEntryJsonData()
		let jsonObj = JSON.parse(document.getElementById("jsonObjectContainer").textContent);
		deleteJsonEntryInFileById(jsonObj[0], jsonObj[1]); //jsonObj[0] is the json data, jsonObj[1] is the filename
		entryList.updateList();
		buildHtmlEditFormFromJSON_andFile(jsonObj, "");
	}
}



		
//Loads a json file, appends one entry and writes it to disk.
async function appendJsonEntryInFile(jsonEntry, fileName){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		sourceJSON.push(jsonEntry);
		writeJsonFile(stringifyPrettyCompact(sourceJSON, stringify), fileName);
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
		writeJsonFile(stringifyPrettyCompact(sourceJSON, stringify), fileName);
	}
}

		
//Loads a json file, updates one entry and writes it to disk.
async function deleteJsonEntryInFileById(jsonEntry, fileName){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		var result1 = deleteEntryFromJSONObject(sourceJSON).remove('id', jsonEntry.id);
		writeJsonFile(stringifyPrettyCompact(result1.data, stringify), fileName);
	}
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
		if(items[0]){
			return items[0];
		}
	}
	return false;
}


//Gets the data for the ediform from a file and returns a json object.
async function getEditFormDataFromFile(formJSONFile) {
	const basePath = getWorkingDirectory();
	let filePath = basePath + "\\data\\json\\editform\\" + formJSONFile;
	let jsonFormObj = await getJsonFromFile(filePath);
	let jsonSubFormObj, jsonEntry, jsonSubEntry;
	let i = 0, y = 0;
	let type;
	let amountOfItems = jsonFormObj.length;
	for (; i < amountOfItems; i++) {
		jsonEntry = jsonFormObj[i]
		type = jsonEntry.type;
		if(type == "include"){ //An entry can be a include entry. It will append the entries of that included file to this json object.
			jsonSubFormObj = await getEditFormDataFromFile(jsonEntry.filename);
			y = 0;
			for (; y < jsonSubFormObj.length; y++) {
				jsonSubEntry = jsonSubFormObj[y];
				jsonFormObj.push(jsonSubEntry);
			}
		}
	}
	return jsonFormObj;
}

//Builds an editform from a json object and optionally some data.
function buildRecursiveHtmlEditFormFromJSON(jsonObject, data, jsonFormObj) {
	let htmlString = "";
	let formObj;
	Object.keys(jsonObject).forEach(function(key) {
		const mobject = jsonObject[key];
		formObj = getItemFromListOfJsonItems(jsonFormObj, [["type", "key", true, true], ["keyname", key, true, true]]);
		htmlString += "<tr title='"+data+"' class='tr"+key+"' id='"+key+"'>"
		htmlString += "<td class='keytd"+key+"' id='"+key+"'><button onclick='editFormDeleteProperty_click(this)'>X</button></td>"
		htmlString += "<td title='"+formObj.description+"' class='keytd"+key+"' id='"+key+"'>"+key+"</td>"
		if(typeof mobject === 'object' && mobject !== null){
			// It's an object.
			if(Array.isArray(mobject)){
				htmlString += "<td title='"+formObj.description+"' class='keytd"+key+"' id='"+key+"'>";
				if(typeof mobject[0] === 'object' && mobject !== null){ //It's a list of objects
					htmlString += "<table class='table"+key+"' id='"+key+"'>";
					htmlString += buildRecursiveHtmlEditFormFromJSON(mobject, data);
					htmlString += "</table>";
				} else { //It's a list of items
					htmlString += "<table class='table"+key+"' id='"+key+"'><tr>";
					htmlString += "<td><select multiple  class='keytd"+key+"' id='"+key+"' style='width: 150px' size='5'>";
					let selectString = "<td><select multiple style='width: 150px' size='5'>";
					//Check if the form json entry contains a list of valid values
					if(formObj.valid_values){
						let validValues = formObj.valid_values
						let i;
						//Loop over the valid values
						for (i of validValues) {
							//If i does not have a name, it's a plain list. Otherwise, it's a list of objects with name and description
							if(i.name) {
								//Check if the list of the json entry contains the value from the list of valid values.
								//If this is true, the item will be added to the left select element. Otherwise it will be added to the right.
								if(mobject.indexOf(i.name) >= 0) {
									htmlString += "<option ondblclick='addedEntryListItem_doubleclick(this);' value='"+i.name+"'>"+i.name+"</option>";
								} else {
									selectString += "<option ondblclick='availableEntryListItem_doubleclick(this);' value='"+i.name+"'>"+i.name+"</option>";
								}
							} else {
								//Check if the list of the json entry contains the value from the list of valid values.
								//If this is true, the item will be added to the left select element. Otherwise it will be added to the right.
								if(mobject.indexOf(i) >= 0) {
									htmlString += "<option ondblclick='addedEntryListItem_doubleclick(this)'; value='"+i+"'>"+i+"</option>";
								} else {
									selectString += "<option ondblclick='availableEntryListItem_doubleclick(this);' value='"+i+"'>"+i+"</option>";
								}
							}
						}
					}
					selectString += "</select></td>";
					htmlString += "</select></td><td><br><< add<br>remove >></td>" + selectString;
					htmlString += "</tr></table>";
				}
				htmlString += "</td>";
			} else {
				htmlString += "<td title='"+formObj.description+"' class='keytd"+key+"' id='"+key+"'>";
				htmlString += "<table class='table"+key+"' id='"+key+"'>";
				htmlString += buildRecursiveHtmlEditFormFromJSON(mobject, data);
				htmlString += "</table></td>";
			}
		} else {
			htmlString += "<td title='"+formObj.description+"' class='valuetd"+key+"' id='"+key+"'>";
			if(Number.isInteger(mobject)){
				htmlString += "<input type='number' class='textedit"+key+"' id='"+key+"' size='90' value='"+mobject+"'>";
			} else {
				htmlString += "<input type='text' class='textedit"+key+"' id='"+key+"' size='90' value='"+mobject+"'>";
			}
			htmlString += "</td>";
		}
		htmlString += "</tr>"
	})
	return htmlString;
}

//When an user doubleclicks on an entry in one of the lists.
function addedEntryListItem_doubleclick(htmlElement){
	let addedEntryList = htmlElement.parentElement;
	let listTrElement = addedEntryList.parentElement.parentElement;
	let availableEntryList = listTrElement.childNodes[2].childNodes[0];
	moveEntryBetweenLists(htmlElement, addedEntryList, availableEntryList, function(){availableEntryListItem_doubleclick(this)});
}

//When an user doubleclicks on an entry in one of the lists.
function availableEntryListItem_doubleclick(htmlElement){
	let availableEntryList = htmlElement.parentElement;
	let listTrElement = availableEntryList.parentElement.parentElement;
	let addedEntryList = listTrElement.childNodes[0].childNodes[0];
	moveEntryBetweenLists(htmlElement, availableEntryList, addedEntryList, function(){addedEntryListItem_doubleclick(this)});
}

//When an user doubleclicks on an entry in one of the lists.
function moveEntryBetweenLists(entryItem, sourceList, targetList, ondblclickFunction){
	//Remove the item from the addedEntryList and add it to the availableEntryList
	let newOption = entryItem.cloneNode(true);
	newOption.ondblclick = ondblclickFunction;
	sourceList.removeChild(entryItem);
	targetList.appendChild(newOption);
}

		
//Get all json entries from a given folder.
//See the description of getItemsFromListOfJsonItems for the filter properties
async function getFilteredJsonItemsFromFolder(folderName, filter){
	//Get all files from a folder
	let cataclysmGameFolder = await getCataclysmGameFolder();
	let jsonFolder = cataclysmGameFolder + folderName
	let allfiles = await getAllFiles(jsonFolder, []);
	
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
			retreivedItems = await getItemsFromListOfJsonItems(objFileContent, filter);
			//All retreived items get added to our list and get their filenames added.
			for (; y < retreivedItems.length; y++) {
				filteredJSONItems.push([retreivedItems[y], allfiles[i]]);
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
function getItemsFromListOfJsonItems(jsonObject, filter){
	if(!jsonObject){
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
				if(objKey){
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
			if(intFilterMatches > 0){
				listOfJSONObjects.push(jsonObject[i]);
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
