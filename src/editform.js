var stringify = require("@aitodotai\\json-stringify-pretty-compact");

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
    this.fileNameHTMLElement.innerHTML = jsonContentData.fileName;
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
/*
class editForm {
	
	// class methods
	constructor(formDefinitionId, jsonContentData, htmlParent) {
		this.formDefinitionId = formDefinitionId;
		this.jsonContentData = jsonContentData;
		this.htmlParent = htmlParent;
		this.init();
	}
	
	async init(){
		let formDefinitionObj = await this.getEditFormDataFromFile(this.formDefinitionId);
		this.formDefinition = new editForm_FormDefinition(this, formDefinitionObj);
		this.dataObject = new editForm_PrimaryObject(this, this, this.jsonContentData.jsonObject);
		this.createForm();
	}
	
	//Gets the data for the ediform from a file and returns a json object.
	async getEditFormDataFromFile(formDefinitionId) {
		let filePath = getWorkingDirectory() + EDITFORM_DEFINITIONS_PATH;
		let jsonFormObj = await getJsonFromFile(filePath);
		return jsonFormObj;
	}
	
	createForm(){
		this.htmlParent.innerHTML = "";
		//Transform the json object to html
		this.htmlParent.appendChild(this.createButtonsRow());
		this.htmlParent.appendChild(this.dataObject.htmlElement);
	}
	
	//Create row of buttons
	createButtonsRow(){
		let y = document.createElement("DIV"), _this = this;
		y.appendChild(createElement("BUTTON", undefined, {"style":"margin-right:20px;"}, {"click": function() {_this.editFormSubmit_click(this);}}, "Save"));
		y.appendChild(createElement("BUTTON", undefined, {"style":"margin-right:20px;"}, {"click": function() {_this.editFormSubmit_click(this);}}, "Duplicate"));
		y.appendChild(createElement("BUTTON", undefined, {"style":"margin-right:20px;"}, {"click": function() {_this.editFormSubmit_click(this);}}, "Delete"));
		return y;
	}
	
	setContent(jsonContentData){
		this.jsonContentData = jsonContentData;
		this.dataObject.setContent(this.jsonContentData.jsonObject);
		this.createForm();
	}
	
	//Get the json from the form into the json data object.
	updateJson(){
		this.jsonContentData.jsonObject = this.dataObject.getJSON();
	}
	
  //When the user presses eighter save, duplicate or delete
	async editFormSubmit_click(btnElement){
    this.updateJson();
    let jsonContentData = this.jsonContentData;
    let jsonObj = jsonContentData.jsonObject;
    switch(btnElement.textContent) {
      case "Save":
        //Clicking save will get all the values from the edit form and modify the stored json
        //It will then write the json to a file.
        updateJsonEntryInFileByIndex(jsonObj, jsonContentData.fileName, jsonContentData.indexInParentObject); //jsonObj[0] is the json data, jsonObj[1] is the filename
        entryList.updateList();
        break;
      case "Duplicate":
        //This will read the json file of the currently selected entry and then append a new item
        //that is a copy of the currently selected entry and then save the json back to disk.
        jsonObj.id = jsonObj.id + "_copy"
        await appendJsonEntryInFile(jsonObj, jsonContentData.fileName);
        entryList.updateList();
        entryList.selectedEntryId = jsonObj.id;
        break;
      case "Delete":
          //Deletes the selected item from the json file it is in.
        	var result = confirm("Are you sure you want to delete this entry?");
          if (result) {
            deleteJsonEntryInFileByIndex(jsonObj, jsonContentData.fileName, jsonContentData.indexInParentObject);
            entryList.updateList();
            entryList.selectRandom();
          }
        break;
      default:
        // code block
    } 
    this.init();
	}
}
*/

class editForm_PrimaryObject {
	// class methods
	constructor(parentEditForm, parentFormElement, jsonObject) {
		this.parentEditForm = parentEditForm;
		this.parentFormElement = parentFormElement;
		this.setContent(jsonObject);
	}
	
	setContent(jsonObject){
		this.jsonObject = jsonObject;
		this.setProperties(this.jsonObject);
		this.createHTMLElement();
		this.updateAvailablePropertiesSelect();
	}
	
	setProperties(jsonObject){
		this.propertiesList = [];
		let keys = Object.keys(jsonObject), key;
		for (let i = 0, propertiesLength = keys.length; i < propertiesLength; i++) {
			key = keys[i]
			this.propertiesList.push(new editForm_PrimaryProperty(this.parentEditForm, this, key, jsonObject[key]));
		}
	}
	
