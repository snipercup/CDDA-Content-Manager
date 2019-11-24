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
	let jsonFormObj = await getEditFormDataFromFile(formJSONFile);
	let htmlString = "<table>"
	htmlString += "<tr><td colspan='2'><span id='jsonObjectContainer' style='display:none'></span><button onclick='editFormSave_click()'>Save</button></td></tr>"
	// jsonObject[0] is the json object itself.
	// jsonObject[1] is the file name it came from.
	htmlString += await buildRecursiveHtmlEditFormFromJSON(jsonObject[0], null, jsonFormObj);
	htmlString += "<tr><td>file:</td><td>"+jsonObject[1]+"</td></tr>"
	htmlString += "</table>"
	return htmlString;
}

function editFormSave_click(){
	jsonObj = JSON.parse(document.getElementById("jsonObjectContainer").textContent);
	writeJsonFile(jsonObj[0]);
}

//Returns the first item found in the filter
function getItemFromListOfJsonItems(jsonFormObj, filter) {
	let items;
	items = getItemsFromListOfJsonItems(jsonFormObj, filter);
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
		if(type == "include"){ //One entry can be a include entry. It will append the entries of that included file to this json object.
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
					htmlString += "<td><select multiple onchange='addedEntryList_change(this);' style='width: 150px' size='5'>";
					let selectString = "<td><select multiple onchange='availableEntryList_change(this);' style='width: 150px' size='5'>";
					if(formObj.valid_values){
						let validValues = formObj.valid_values
						let i;
						for (i of validValues) {
							if(i.name) {
								if(mobject.indexOf(i.name) >= 0) {
									htmlString += "<option value='"+i.name+"'>"+i.name+"</option>";
								} else {
									selectString += "<option value='"+i.name+"'>"+i.name+"</option>";
								}
							} else {
								if(mobject.indexOf(i) >= 0) {
									htmlString += "<option value='"+i+"'>"+i+"</option>";
								} else {
									selectString += "<option value='"+i+"'>"+i+"</option>";
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
			htmlString += "<input type='text' class='textedit"+key+"' id='"+key+"' size='90' value='"+mobject+"'>";
			htmlString += "</td>";
		}
		htmlString += "</tr>"
	})
	return htmlString;
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
