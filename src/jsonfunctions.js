var stringify = require("@aitodotai\\json-stringify-pretty-compact");

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
async function buildHtmlEditFormFromJSON_andFile(jsonObject) {
	let jsonFormObj;
	let htmlString = "<table class='formtable'>"
	htmlString += "<tr class='buttonsrow'><td colspan='3'>";
	htmlString += "<span id='jsonObjectContainer' style='display:none'></span>";	
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


async function editFormDeleteObjFromObjList_click(buttonElement){
	//Get html elements
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let buttonParentTable = buttonElement.parentElement.parentElement.parentElement.parentElement;
	let keyName = buttonParentTable.id;
	
	//Calculate the child number
	let i = 0;
	while( (buttonParentTable = buttonParentTable.previousSibling) != null ) {
		i++;
	}
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj[0]; //jsonObj[0] is the json object, jsonObj[1] is the filename.
	let jsonEntryKey = jsonEntry[keyName]; //jsonObj[0] is the json object, jsonObj[1] is the filename.
	
	//Delete the entry from the json and write it back to the jsonobjectcontainer.
	jsonEntryKey = deleteEntryFromJSONObjectByIndex(jsonEntryKey).remove(i);
	let jsonEntryKeyData = jsonEntryKey.data;
	if(jsonEntryKeyData.length > 0){
		jsonEntry[keyName] = jsonEntryKeyData;
		jsonObj[0] = jsonEntry;
		jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
		buildHtmlEditFormFromJSON_andFile(jsonObj);
	} else {
		var result = confirm("No more in this list. Do you want to delete the property as well?");
		if (result) {
			//The list is empty and the user wants to delete the empty property as well.
			deletePropertyFromEditFormJSON(keyName);
		} else {
			//The list is empty but the user wants to keep property. Create a new entry with default value.
			jsonEntry = await editFormAddObjToObjList(jsonEntry, keyName);
			jsonObj[0] = jsonEntry;
			jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
			buildHtmlEditFormFromJSON_andFile(jsonObj);
		}
	}
}

//Adds a new object to a object list.
async function editFormAddObjToObjList_click(buttonElement){
	//Get html elements
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let keyValue = buttonElement.id; 
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj[0]; //The json for this entry (provides content for the whole edit form).
	
	jsonEntry = await editFormAddObjToObjList(jsonEntry, keyValue);
	jsonObj[0] = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}

//Adds a new object to a object list. The new object uses the default value from the editform definition.
async function editFormAddObjToObjList(jsonEntry, keyValue){
	//Get json objects
	let jsonEntryKey = jsonEntry[keyValue]; //The property (that contains the object list)
	let formJSONData = await getEditFormDataFromFile(formJSONFile);
	let formJSONEntry = getItemFromListOfJsonItems(formJSONData, [["keyname", keyValue, true, true]])
	if(!formJSONEntry){return;}
	let defaultValue = formJSONEntry.default_value; //The default value for an object list
	let defaultValuEntry = defaultValue[0]; //The default value of the object list should contain at least 1 object.
	
	//Add the entry to the json and return it.
	jsonEntryKey.push(defaultValuEntry);
	jsonEntry[keyValue] = jsonEntryKey;
	return jsonEntry;
}

//Deletes a property by keyname from the main editform json entry
function deletePropertyFromEditFormJSON(keyName){
	//Get html elements
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj[0];
	
	//Delete the entry from the json and write it back to the jsonobjectcontainer.
	delete jsonEntry[keyName];
	jsonObj[0] = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}

//When the user presses the button to delete a property from the editform json entry data
function editFormDeleteProperty_click(buttonElement){
	let buttonParent = buttonElement.parentElement;
	let keyName = buttonParent.id;
	deletePropertyFromEditFormJSON(keyName);
}

//Takes an object in a object list and deletes a property from that object.
function editFormDeletePropertyFromObjInObjList_click(buttonElement){
	//Get html elements
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let buttonParent = buttonElement.parentElement;
	let buttonParentTable = buttonParent.parentElement.parentElement.parentElement;
	let keyName = buttonParent.id; //The key of the object list in the main json
	let propertyName = buttonElement.id; //The name of the property in the object in the object list
	
	//Calculate the child number
	let i = 0;
	while( (buttonParentTable = buttonParentTable.previousSibling) != null ) {
		i++;
	}
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj[0]; //jsonObj[0] is the json object, jsonObj[1] is the filename.
	let jsonEntryKey = jsonEntry[keyName]; //This contains the list of objects.
	let jsonEntryObj = jsonEntryKey[i]; //This is the object that contains the property we want to delete.
	
	//Delete the entry from the json and write it back to the jsonobjectcontainer.
	delete jsonEntryObj[propertyName]; //Delete the property
	jsonEntryKey[i] = jsonEntryObj; //Put the object back into the object list
	jsonEntry[keyName] = jsonEntryKey; //Put the object list back into the main json
	jsonObj[0] = jsonEntry; //Put the main json back into the first slot of the json object
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj); //Write it back to html
	buildHtmlEditFormFromJSON_andFile(jsonObj); //refresh the editform
}