	//Deletes the property from the json data. The html element from the property is deleted in the property class.
	deleteProperty(property){
		let index = this.propertiesList.indexOf(property);
		if (index > -1) {
		  this.propertiesList.splice(index, 1);
		}
		delete this.jsonObject[property.keyName];
		this.updateAvailablePropertiesSelect();
	}
	
	//Gets the keys and the values for each of the properties.
	//The type of content may differ from property to property.
	updateContent(){
		let propertiesList = this.propertiesList;
		let obj = {};
		let entry;
		for (let i = 0, propertiesLength = propertiesList.length; i < propertiesLength; i++) {
			entry = propertiesList[i]
			obj[entry.keyName] = entry.getKeyValue();
		}
		this.jsonObject = obj;
	}
	
	getJSON(){
		this.updateContent();
		return this.jsonObject;
	};
	
	//Makes a list of fields that are not visible but are defined in the editform json.
	async updateAvailablePropertiesSelect(){
		let htmlString = "";
		let formDefinition = this.parentEditForm.formDefinition;
		if(!formDefinition){return;}
    let toplevel = this.parentEditForm == this.parentFormElement
    htmlString += formDefinition.getAvailableOptions(this.jsonObject, "html");
    if(htmlString){
      this.availablePropertiesList.innerHTML = htmlString;
      this.htmlElement.lastChild.previousSibling.style.display = "";
    } else { //no entries are added so hide the list
      this.htmlElement.lastChild.previousSibling.style.display = "none";
    }
	}
	
	//Add a property and load its default value.
	addProperty_click(){
		//Get the property name
		let availablePropertiesList = this.availablePropertiesList;
		let selectedIndex = availablePropertiesList.selectedIndex
		let propertyName = this.availablePropertiesList.childNodes[selectedIndex].value;
		
		let propertyDefinition = this.parentEditForm.formDefinition.getDefinitionByName(propertyName);
		let entryDefaultValue = propertyDefinition.getDefaultValue();
		
		//Add the property to the list
		let editFormProperty = new editForm_PrimaryProperty(this.parentEditForm, this, propertyName, entryDefaultValue)
		this.propertiesList.push(editFormProperty);
		this.htmlElement.insertBefore(editFormProperty.htmlElement, this.htmlElement.lastChild.previousSibling);
		this.jsonObject[propertyName] = entryDefaultValue;
		this.updateAvailablePropertiesSelect();
	}
	
	createHTMLElement(){
    //Construct a table with all the properties
		let tableElement = createElement("TABLE");
		let propertiesList = this.propertiesList;
		for (let i = 0, propertiesLength = propertiesList.length; i < propertiesLength; i++) {
			tableElement.appendChild(propertiesList[i].htmlElement); //each .htmlElement represents one row in the table.
		}
		
		//Create a extra row for the missing properties
		let rowElement = createElement("TR");
		let cellElement = createElement("TD", "", {colspan: 3}, undefined, "<span style='margin-right:2px'>Add property: </span>");
		rowElement.appendChild(cellElement);
		
    //Create a dropdown of properties that are defined but not visible right now because they are not set in the json.
		this.availablePropertiesList = createElement("select");
		cellElement.appendChild(this.availablePropertiesList);
		
		//Create the add button
		let _this = this;
		cellElement.appendChild(createElement("BUTTON", "", undefined, {"click": function() {_this.addProperty_click();}}, "Add"));
		tableElement.appendChild(rowElement);
		
    rowElement = createElement("TR");
		rowElement.appendChild(createElement("TD", "", {colspan: 3}, undefined, this.parentEditForm.jsonContentData.fileName));
		tableElement.appendChild(rowElement);
		
		//Finalize
		this.htmlElement = tableElement;
	}
}

class editForm_Object {
	// class methods
	constructor(parentEditForm, parentFormElement, jsonObject) {
		this.parentEditForm = parentEditForm;
		this.parentFormElement = parentFormElement;
		this.setContent(jsonObject);
	}
	
	setContent(jsonObject){
    if(!jsonObject){return};
		this.jsonObject = jsonObject;
		this.setProperties(this.jsonObject);
		this.createHTMLElement();
		this.updateAvailablePropertiesSelect();
	}
	
