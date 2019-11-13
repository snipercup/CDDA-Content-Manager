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
		htmlString += "<tr>"
		htmlString += "<td>"+key+":</td>"
		htmlString += "<td>"+jsonObject[key]+"</td>"
		htmlString += "</tr>"
	})
	return htmlString;
}

function buildRecursiveHtmlRowsFromJSON(jsonObject) {
	let htmlString = ""
	Object.keys(jsonObject).forEach(function(key) {
		htmlString += "<tr class='"+key+"'>"
		htmlString += "<td>"+key+":</td>"
		const mobject = jsonObject[key];
		if(typeof mobject === 'object' && mobject !== null){
			// It's an object.
			htmlString += "<td class='"+key+"'>";
			htmlString += "<table class='"+key+"'>";
			htmlString += buildRecursiveHtmlRowsFromJSON(mobject);
			htmlString += "</table></td>";
		} else {
			htmlString += "<td class='"+key+"'>"+mobject+"</td>"
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
	let y = 0;
	for (; i < amountOfFiles; i++) {
		y = 0;
		objFileContent = await getJsonFromFile(allfiles[i])
		retreivedItems = await getItemsFromListOfJsonItems(objFileContent, filter);
		//All retreived items get added to our list and get their filenames added.
		for (; y < retreivedItems.length; y++) {
			filteredJSONItems.push([retreivedItems[y], allfiles[i]]);
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
async function getItemsFromListOfJsonItems(jsonObject, filter){
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