//Adds a missing property to one of the objects in a object list.
async function editFormAddPropertyInObjList_click(buttonElement){
	//Get html elements
	let hiddenFieldsSelect = buttonElement.previousSibling;
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let keyValue = buttonElement.id; 
	let buttonParentTable = buttonElement.parentElement.parentElement.parentElement.parentElement;
	let opt = hiddenFieldsSelect.options[hiddenFieldsSelect.selectedIndex];
	let optValue = opt.value; 
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj[0];
	let jsonEntryKey = jsonEntry[keyValue];
	let formJSONData = await getEditFormDataFromFile(formJSONFile);
	let formJSONEntry = getItemFromListOfJsonItems(formJSONData, [["keyname", keyValue, true, true]])
	if(!formJSONEntry){return;}
	let validValues = formJSONEntry.valid_values;
	let validValusEntry = getItemFromListOfJsonItems(validValues, [["keyname", optValue, true, true]])
	
	//Calculate the child number
	let i = 0;
	while( (buttonParentTable = buttonParentTable.previousSibling) != null ) {
		i++;
	}
	
	//Set the values we need
	let defaultValue = validValusEntry.default_value;
	if(defaultValue == null){defaultValue = ""}
	
	//Add the entry to the json and write it back to the jsonobjectcontainer.
	jsonEntryKey[i][optValue] = defaultValue;
	jsonEntry[keyValue] = jsonEntryKey;
	jsonObj[0] = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}


//Adds a missing property to the json.
async function editFormAddProperty_click(){
	//Get html elements
	let hiddenFieldsSelect = document.getElementById("hiddenPropertiesSelect");
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
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
	buildHtmlEditFormFromJSON_andFile(jsonObj);
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
	entryList.updateList();
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
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}

//Deletes the selected item from the json file it is in.
function editFormDelete_click(){
	var result = confirm("Are you sure you want to delete this entry?");
	if (result) {
		updateEntryJsonData()
		let jsonObj = JSON.parse(document.getElementById("jsonObjectContainer").textContent);
		deleteJsonEntryInFileById(jsonObj[0], jsonObj[1]); //jsonObj[0] is the json data, jsonObj[1] is the filename
		entryList.updateList();
		entryList.selectRandom();
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
    return obj
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
async function getEditFormDataFromFile(formFileName) {
	const basePath = getWorkingDirectory();
	let filePath = basePath + "\\data\\json\\editform\\" + formFileName;
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
	// var y;
	Object.keys(jsonObject).forEach(function(key) {
	// for (y=0; y < jsonObject.length; y++) {
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
					let obj;
					//Loop over the objects in the object list
					for (obj of mobject) {
						htmlString += "<table class='table"+key+"' id='"+key+"'>";
						let validObjectsNotAdded = "";
						let rowString = "", firstRowString = "";
						let rowCounter = 1;
						//Loop over the valid values
						for (validObj of formObj.valid_values) {
							//Check that the valid keyname is defined in the object
							if(obj[validObj.keyname] != null){ //The valid value is defined in the object so we display it with its current value.
								if(rowCounter == 1){ //The first row will contain the delete button, to be added later
									firstRowString += "<td colspan='2'>" + validObj.keyname + "</td>";
									firstRowString += "<td><input type='text' size='60' value='"+obj[validObj.keyname]+"'></td>";
								} else {
									rowString += "<tr>";
									rowString += "<td id='"+key+"'><button id='"+validObj.keyname+"' onclick='editFormDeletePropertyFromObjInObjList_click(this)'>X</button></td>";
									rowString += "<td>" + validObj.keyname + "</td>";
									rowString += "<td><input type='text' size='60' value='"+obj[validObj.keyname]+"'></td>";
									rowString += "</tr>";
								}
								rowCounter++
							} else { //The valid value is not yet defined in the object but the user gets the option to add it.
								validObjectsNotAdded += "<option value='"+validObj.keyname+"'>"+validObj.keyname+"</option>";
							}
						}
						//Valid values that are not already in the object (so the user has not filled them yet,
						//Are added to a select item to be added later.
						rowString += "<tr class='objectValidValuesAvailable'>";
						if(validObjectsNotAdded.length > 0){
							rowString += "<td colspan='2'>Add property</td>";
							rowString += "<td><select class='keytd"+key+"' id='"+key+"' style='width: 150px'>";
							rowString += validObjectsNotAdded;
							rowString += "</select><button id='"+key+"' onclick='editFormAddPropertyInObjList_click(this)' style='margin-right:20px'>Add</button></td></tr>";
						}
						htmlString += "<tr><td rowspan='"+rowCounter+"'>";
						htmlString += "<button onclick='editFormDeleteObjFromObjList_click(this)' style='margin-right:20px'>X</button>";
						htmlString += "</td>"+firstRowString+"</tr>";
						htmlString += rowString;
						htmlString += "</table>";
					}
					htmlString += "<button title='Add another to this list.' id='"+key+"' onclick='editFormAddObjToObjList_click(this)' style='margin-right:20px'>Add</button>";
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
			} else { //It is a object but not an array
				htmlString += "<td title='"+formObj.description+"' class='keytd"+key+"' id='"+key+"'>";
				htmlString += "<table class='table"+key+"' id='"+key+"'>";
				htmlString += buildRecursiveHtmlEditFormFromJSON(mobject, data, jsonFormObj);
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
		htmlString += "</tr>";
	// }
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