	setProperties(jsonObject){
    if(!jsonObject){return};
		this.propertiesList = [];
		let keys = Object.keys(jsonObject), key;
		for (let i = 0, propertiesLength = keys.length; i < propertiesLength; i++) {
			key = keys[i]
			this.propertiesList.push(new editForm_Property(this.parentEditForm, this, key, jsonObject[key]));
		}
	}
	
	//Deletes the property from the json data. The html element from the property is deleted in the property class.
	deleteProperty(property){
		let index = this.propertiesList.indexOf(property);
		if (index > -1) {
		  this.propertiesList.splice(index, 1);
		}
		delete this.jsonObject[property.keyName];
		this.updateAvailablePropertiesSelect();
	}
	
	//Gets the keys and the values for each of the properties.
	//The type of content may differ from property to property.
	updateContent(){
		let propertiesList = this.propertiesList;
		let obj = {};
		let entry;
		for (let i = 0, propertiesLength = propertiesList.length; i < propertiesLength; i++) {
			entry = propertiesList[i]
			obj[entry.keyName] = entry.getKeyValue();
		}
		this.jsonObject = obj;
	}
	
	getJSON(){
		this.updateContent();
		return this.jsonObject;
	};
	
	//Makes a list of fields that are not visible but are defined in the editform json.
	async updateAvailablePropertiesSelect(){
		let entryDefinition = this.parentEditForm.formDefinition.getPropertyParentDefinition(this);
		if(entryDefinition){
			let htmlString = "";
			let valid_values = entryDefinition.validValues;
			if(valid_values){
				let lookup_filter = valid_values.lookup_filter
				if(lookup_filter){ //The valid values are determined by a lookup filter.
					let filter = await getFilterFromFiltersFile(lookup_filter);
					let filteredItems = await getFilteredJsonItemsFromFolder(await getCataclysmGameFolder() + DATA_MODS, filter);
					let filteredItem;
					for (let n = 0, filteredItemslength = filteredItems.length; n < filteredItemslength; n++) {
						filteredItem = filteredItems[n].jsonObject;
						htmlString += "<option value='"+filteredItem.id+"'>"+filteredItem.id+"</option>";
					}
				} else { //The valid values are defined in the list of valid values.
					let valid_value;
					let valid_value_keyName
					for (let n = 0, filteredItemslength = valid_values.length; n < filteredItemslength; n++) {
						valid_value = valid_values[n];
						valid_value_keyName = valid_value.keyname
						if(this.jsonObject[valid_value_keyName] == null){
							htmlString += "<option value='"+valid_value_keyName+"'>"+valid_value_keyName+"</option>";
						}
					}
				}
			}
			if(htmlString){
				this.availablePropertiesList.innerHTML = htmlString;
				this.htmlElement.lastChild.style.display = "";
			} else { //no entries are added so hide the list
				this.htmlElement.lastChild.style.display = "none";
			}
		}
	}
	
	
	//Add a property and load its default value.
	addProperty_click(){
		//Get the property name
		let availablePropertiesList = this.availablePropertiesList;
		let selectedIndex = availablePropertiesList.selectedIndex
		let propertyName = this.availablePropertiesList.childNodes[selectedIndex].value;
		
		//Get the default value
		let parentPropertyName = getParentKeyName(this);
		let propertyDefinition = this.parentEditForm.formDefinition.getDefinitionByName(parentPropertyName);
		let entryDefaultValue = propertyDefinition.getDefaultValue(propertyName);
		
		//Add the property to the list
		let editFormProperty = new editForm_Property(this.parentEditForm, this, propertyName, entryDefaultValue)
		this.propertiesList.push(editFormProperty);
		this.htmlElement.insertBefore(editFormProperty.htmlElement, this.htmlElement.lastChild);
		this.jsonObject[propertyName] = entryDefaultValue;
		this.updateAvailablePropertiesSelect();
	}
	
	createHTMLElement(){
		let tableElement = createElement("TABLE");
		let propertiesList = this.propertiesList;
		for (let i = 0, propertiesLength = propertiesList.length; i < propertiesLength; i++) {
			tableElement.appendChild(propertiesList[i].htmlElement);
		}
		
		//Create a extra row for the missing properties
		let rowElement = createElement("TR");
		let cellElement = createElement("TD", "", {colspan:3}, undefined, "<span style='margin-right:2px'>Add property: </span>");
		
    
    //Create a dropdown of properties that are defined but not visible right now because they are not set in the json.
		let selectList = createElement("select");
		rowElement.appendChild(cellElement);
		this.availablePropertiesList = selectList;
		cellElement.appendChild(this.availablePropertiesList);
		
		//Create the add button
		let editForm_ObjectInstance = this;
    cellElement.appendChild(createElement("BUTTON", undefined, {"style":"margin-left:5px;"}, {"click": function() {editForm_ObjectInstance.addProperty_click();}}, "Add"));
		
		//Finalize
		tableElement.appendChild(rowElement);
		this.htmlElement = tableElement;
	}
}

