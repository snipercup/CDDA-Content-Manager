var stringify = require("@aitodotai\\json-stringify-pretty-compact");



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


//When the user presses the button to delete a property from the editform json entry data
function editFormDeleteProperty_click(buttonElement){
	updateEntryJsonData();
	let buttonParent = buttonElement.parentElement;
	let keyName = buttonParent.id;
	let parentTable = getNearestTableAncestor(buttonParent);
	if(parentTable.className == "formtable"){ //It's a top level property
		deletePropertyFromEditFormJSON(keyName);
	} else { //It's a property in one of the sub objects.
		//Get html elements
		let jsonObjectContainer = document.getElementById("jsonObjectContainer");
		let propertyName = parentTable.id; //The name of the property in the object in the object list
		
		//Get json objects
		let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
		let jsonEntry = jsonObj.jsonObject; //jsonObj[0] is the json object, jsonObj[1] is the filename.
		let jsonEntryKey = jsonEntry[propertyName]; //This contains the list of objects.
		
		//Delete the entry from the json and write it back to the jsonobjectcontainer.
		delete jsonEntryKey[keyName]; //Delete the property
		jsonEntry[propertyName] = jsonEntryKey; //Put the object list back into the main json
		jsonObj[0] = jsonEntry; //Put the main json back into the first slot of the json object
		jsonObjectContainer.innerHTML = JSON.stringify(jsonObj); //Write it back to html
		buildHtmlEditFormFromJSON_andFile(jsonObj); //refresh the editform
	}
}


