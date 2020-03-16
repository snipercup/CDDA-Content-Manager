//This class takes a select html element and fills it with items based on the properties you provide it with.
class jsonObjList {
	selectionBox; //An element in the DOM that will get updated with its content
	folderList; //Look in this folder list for items to add to the list
	displayKey; //The key to display in the list. for example ID.
	filter; //A list reprisenting a filter. See getItemsFromListOfJsonItems in jsonfunctions.js for a description.
	selectedEntryId; //The id of the selected entry.
	
	// class methods
	constructor(selectElement, folderList, strDisplayKey, lstFilter) {
		this.selectionBox = selectElement;
		this.folderList = folderList;
		this.displayKey = strDisplayKey;
		this.filter = lstFilter;
		this.updateList();
	}
  
  recreate(selectElement, folderList, strDisplayKey, lstFilter){
		this.selectionBox = selectElement;
		this.folderList = folderList;
		this.displayKey = strDisplayKey;
		this.filter = lstFilter;
		this.updateList();
  }
	
	//Update the list of items
	async updateList(){
    this.selectionBox.style.display = "block";
		//Gets all json items and their filename from the given filelist.
		var retreivedItems = await getFilteredJsonItemsFromFolderList(this.folderList, this.filter);
		let selectedIndex = this.selectionBox.selectedIndex;
		this.selectionBox.innerHTML = ""; //Empty the list.
		
		let amountOfJSONObjects = retreivedItems.length;
		let jsonElementID = "", jsonObject, jsonEntry, retrievedItem;
		var i = 0;
		for (; i < amountOfJSONObjects; i++) {
			retrievedItem = retreivedItems[i];
			jsonObject = retrievedItem.jsonObject
			jsonElementID = jsonObject[this.displayKey];
			let opt = document.createElement('option');
			opt.value = jsonElementID;
			opt.innerHTML = jsonElementID;
			opt.title = JSON.stringify(retreivedItems[i]);
			this.selectionBox.appendChild(opt);
		}
		sortSelect(this.selectionBox);
		this.updateSelected();
	}
	
	set selectedEntryId(entryId){
		this.selectedEntryId = entryId;
		updateSelected();
	}
	
	updateSelected(){
		this.selectItem(this.selectedEntryId);
	}
	
	selectItem(itemValue){
		var opts = this.selectionBox.options;
		for (var opt, j = 0; opt = opts[j]; j++) {
			if (opt.value == itemValue) {
				this.selectionBox.selectedIndex = j;
				break;
			}
		}
		this.selectionBox.dispatchEvent(new Event('change'));
	}
	
	selectRandom(){
		var opts = this.selectionBox.options;
		this.selectedEntryId = opts[getRndInteger(0, opts.length)].value;
	}
}


//This class takes a select html element and fills it with items based on the properties you provide it with.
class collectionList {
	selectionBox; //An element in the DOM that will get updated with its content
	folderList; //Look in this folder list for items to add to the list
	displayKey; //The key to display in the list. for example ID. May be a single string or an array
	filter; //A list reprisenting a filter. See getItemsFromListOfJsonItems in jsonfunctions.js for a description.
	selectedEntryId; //The id of the selected entry.
	
	// class methods
	constructor(selectElement, collection, strDisplayKey, lstFilter) {
		this.selectionBox = selectElement;
		this.collection = collection;
		this.displayKey = strDisplayKey;
		this.filter = lstFilter;
		this.updateList();
	}
  
  recreate(selectElement, collection, strDisplayKey, lstFilter){
		this.selectionBox = selectElement;
		this.collection = collection;
		this.displayKey = strDisplayKey;
		this.filter = lstFilter;
		this.updateList();
  }
	
	//Update the list of items
	async updateList(){
    this.selectionBox.style.display = "block";
		//Gets all json items and their filename from the given filelist.
		var retreivedItems = this.collection.find(this.filter)
		let selectedIndex = this.selectionBox.selectedIndex;
		this.selectionBox.innerHTML = ""; //Empty the list.
		
		let amountOfJSONObjects = retreivedItems.length;
		let jsonElementID = "", jsonObject, jsonEntry, retrievedItem;
		var i = 0;
		for (; i < amountOfJSONObjects; i++) {
			retrievedItem = retreivedItems[i];
			jsonObject = retrievedItem.jsonObject
			jsonElementID = this.getDisplayKeyValue(this.displayKey, jsonObject);
			let opt = document.createElement('option');
			opt.value = jsonElementID;
			opt.innerHTML = jsonElementID;
			opt.title = JSON.stringify(retreivedItems[i]);
			this.selectionBox.appendChild(opt);
		}
		sortSelect(this.selectionBox);
		this.updateSelected();
	}
	
	set selectedEntryId(entryId){
		this.selectedEntryId = entryId;
		updateSelected();
	}
	
	updateSelected(){
		this.selectItem(this.selectedEntryId);
	}
	
	selectItem(itemValue){
		var opts = this.selectionBox.options;
		for (var opt, j = 0; opt = opts[j]; j++) {
			if (opt.value == itemValue) {
				this.selectionBox.selectedIndex = j;
				break;
			}
		}
		this.selectionBox.dispatchEvent(new Event('change'));
	}
	
	getDisplayKeyValue(displayKey, jsonObj){
    if(typeof displayKey == "string"){
      return jsonObj[displayKey];
    } else if(Array.isArray(displayKey)) {
      let keyName;
      for (let i = 0, displayKeyLen = displayKey.length; i < displayKeyLen; i++) {
        keyName = displayKey[i];
        if (jsonObj[keyName]) {
          return jsonObj[keyName];
        }
      }
    }
    
    return "displaykey not present!"
	}
	
	selectRandom(){
		var opts = this.selectionBox.options;
		this.selectedEntryId = opts[getRndInteger(0, opts.length)].value;
	}
}