class editForm_PrimaryProperty {
	constructor(parentEditForm, parentFormElement, keyName, keyValue) {
		this.parentEditForm = parentEditForm;
		this.parentFormElement = parentFormElement;
		this.keyName = keyName;
		this.keyValue = keyValue;
		this.definition = this.parentEditForm.formDefinition.getDefinitionByName(this.keyName);
		this.createHTMLElement();
	}
	
	//Remove itself from the editform.
	deleteProperty_Click(){
		this.parentFormElement.deleteProperty(this); //Remove itself from the parent object
		this.htmlElement.parentElement.removeChild(this.htmlElement); //Remove itself from the visible form.
	}
	
	//Creates a row to edit this property and value
	createHTMLElement(){
		let y = document.createElement("TR");
		let _this = this;

		//The delete button
		let z = document.createElement("TD");
		z.appendChild(createElement("BUTTON", undefined, {"title":"Delete"}, {"click": function() {_this.deleteProperty_Click();}}, "X"));
		y.appendChild(z);

		//Shows the keyname
		y.appendChild(createElement("TD", undefined, {"title":this.definition.description}, undefined, this.keyName));

		//Allow editing the value
		z = document.createElement("TD");
		let jsonValue = this.keyValue;
		if(Number.isInteger(jsonValue)){
			z.innerHTML = "<input type='number' size='90' value='"+jsonValue+"'>";
			this.returnFunction = function () {return this.returnInputNumber(z)};
		} else if(typeof jsonValue === 'object' && jsonValue !== null){
			//It's an object
			if(Array.isArray(jsonValue)){ //It's an array
				if(typeof jsonValue[0] === 'object' && jsonValue !== null){ //It's a list of objects
					this.propertyObject = new editForm_ObjectList(this.parentEditForm, this, jsonValue);
					z.appendChild(this.propertyObject.htmlElement);
					this.returnFunction = function () {return this.returnInputObjectJSON()};
				} else { //It's an array
					this.propertyObject = new editForm_BasicList(this.parentEditForm, this, jsonValue);
					z.appendChild(this.propertyObject.htmlElement);
					this.returnFunction = function () {return this.returnInputObjectJSON()};
				}
			} else { //It's an object but not an array
					this.propertyObject = new editForm_Object(this.parentEditForm, this, jsonValue);
					z.appendChild(this.propertyObject.htmlElement);
					this.returnFunction = function () {return this.returnInputObjectJSON()};
			}
		} else { //It's something else, assume string
			z.innerHTML = "<input type='text' size='90' value='"+jsonValue+"'>";
			this.returnFunction = function () {return this.returnInputString(z)};
		}
		y.appendChild(z);
		
		this.htmlElement = y;
	}
	
	returnInputNumber(htmlElement){
		return parseInt(htmlElement.childNodes[0].value);
	}
	
	returnInputString(htmlElement){
		return htmlElement.childNodes[0].value;
	}
	
	returnInputObjectJSON(){
		return this.propertyObject.getJSON();
	}
	
	getKeyValue(){
		return this.returnFunction();
	}
}

class editForm_Property {
	
	constructor(parentEditForm, parentFormElement, keyName, keyValue) {
		this.parentEditForm = parentEditForm;
		this.parentFormElement = parentFormElement;
		this.keyName = keyName;
		this.keyValue = keyValue;
		this.definition = this.parentEditForm.formDefinition.getPropertyParentDefinition(this);
		this.createHTMLElement();
	}
	
	//Remove itself from the editform.
	deleteProperty_Click(){
		this.parentFormElement.deleteProperty(this); //Remove itself from the parent object
		this.htmlElement.parentElement.removeChild(this.htmlElement); //Remove itself from the visible form.
	}
	
