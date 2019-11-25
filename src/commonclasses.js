//This class takes a select html element and fills it with items based on the properties you provide it with.
class jsonObjList {
	selectionBox; //An element in the DOM that will get updated with its content
	jsonFolder; //Look in this folder for items to add to the list
	displayKey; //The key to display in the list. for example ID.
	filter; //A list reprisenting a filter. See getItemsFromListOfJsonItems in jsonfunctions.js for a description.
	selectedEntryId; //The id of the selected entry.
	
	// class methods
	constructor(selectElement, strJsonFolder, strDisplayKey, lstFilter) {
		this.selectionBox = selectElement;
		this.jsonFolder = strJsonFolder;
		this.displayKey = strDisplayKey;
		this.filter = lstFilter;
		this.updateList();
	}
	
	//Update the list of items
	async updateList(){
		//Gets all json items and their filename from the given filelist.
		var retreivedItems = await getFilteredJsonItemsFromFolder(this.jsonFolder, this.filter);
		let selectedIndex = this.selectionBox.selectedIndex;
		this.selectionBox.innerHTML = ""; //Empty the list.
		
		let amountOfJSONObjects = retreivedItems.length;
		let jsonElementID = "";
		var i = 0;
		for (; i < amountOfJSONObjects; i++) {
			jsonElementID = retreivedItems[i][0][this.displayKey];
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
	}
}