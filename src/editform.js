var stringify = require("@aitodotai\\json-stringify-pretty-compact");

//This is a shell around the json-editor to handle file editing
class EditForm {
	
	// class methods
	constructor(jsonContentData, htmlParent) {
		this.jsonContentData = jsonContentData;
		this.htmlParent = htmlParent;
		this.init();
	}
	
	async init(){
    await this.updateSchema(this.type);
		this.createForm();
	}
  
  //Some fields require looking up other items. The required lists are added here.
  async loadExtraDefinitions(type){
    this.schemaInst.definitions = {...this.schemaInst.definitions, ...await getJsonFromFile(await getWorkingDirectory() + SCHEMAS_PATH + "generaldefinitions.json")};
    let IDListOfType = await getIDListOfType(type); //Get all the id's of every item of this type
    //Save the list as a definition to the schema, just in case there's a use for it.
    this.schemaInst.definitions[type] = { "type": "string", "description": "The id of another entry", "enum": IDListOfType };
    
    if(this.schemaInst.properties["copy-from"]){
      this.schemaInst.properties["copy-from"].enum = IDListOfType; //If there's a copy-from then the id list of this type goes here.
    }
    
    //Get a list of looks like entries. This is a list of anything that has a symbol
    if(this.schemaInst.properties["looks_like"]){
      let retreivedItems = await getFilteredJsonItemsFromFolder(await getCataclysmGameFolder() + DATA, [["symbol", "", true, false]]);
      let collectedItems = [];
      let jsonElementID = "", jsonObject, jsonEntry, retrievedItem;
      for (let i = 0, amountOfJSONObjects = retreivedItems.length; i < amountOfJSONObjects; i++) {
        retrievedItem = retreivedItems[i];
        jsonObject = retrievedItem.jsonObject;
        collectedItems.push(jsonObject["id"]);
      }
      this.schemaInst.properties["looks_like"].enum = collectedItems;
    }
    
    if(type == "ammunition_type"){
      IDListOfType = await getIDListOfType("AMMO"); //Get all the id's of every item of type ammo
      let c = this.schemaInst.definitions["AMMO"].enum; //Save the list that's already defined in the ammuition type schema.
      this.schemaInst.definitions["AMMO"].enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the ammo property enumeration.
    }
    
    if(this.type == "MONSTER"){
      IDListOfType = await getIDListOfType("SPECIES"); //Get all the id's of every item of type ammo
      let c = this.schemaInst.definitions["SPECIES"].items.enum; //Save the list that's already defined in the ammuition type schema.
      this.schemaInst.definitions["SPECIES"].items.enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the ammo property enumeration.
    }
    
    if(this.type == "monster_attack"){
      IDListOfType = await getIDListOfType("effect_type"); //Get all the id's of every item of type ammo
      let c = this.schemaInst.definitions["effect_type"].enum; //Save the list that's already defined in the ammuition type schema.
      this.schemaInst.definitions["effect_type"].enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the ammo property enumeration.
    }
  }
  
  async updateSchema(type){
    this.schemaInst = await getJsonFromFile(await getWorkingDirectory() + SCHEMAS_PATH + type + ".json");
    await this.loadExtraDefinitions(type);
    if(this.editor){
      this.editor.schema = this.schemaInst;
    }
  }
  
  get type(){
    return this.jsonContentData.jsonObject.type;
  }
	
	createForm(){
		this.htmlParent.innerHTML = "";
		//Transform the json object to html
		this.htmlParent.appendChild(this.createButtonsRow());
		this.htmlParent.appendChild(createElement("div")); //container for the editor
    
    // Initialize the editor with a JSON schema
    this.editor = new JSONEditor(this.htmlParent.childNodes[1],{
      schema: this.schemaInst,
      theme: 'spectre',
      iconlib: 'spectre',
      selectize: true
    });
    this.editor.setValue(this.jsonContentData.jsonObject);
	}
  
  setValue(jsonContentData){
		this.jsonContentData = jsonContentData;
    if(this.fileNameHTMLElement){
      this.fileNameHTMLElement.innerHTML = jsonContentData.fileName;
    }
    this.editor.setValue(jsonContentData.jsonObject);
  }
	
	//Create row of buttons
	createButtonsRow(){
		let y = document.createElement("DIV"), _this = this;
		y.appendChild(createElement("BUTTON", undefined, {"title": "Save", "class": "btn btn-sm btn-primary mr-2 my-1"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-check'></i> Save"));
		y.appendChild(createElement("BUTTON", undefined, {"title": "Duplicate", "class": "btn btn-sm btn-primary mr-2 my-1"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-copy'></i> Duplicate"));
		y.appendChild(createElement("BUTTON", undefined, {"title": "Delete", "class": "btn btn-sm btn-primary mr-2 my-1 json-editor-btn-delete json-editor-btntype-deleteall"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-delete'></i> Delete"));
    this.fileNameHTMLElement = createElement("SPAN", undefined, undefined, undefined, this.jsonContentData.fileName);
		y.appendChild(this.fileNameHTMLElement);
		return y;
	}
	
  //When the user presses eighter save, duplicate or delete
	async editFormSubmit_click(btnElement){
    let jsonObj = this.editor.getValue();
    this.jsonContentData.jsonObject = jsonObj;
    let fileName = this.jsonContentData.fileName;
    let indexInParentObject = this.jsonContentData.indexInParentObject;
    switch(btnElement.title) {
      case "Save":
        //Clicking save will get all the values from the edit form and modify the stored json
        //It will then write the json to a file.
        updateJsonEntryInFileByIndex(jsonObj, fileName, indexInParentObject); //jsonObj[0] is the json data, jsonObj[1] is the filename
        entryList.updateList();
        break;
      case "Duplicate":
        //This will read the json file of the currently selected entry and then append a new item
        //that is a copy of the currently selected entry and then save the json back to disk.
        jsonObj.id = jsonObj.id + "_copy"
        await appendJsonEntryInFile(jsonObj, fileName);
        entryList.updateList();
        entryList.selectedEntryId = jsonObj.id;
        break;
      case "Delete":
          //Deletes the selected item from the json file it is in.
        	var result = confirm("Are you sure you want to delete this entry?");
          if (result) {
            deleteJsonEntryInFileByIndex(jsonObj, fileName, indexInParentObject);
            entryList.updateList();
            entryList.selectRandom();
          }
        break;
      default:
        // code block
    } 
    this.createForm();
	}
}