	//Creates a row to edit this property and value
	createHTMLElement(){
		let y = document.createElement("TR");
		let editForm_PropertyInstance = this;

		//The delete button
		let z = document.createElement("TD");
		let btn = document.createElement("BUTTON");
		btn.innerHTML = "X";
		btn.title = "Delete";
		btn.onclick = function() { editForm_PropertyInstance.deleteProperty_Click(); }
		z.appendChild(btn);
		y.appendChild(z);

		//Shows the keyname
		z = document.createElement("TD");
		let t = document.createTextNode(this.keyName);
		z.appendChild(t);
		y.appendChild(z);

		//Allow editing the value
		z = document.createElement("TD");
		let jsonValue = this.keyValue;
		if(Number.isInteger(jsonValue)){
			z.innerHTML = "<input type='number' size='90' value='"+jsonValue+"'>";
			this.returnFunction = function () {return this.returnInputNumber(z)};
		} else if(typeof jsonValue === 'object' && jsonValue !== null){
			//It's an object
			if(Array.isArray(jsonValue)){ //It's an array
				if(typeof jsonValue[0] === 'object' && jsonValue !== null){ //It's a list of objects
					this.propertyObject = new editForm_ObjectList(this.parentEditForm, this, jsonValue);
					z.appendChild(this.propertyObject.htmlElement);
					this.returnFunction = function () {return this.returnInputObjectJSON()};
				} else { //It's an array
					this.propertyObject = new editForm_BasicList(this.parentEditForm, this, jsonValue);
					z.appendChild(this.propertyObject.htmlElement);
					this.returnFunction = function () {return this.returnInputObjectJSON()};
				}
			} else { //It's an object but not an array
					this.propertyObject = new editForm_Object(this.parentEditForm, this, jsonValue);
					z.appendChild(this.propertyObject.htmlElement);
					this.returnFunction = function () {return this.returnInputObjectJSON()};
			}
		} else { //It's something else, assume string
			z.innerHTML = "<input type='text' size='90' value='"+jsonValue+"'>";
			this.returnFunction = function () {return this.returnInputString(z)};
		}
		y.appendChild(z);
		
		this.htmlElement = y;
	}
	
	returnInputNumber(htmlElement){
		return parseInt(htmlElement.childNodes[0].value);
	}
	
	returnInputString(htmlElement){
		return htmlElement.childNodes[0].value;
	}
	
	returnInputObjectJSON(){
		return this.propertyObject.getJSON();
	}
	
	getKeyValue(){
		return this.returnFunction();
	}
}

//Used to for basic arrays
class editForm_BasicList {
	
	// class methods
	constructor(parentEditForm, parentFormElement, jsonList) {
		this.parentEditForm = parentEditForm;
		this.parentFormElement = parentFormElement;
		this.jsonList = jsonList;
		this.createHTMLElement();
	}
	
	createBasicStyledList(){
		let listElement = document.createElement("select");
		listElement.multiple = true;
		listElement.size = "5";
		// listElement.style.cssFloat = 'left';
		listElement.style.width = "150px";
		return listElement;
	}
	
	getJSON(){
		let jsonList = [];
		let addedList = this.addedList;
		let addedChildNodes = addedList.childNodes;
		let addedChildNode, addedChildNodeValue;
		for (let y = 0, propertiesLength = addedChildNodes.length; y < propertiesLength; y++) {
			addedChildNode = addedChildNodes[y];
			addedChildNodeValue = addedChildNode.value;
			jsonList.push(addedChildNodeValue);
		}
		return jsonList;
	}

	//When an user doubleclicks on an entry in one of the lists.
	addedEntryListItem_doubleclick(htmlElement){
		let editForm_BasicListInstance = this;
		moveEntryBetweenLists(htmlElement, this.addedList, this.availableList, function(){editForm_BasicListInstance.availableEntryListItem_doubleclick(this)});
	}

	//When an user doubleclicks on an entry in one of the lists.
	availableEntryListItem_doubleclick(htmlElement){
		let editForm_BasicListInstance = this;
		moveEntryBetweenLists(htmlElement, this.availableList, this.addedList, function(){editForm_BasicListInstance.addedEntryListItem_doubleclick(this)});
	}
	
