class jsonObjList {
	selectionBox; //An element in the DOM that will get updated with its content
	jsonFolder; //Look in this folder for items to add to the list
	displayKey; //The key to display in the list. for example ID.
	
	// class methods
	constructor(selectElement, strJsonFolder, strDisplayKey) {
		this.selectionBox = selectElement;
		this.jsonFolder = strJsonFolder;
		this.displayKey = strDisplayKey;
		this.updateList();
	}
	
	//Update the list of items
	async updateList(){
		//Gets all json items and their filename from the given filelist. Type should be present (true) and it should be matched (true)
		var retreivedItems = await getFilteredJsonItemsFromFolder(this.jsonFolder, [["type", "npc", true, true]]);
		
		let amountOfJSONObjects = retreivedItems.length;
		let npcID = "";
		var i = 0;
		for (; i < amountOfJSONObjects; i++) {
			npcID = retreivedItems[i][0].id;
			let opt = document.createElement('option');
			opt.value = npcID;
			opt.innerHTML = npcID;
			opt.title = JSON.stringify(retreivedItems[i]);
			this.selectionBox.appendChild(opt);
		}
	}
}