//Builds an editform from a json object and optionally some data.
async function buildRecursiveHtmlEditFormFromJSON(jsonObject, data, jsonFormObj, depth = 0) {
	let htmlString = "";
	let formObj, formObjJSON;
	let keys = Object.keys(jsonObject), key;
	// Object.keys(jsonObject).forEach(function(key) {
	for (let y = 0, keyslength = keys.length; y < keyslength; y++) {
		key = keys[y];
		const mobject = jsonObject[key];
		if(depth < 1){
			formObj = getItemFromListOfJsonItems(jsonFormObj, [["type", "key", true, true], ["keyname", key, true, true]]);
			if(!formObj){
				console.log("[jsonfunctions.js]:[buildRecursiveHtmlEditFormFromJSON]: getItemFromListOfJsonItems returned false using key: "+key+"!");
				return "<tr><td>Poperty with key \""+key+"\" is not defined in the editform.</td></tr>";
			}
			formObjJSON = formObj.jsonObject;
		}
		htmlString += "<tr title='"+data+"' class='tr"+key+"' id='"+key+"'>"
		htmlString += "<td class='keytd"+key+"' id='"+key+"'><button title='Delete' onclick='editFormDeleteProperty_click(this)'>X</button></td>"
		htmlString += "<td title='";
		if(formObjJSON){htmlString += formObjJSON.description};
		htmlString += "' class='keytd"+key+"' id='"+key+"'>"+key+"</td>"
		if(typeof mobject === 'object' && mobject !== null){
			// It's an object.
			if(Array.isArray(mobject)){
				htmlString += "<td title='"+formObjJSON.description+"' class='keytd"+key+"' id='"+key+"'>";
				if(typeof mobject[0] === 'object' && mobject !== null){ //It's a list of objects
					htmlString += "<div class='objectListContainer' id='"+key+"'>";
					let obj;
					//Loop over the objects in the object list
					for (obj of mobject) {
						htmlString += "<table class='table"+key+"' id='"+key+"'>";
						let validObjectsNotAdded = "";
						let rowString = "", firstRowString = "";
						let rowCounter = 1;
						//Loop over the valid values
						for (validObj of formObjJSON.valid_values) {
							//Check that the valid keyname is defined in the object
							if(obj[validObj.keyname] != null){ //The valid value is defined in the object so we display it with its current value.
								if(rowCounter == 1){ //The first row will contain the delete button, to be added later
									firstRowString += "<td colspan='2'>" + validObj.keyname + "</td>";
									firstRowString += "<td><input type='text' id='"+validObj.keyname+"' size='60' value='"+obj[validObj.keyname]+"'></td>";
								} else {
									rowString += "<tr>";
									rowString += "<td id='"+key+"'><button id='"+validObj.keyname+"' onclick='editFormDeletePropertyFromObjInObjList_click(this)'>X</button></td>";
									rowString += "<td>" + validObj.keyname + "</td>";
									rowString += "<td><input type='text' size='60' id='"+validObj.keyname+"' value='"+obj[validObj.keyname]+"'></td>";
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
					htmlString += "</div>";
				} else { //It's a list of items
					htmlString += "<table class='table"+key+"' id='"+key+"'><tr>";
					htmlString += "<td><select multiple  class='keytd"+key+"' id='"+key+"' style='width: 150px' size='5'>";
					let selectString = "<td><select multiple style='width: 150px' size='5'>";
					//Check if the form json entry contains a list of valid values
					if(formObjJSON.valid_values){
						let validValues = formObjJSON.valid_values
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
				htmlString += "<td title='"+formObjJSON.description+"' class='keytd"+key+"' id='"+key+"'>";
				htmlString += "<table class='table"+key+"' id='"+key+"'>";
				htmlString += await buildRecursiveHtmlEditFormFromJSON(mobject, data, jsonFormObj, depth+1);
				if(formObjJSON){
					let validValues = formObjJSON.valid_values;
					if(validValues){
						let lookup_filter = validValues.lookup_filter
						if(lookup_filter){
							const basePath = getWorkingDirectory();
							let filePath = basePath + "\\data\\json\\editform\\filters.json";
							let jsonFilterList = await getJsonFromFile(filePath);
							let filter = getItemFromListOfJsonItems(jsonFilterList, [["filterName", lookup_filter, true, true]]).jsonObject.filter;
							let filteredItems = await getFilteredJsonItemsFromFolder(DATA_MODS, filter);
							let filteredItem;
							htmlString += "<tr><td colspan='3'><select style='width: 150px'>"
							for (let n = 0, filteredItemslength = filteredItems.length; n < filteredItemslength; n++) {
								filteredItem = filteredItems[n].jsonObject;
								htmlString += "<option value='"+filteredItem.id+"'>"+filteredItem.id+"</option>";
							}
							htmlString += "</select>";
							htmlString += "<button id='"+key+"' style='margin-right:20px' onclick='editFormAddPropertyInObjList_click(this)'>Add</button></td></tr>";
						}
					}
				}
				htmlString += "</table></td>";
			}
		} else {
			htmlString += "<td title='";
			if(formObjJSON){htmlString += formObjJSON.description};
			htmlString += "' class='keytd"+key+"' id='"+key+"'>";
			if(Number.isInteger(mobject)){
				htmlString += "<input type='number' class='basicFormEntry' id='"+key+"' size='90' value='"+mobject+"'>";
			} else {
				htmlString += "<input type='text' class='basicFormEntry' id='"+key+"' size='90' value='"+mobject+"'>";
			}
			htmlString += "</td>";
		}
		htmlString += "</tr>";
	}
	// })
	return htmlString;
}


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
	let jsonFormObj = await getEditFormDataFromFile(formJSONFile); //formJSONFile is a global
	let htmlString = "<table class='formtable'>"
	
	//Create row of buttons
	htmlString += "<tr class='buttonsrow'><td colspan='3'>";
	htmlString += "<span id='jsonObjectContainer' style='display:none'></span>";	
	htmlString += "<button style='margin-right:20px' onclick='editFormSave_click()'>Save</button>";
	htmlString += "<button style='margin-right:20px' onclick='editFormDuplicate_click()'>Duplicate</button>";
	htmlString += "<button style='margin-right:20px' onclick='editFormDelete_click()'>Delete</button>";
	htmlString += "<span style='margin-right:2px'>Add property: </span>";
	htmlString += "<select id='hiddenPropertiesSelect' style='margin-right:2px' ></select>";
	htmlString += "<button style='margin-right:20px' onclick='editFormAddProperty_click()'>Add</button>";
	htmlString += "</td></tr>";
	
	// jsonObject[0] is the json object itself.
	// jsonObject[1] is the file name it came from.
	htmlString += await buildRecursiveHtmlEditFormFromJSON(jsonObject.jsonObject, null, jsonFormObj);
	htmlString += "<tr><td>file:</td><td colspan='2'>"+jsonObject.fileName+"</td></tr>"
	htmlString += "</table>";
	document.getElementById("editForm").innerHTML = htmlString;
	document.getElementById("jsonObjectContainer").innerHTML = JSON.stringify(jsonObject);
	updateHiddenFieldsSelect(jsonObject, jsonFormObj);
}


async function editFormDeleteObjFromObjList_click(buttonElement){
	updateEntryJsonData();
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
	let jsonEntry = jsonObj.jsonObject; //jsonObj[0] is the json object, jsonObj[1] is the filename.
	let jsonEntryKey = jsonEntry[keyName]; //jsonObj[0] is the json object, jsonObj[1] is the filename.
	
	//Delete the entry from the json and write it back to the jsonobjectcontainer.
	jsonEntryKey = deleteEntryFromJSONObjectByIndex(jsonEntryKey).remove(i);
	let jsonEntryKeyData = jsonEntryKey.data;
	if(jsonEntryKeyData.length > 0){
		jsonEntry[keyName] = jsonEntryKeyData;
		jsonObj.jsonObject = jsonEntry;
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
			jsonObj.jsonObject = jsonEntry;
			jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
			buildHtmlEditFormFromJSON_andFile(jsonObj);
		}
	}
}

//Adds a new object to a object list.
async function editFormAddObjToObjList_click(buttonElement){
	updateEntryJsonData();
	//Get html elements
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let keyValue = buttonElement.id; 
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj.jsonObject; //The json for this entry (provides content for the whole edit form).
	
	jsonEntry = await editFormAddObjToObjList(jsonEntry, keyValue);
	jsonObj.jsonObject = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}

//Adds a new object to a object list. The new object uses the default value from the editform definition.
async function editFormAddObjToObjList(jsonEntry, keyValue){
	updateEntryJsonData();
	//Get json objects
	let jsonEntryKey = jsonEntry[keyValue]; //The property (that contains the object list)
	let formJSONData = await getEditFormDataFromFile(formJSONFile);
	let formJSONEntry = getItemFromListOfJsonItems(formJSONData, [["keyname", keyValue, true, true]])
	if(!formJSONEntry){return;}
	let formJSONEntryJSONObject = formJSONEntry.jsonObject
	let defaultValue = formJSONEntryJSONObject.default_value; //The default value for an object list
	let defaultValuEntry = defaultValue[0]; //The default value of the object list should contain at least 1 object.
	
	//Add the entry to the json and return it.
	jsonEntryKey.push(defaultValuEntry);
	jsonEntry[keyValue] = jsonEntryKey;
	return jsonEntry;
}

//Deletes a property by keyname from the main editform json entry
function deletePropertyFromEditFormJSON(keyName){
	updateEntryJsonData();
	//Get html elements
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj.jsonObject;
	
	//Delete the entry from the json and write it back to the jsonobjectcontainer.
	delete jsonEntry[keyName];
	jsonObj.jsonObject = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}

//Takes an object in a object list and deletes a property from that object.
function editFormDeletePropertyFromObjInObjList_click(buttonElement){
	updateEntryJsonData();
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
	let jsonEntry = jsonObj.jsonObject; //jsonObj[0] is the json object, jsonObj[1] is the filename.
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
	updateEntryJsonData();
	//Get html elements
	let hiddenFieldsSelect = buttonElement.previousSibling;
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let keyValue = buttonElement.id; 
	let buttonParentTable = buttonElement.parentElement.parentElement.parentElement.parentElement;
	let opt = hiddenFieldsSelect.options[hiddenFieldsSelect.selectedIndex];
	let optValue = opt.value; 
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj.jsonObject;
	let jsonEntryKey = jsonEntry[keyValue];
	let formJSONData = await getEditFormDataFromFile(formJSONFile);
	let formJSONEntry = getItemFromListOfJsonItems(formJSONData, [["keyname", keyValue, true, true]])
	if(!formJSONEntry){return;}
	let formJSONEntryJSONObject = formJSONEntry.jsonObject;
	let validValues = formJSONEntryJSONObject.valid_values;
	if(!validValues.lookup_filter){
		let validValusEntry = getItemFromListOfJsonItems(validValues, [["keyname", optValue, true, true]])
		//Calculate the child number
		let i = 0;
		while( (buttonParentTable = buttonParentTable.previousSibling) != null ) {
			i++;
		}
		//Set the values we need
		let defaultValue = validValusEntry.jsonObject.default_value;
		if(defaultValue == null){defaultValue = ""}
		//Add the entry to the json and write it back to the jsonobjectcontainer.
		jsonEntryKey[i][optValue] = defaultValue;
	} else {
		//Set the values we need
		let defaultValue = formJSONEntryJSONObject.default_value;
		if(defaultValue == null){defaultValue = ""}
		//Add the entry to the json and write it back to the jsonobjectcontainer.
		
		let keys = Object.keys(defaultValue);
		jsonEntryKey[optValue] = defaultValue[keys[0]];
	}
	
	
	jsonEntry[keyValue] = jsonEntryKey;
	jsonObj.jsonObject = jsonEntry;
	jsonObjectContainer.innerHTML = JSON.stringify(jsonObj);
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}


//Adds a missing property to the json.
async function editFormAddProperty_click(){
	updateEntryJsonData();
	//Get html elements
	let hiddenFieldsSelect = document.getElementById("hiddenPropertiesSelect");
	let jsonObjectContainer = document.getElementById("jsonObjectContainer");
	let opt = hiddenFieldsSelect.options[hiddenFieldsSelect.selectedIndex];
	let optValue = opt.value; 
	
	//Get json objects
	let jsonObj = JSON.parse(jsonObjectContainer.innerHTML);
	let jsonEntry = jsonObj.jsonObject;
	let formJSONData = await getEditFormDataFromFile(formJSONFile);
	let formJSONEntry = getItemFromListOfJsonItems(formJSONData, [["keyname", optValue, true, true]])
	if(!formJSONEntry){return;}
	let formJSONEntryJSONObject = formJSONEntry.jsonObject;
	
	//Set the values we need
	let defaultValue = formJSONEntryJSONObject.default_value;
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
	let jsonObjectEntry = jsonObject.jsonObject;
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
	updateJsonEntryInFileByIndex(jsonObj.jsonObject, jsonObj.fileName, jsonObj.indexInParentObject); //jsonObj[0] is the json data, jsonObj[1] is the filename
	entryList.updateList();
}

//This will read the json file of the currently selected entry and then append a new item
//that is a copy of the currently selected entry and then save the json back to disk.
function editFormDuplicate_click(){
	updateEntryJsonData()
	let jsonObj = JSON.parse(document.getElementById("jsonObjectContainer").textContent);
	jsonObj.jsonObject.id = jsonObj.jsonObject.id + "_copy"
	appendJsonEntryInFile(jsonObj.jsonObject, jsonObj.fileName); //jsonObj[0] is the json data, jsonObj[1] is the filename
	entryList.updateList();
	entryList.selectedEntryId = jsonObj.jsonObject.id;
	buildHtmlEditFormFromJSON_andFile(jsonObj);
}

//Deletes the selected item from the json file it is in.
function editFormDelete_click(){
	var result = confirm("Are you sure you want to delete this entry?");
	if (result) {
		updateEntryJsonData()
		let jsonObj = JSON.parse(document.getElementById("jsonObjectContainer").textContent);
		deleteJsonEntryInFileByIndex(jsonObj.jsonObject, jsonObj.fileName, jsonObj.indexInParentObject); //jsonObj[0] is the json data, jsonObj[1] is the filename
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
async function updateJsonEntryInFileByIndex(jsonEntry, fileName, index){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		sourceJSON[index] = jsonEntry;
		writeJsonFile(stringifyPrettyCompact(sourceJSON, stringify), fileName);
	}
}

		
//Loads a json file, updates one entry and writes it to disk.
async function deleteJsonEntryInFileByIndex(jsonEntry, fileName, index){
	let sourceJSON = await getJsonFromFile(fileName);
	if(sourceJSON){
		var result1 = deleteEntryFromJSONObjectByIndex(sourceJSON).remove(index);
		writeJsonFile(stringifyPrettyCompact(result1.data, stringify), fileName);
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