	createHTMLElement(){
		//Construct the nodes
		//Create the parent
		let y = document.createElement("DIV");
		y.className = "editFormList"
		
		//Create the list with elements already in the entry json.
		let addedList = this.createBasicStyledList();
		this.addedList = addedList;
		y.appendChild(addedList);
		
		//Some instructions for the user.
		let t = document.createElement("span");
		t.innerHTML = "<< add<br>remove >>";
		y.appendChild(t);
		
		//Create the list of elements available to be added.
		let availableList = this.createBasicStyledList();
		this.availableList = availableList;
		y.appendChild(availableList);
		
		//Fill the lists
		let formDefinition = this.parentEditForm.formDefinition;
		if(formDefinition){
			let parentKey = getParentKeyName(this);
			let entryDefinition = formDefinition.getDefinitionByName(parentKey);
			if(entryDefinition){
				let entryValidValues = entryDefinition.validValues;
				if(entryValidValues){
					let validValue, validValueName, validValueDescription, editForm_BasicListInstance;
					editForm_BasicListInstance = this; //Useful for passing this class instance into the event handler.
					for (let y = 0, propertiesLength = entryValidValues.length; y < propertiesLength; y++) {
						validValue = entryValidValues[y]; //A entry in the form definition. It should at least have a key name
						validValueName = validValue.name; //The key name of the entry in the form definition
						let htmlOption = document.createElement('option');
						
						if(validValueName){
							htmlOption.text = validValueName;
							htmlOption.value = validValueName;
							htmlOption.title = validValue.description;
							//Check if the list of the json entry contains the value from the list of valid values.
							//If this is true, the item will be added to the left select element. Otherwise it will be added to the right.
							if(this.jsonList.indexOf(validValueName) >= 0) {
								htmlOption.ondblclick = function(){editForm_BasicListInstance.addedEntryListItem_doubleclick(this)}; //ends in typeerror
								addedList.appendChild(htmlOption);
							} else {
								htmlOption.ondblclick = function(){editForm_BasicListInstance.availableEntryListItem_doubleclick(this)}; //ends in typeerror
								availableList.appendChild(htmlOption);
							}
						} else {
							htmlOption.text = validValue;
							htmlOption.value = validValue;
							//Check if the list of the json entry contains the value from the list of valid values.
							//If this is true, the item will be added to the left select element. Otherwise it will be added to the right.
							if(this.jsonList.indexOf(validValue) >= 0) {
								htmlOption.ondblclick = function(){editForm_BasicListInstance.addedEntryListItem_doubleclick(this)}; //ends in typeerror
								addedList.appendChild(htmlOption);
							} else {
								availableList.appendChild(htmlOption);
								htmlOption.ondblclick = function(){editForm_BasicListInstance.availableEntryListItem_doubleclick(this)}; //ends in typeerror
							}
						}
					}
				}
			}
		}
		
		//Keep the div node
		this.htmlElement = y;
	}
}

//Used for a list of objects
class editForm_ObjectList {
	
	// class methods
	constructor(parentEditForm, parentFormElement, jsonList) {
		this.parentEditForm = parentEditForm;
		this.parentFormElement = parentFormElement;
		this.jsonList = jsonList;
		this.init();
	}
	
	init(){
		this.createObjectList();
		this.createHTMLElement();
	};
	
	createObjectList(){
		let jsonEntry, jsonList, objectList;
		jsonList = this.jsonList;
		objectList = [];
		for (let y = 0, propertiesLength = jsonList.length; y < propertiesLength; y++) {
			jsonEntry = jsonList[y];
			objectList.push(new editForm_Object(this.parentEditForm, this, jsonEntry));
		}
		this.objectList = objectList;
	};
	
	
	getJSON(){
		let jsonList = [];
		let objectList = this.objectList;
		let objectEntry;
		for (let y = 0, listLength = objectList.length; y < listLength; y++) {
			objectEntry = objectList[y];
			jsonList.push(objectEntry.getJSON());
		}
		return jsonList;
	}
	
	deleteObjectFromList_Click(btn){
    
    
    //Calculate the child number
    let buttonParentRow = btn.parentElement.parentElement;
    let index = 0;
    while( (buttonParentRow = buttonParentRow.previousSibling) != null ) {
      index++;
    }
		
		this.objectList.splice(index, 1); //Remove the form element from the object list
		delete this.jsonList[index]; //Remove the entry from the json data
		this.htmlElement.removeChild(this.htmlElement.childNodes[index]); //Remove itself from the visible form.
		
		if(this.objectList.length < 1){
			// The list is empty now, prompt the user to delete the list as well.
			var result = confirm("No more in this list. Do you want to delete the property as well?");
			if (result) {
				// The list is empty and the user wants to delete the empty property as well.
				this.parentFormElement.deleteProperty_Click();
			} else {
				// The list is empty but the user wants to keep property. Create a new entry with default value.
				addObjectToList_Click();
			}
		}
	}
	
	
	
	//Add a entry and load its default value.
	addObjectToList_Click(){
		let propertyName = getParentKeyName(this);
		let entryDefaultValue = this.parentEditForm.formDefinition.getDefinitionByName(propertyName).getDefaultValue()[0];
		if(!entryDefaultValue){return;}
    
		//Add the property to the list
		let editFormObject = new editForm_Object(this.parentEditForm, this, entryDefaultValue)
		this.objectList.push(editFormObject);
		
		let y = createElement("TR");
		this.createObjectHTMLElement(y, editFormObject, this.objectList.length-1)
		this.htmlElement.insertBefore(y, this.htmlElement.lastChild);
		this.jsonList.push(entryDefaultValue);
	}
	
	createObjectHTMLElement(y, objectEntry){
		let z, _this = this;
			
		//Cell one contains a delete button to delete the object
		z = createElement("TD", undefined, {class: "objectListCell"});
		z.appendChild(createElement("BUTTON", undefined, {"title":"Delete"}, {"click": function() {_this.deleteObjectFromList_Click(this);}}, "X"));
		y.appendChild(z);
		
		//Cell two contains the content of the property
		z = createElement("TD", undefined, {class: "objectListCell"});
		z.appendChild(objectEntry.htmlElement);
		y.appendChild(z);
		
	}
	
	createHTMLElement(){
		//Construct the object nodes
		let x, y, z;
		let objectList = this.objectList;
		let _this = this;
		x = createElement("TABLE", undefined, {class: "objectListTable"});
		for (let i = 0, propertiesLength = objectList.length; i < propertiesLength; i++) {
			y = createElement("TR", undefined, {class: "objectListRow"});
			x.appendChild(y);
			this.createObjectHTMLElement(y, objectList[i]);
		}
		y = createElement("TR");
		x.appendChild(y);
		
		//Cell one contains a add button.
		z = createElement("TD", undefined, {colSpan:2}, undefined, "Add new entry: ");
		z.appendChild(createElement("BUTTON", undefined, {"title":"Add new entry"}, {"click": function() {_this.addObjectToList_Click();}}, "Add"));
		y.appendChild(z);
			
		//Keep the table node
		this.htmlElement = x;
	}
}

//Used for a list of objects
class editForm_FormDefinition {
	
	// class methods
	constructor(parentEditForm, formDefinitionObj) {
		this.parentEditForm = parentEditForm;
		this.formDefinitionId = this.parentEditForm.formDefinitionId;
		this.getEditFormData(formDefinitionObj);
	}
	
	getDefinitionByName(definitionName){
		let entryDefinitions = this.propertyDefinitions;
		let entryDefinition;
		for (let i = 0, amountOfItems = entryDefinitions.length; i < amountOfItems; i++) {
			entryDefinition = entryDefinitions[i];
			if(entryDefinition.keyName == definitionName){
				return entryDefinition;
			}
		}
		return false;
	}
	
	getEditFormData(formDefinitionData){
		this.propertyDefinitions = [];
		this.getPropertyDefinitions(formDefinitionData, this.formDefinitionId, this.propertyDefinitions);
	}
	
  //Gets the json from the form definition and transforms it into formdefinition objects.
  //If a entry contains an 'include' type, the definitions from the defined formdefinition are also added.
	getPropertyDefinitions(formDefinitionData, formDefinitionId, propertyDefinitions){
		let formDefinitionObj = getItemFromListOfJsonItems(formDefinitionData, [["id", formDefinitionId, true, true]]);
		let formDefinition = formDefinitionObj.jsonObject;
    if(!formDefinition){return;}
    let entryDefinitions = formDefinition.definition;
    let jsonSubFormObj, jsonEntry, type;
    for (let i = 0, amountOfItems = entryDefinitions.length; i < amountOfItems; i++) {
      jsonEntry = entryDefinitions[i]
      type = jsonEntry.type;
      if(type == "include"){ //An entry can be a include entry. It will append the entries of that included file to this json object.
        jsonSubFormObj = this.getPropertyDefinitions(formDefinitionData, jsonEntry.formdefinition, propertyDefinitions);
      } else {
        propertyDefinitions.push(new editForm_PropertyDefinition(this.parentEditForm, this, jsonEntry));
      }
    }
	}
	
	//Takes a json object and returns a list of all properties that are NOT in the json object.
	//Return type determines if it will return the properties or html options.
	getAvailableOptions(jsonObject, returnType){
		let htmlString = "";
		let returnList = [];
		let propertyDefinitions = this.propertyDefinitions;
		let definition, definitionKeyName;
		for (let y = 0, propertiesLength = propertyDefinitions.length; y < propertiesLength; y++) {
			definition = propertyDefinitions[y]; //A entry in the form definition. It should at least have a key name
			definitionKeyName = definition.keyName; //The key name of the entry in the form definition
			if(!definitionKeyName){continue;} //if it does not have  a keyname, it's not an entry we are looking for, skip it.
			if(jsonObject[definitionKeyName] == null){	//If the id of the editform json corresponds to a key in the json object
				//The key name is defined in the form, but the json entry does not have that property applied.
				htmlString += "<option value='"+definitionKeyName+"'>"+definitionKeyName+"</option>";
				returnList.push(definition);
			}
		}
		if(returnType == "html"){
			return htmlString;
		} else {
			return returnList;
		}
	}
	
	//Get the definition for the property
	getPropertyParentDefinition(property){
		let parentFormElement = property.parentFormElement
		if(parentFormElement){
      let entryDefinition = parentFormElement.definition;
      if(entryDefinition){
        return entryDefinition;
      } else {
        return this.getPropertyParentDefinition(parentFormElement);
      }
		}
	};
	
}

//Used for a list of objects
class editForm_PropertyDefinition {
	
	// class methods
	constructor(parentEditForm, parentFormDefinition, jsonEntry) {
		this.parentEditForm = parentEditForm;
		this.parentFormDefinition = parentFormDefinition;
		this.jsonEntry = jsonEntry;
	}
	
	get keyName(){
		return this.jsonEntry.keyname;
	}
	
	get validValues(){
		return this.jsonEntry.valid_values;
	}
	
	get description(){
		return this.jsonEntry.description;
	}
	
	get defaultValue(){
		return this.jsonEntry.default_value;
	}
	
	getDefaultValue(propertyName){
		//The default value changes based on the validvalues property.
		let validValues = this.validValues;
		let defaultValue = this.defaultValue;
		if(validValues){
			if(validValues.lookup_filter){ 
				//A lookup filter is provided so it takes its valid values from a list of other json entries.
				//We are only interested in setting a value for the property here. The property name is already provided with propertyName.
				//The default values property has a value we can use to set the default value of our new property with name propertyname.
				if(defaultValue != null){
					let keys = Object.keys(defaultValue); //Don't know what the default keyname is for a new entry, but we still want the value that goes with it.
					return defaultValue[keys[0]]; //Get the value for the first key in the default value.
				}
			} else {
				//A propertyname other then the propertyname of this definition has been provided.
				//This means that the property name is in the list of valid values and we should return its default value.
				if(propertyName){
					let validValueObj = getItemFromListOfJsonItems(validValues, [["keyname", propertyName, true, true]]);
					let validValue = validValueObj.jsonObject;
					defaultValue = validValue.default_value;
				}
				
				//A default value could be an empty list [] but we still want it returned so check that it's something other then null.
				if(defaultValue != null){
					return defaultValue;
				}
			}
		} else if(defaultValue){ //No valid values are given, assume the default value.
			return defaultValue;
		}
		return "";
	}
}


function getParentKeyName(formElement){
	if(formElement.keyName){
		return formElement.keyName;
	} else if(formElement.parentFormElement) {
		return getParentKeyName(formElement.parentFormElement);
	}
	return false;
}


/*
// Get the default value assigned to the property in the form definition
function getPropertyDefaultValue(propertyElement, propertyName){
	// Get the definition for this property. If it is not defined, it will get the property definition of the parent form element.
	let entryDefinition = getPropertyDefinition(propertyElement, propertyName);
	
	// The default value changes based on the validvalues property.
	let validValues = entryDefinition.validValues;
	let defaultValue = entryDefinition.defaultValue;
	if(validValues){
		if(validValues.lookup_filter){ 
			// A lookup filter is provided so it takes its valid values from a list of other json entries.
			// We are only interested in setting a value for the property here. The property name is already provided with propertyName.
			// The default values property has a value we can use to set the default value of our new property with name propertyname.
			if(defaultValue != null){
				let keys = Object.keys(defaultValue); //Don't know what the default keyname is for a new entry, but we still want the value that goes with it.
				return defaultValue[keys[0]]; //Get the value for the first key in the default value.
			}
		} else {
			// A default value could be an empty list [] but we still want it returned so check that it's something other then null.
			if(defaultValue != null){
				return defaultValue;
			}
		}
	} else if(defaultValue){ //No valid values are given, assume the default value.
		return defaultValue;
	}
	return "";
}*/