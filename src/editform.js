var stringify = require("@aitodotai\\json-stringify-pretty-compact");

//This is a shell around the json-editor to handle file editing
class EditForm {
	
	// class methods
	constructor(loki, htmlParent, entries, schemas) {
		this.loki = loki;
		this.htmlParent = htmlParent;
		this.schemas = schemas;
		this.init();
	}
	
	async init(){
    if(this.editor){
      this.editor.schema = this.schemaInst;
    }
		this.createForm();
	}
  
  get type(){
    return this.jsonObject.type;
  }
  
  get fileName(){
    return entries.get(this.loki).fileName;
  }
  
  get indexInParentObject(){
    return entries.get(this.loki).indexInParentObject;
  }
  
  get jsonObject(){
    return entries.get(this.loki).jsonObject;
  }
  
  set jsonObject(jsonObject){
    entries.get(this.loki).jsonObject = jsonObject;
  }
  
  //Returns the first schema it can find of the given type.
  get schemaInst(){
    return this.schemas.findOne({ "jsonObject.properties.type.default": { $eq: this.type } }).jsonObject;
  }
	
	createForm(){
    if(this.editor) this.editor.destroy();
		this.htmlParent.innerHTML = "";
		//Transform the json object to html
		this.htmlParent.appendChild(this.createButtonsRow());
		this.htmlParent.appendChild(createElement("div")); //container for the editor
    
    // Initialize the editor with a JSON schema
    this.editor = new JSONEditor(this.htmlParent.childNodes[1],{
      schema: this.schemaInst,
      theme: 'spectre',
      iconlib: 'spectre',
      selectize: true,
      remove_empty_properties: false
    });
    this.editor.setValue(this.jsonObject);
	}
  
  setValue(loki){
		this.loki = loki;
    if(this.fileNameHTMLElement){
      this.fileNameHTMLElement.innerHTML = this.fileName;
    }
    this.createForm();
  }
	
	//Create row of buttons
	createButtonsRow(){
		let y = document.createElement("DIV"), _this = this;
		y.appendChild(createElement("BUTTON", undefined, {"title": "Save", "class": "btn btn-sm btn-primary mr-2 my-1"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-check'></i> Save"));
		y.appendChild(createElement("BUTTON", undefined, {"title": "Duplicate", "class": "btn btn-sm btn-primary mr-2 my-1"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-copy'></i> Duplicate"));
		y.appendChild(createElement("BUTTON", undefined, {"title": "Delete", "class": "btn btn-sm btn-primary mr-2 my-1 json-editor-btn-delete json-editor-btntype-deleteall"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-delete'></i> Delete"));
    this.fileNameHTMLElement = createElement("SPAN", undefined, undefined, undefined, this.fileName);
		y.appendChild(this.fileNameHTMLElement);
		return y;
	}
  
  
  //Ensures the order of the keys in the object is the same as it was when loaded from disk
	async getValueKeepOrder(oldObj, newObj){
    let key, keys;
    
    //Iterate over the keys in the new object to see if there is any new property
    keys = Object.keys(newObj);
    for(let y = 0, keyslength = keys.length; y<keyslength; y++){
      key = keys[y];
      if(typeof newObj[key] === 'object' && newObj[key] !== null){ //Check if the new key is an object
        if(typeof oldObj[key] === 'object' && oldObj[key] !== null){ //The old key is an object
          oldObj[key] = await this.getValueKeepOrder(oldObj[key], newObj[key]);
        } else { //The old key is not an object. replace it entirely
          oldObj[key] = newObj[key];
        }
      } else {
        oldObj[key] = newObj[key];
      }
    }
    
    //Iterate over the keys in the old object delete keys that no longer exist in the new object
    keys = Object.keys(oldObj);
    for(let i = 0, keyslength = keys.length; i<keyslength; i++){
      key = keys[i];
      if (typeof newObj[key] === 'undefined'){
        delete oldObj[key]; 
      }
    }
    return oldObj;
  }
	
  //When the user presses eighter save, duplicate or delete
	async editFormSubmit_click(btnElement){
    let jsonObj = await this.getValueKeepOrder(this.jsonObject, this.editor.getValue());
    switch(btnElement.title) {
      case "Save":
        //Clicking save will get all the values from the edit form and modify the stored json
        //It will then write the json to a file.
        await updateJsonEntryInFileByIndex(jsonObj, this.fileName, this.indexInParentObject); //jsonObj[0] is the json data, jsonObj[1] is the filename
        entryList.updateList();
        break;
      case "Duplicate":
        //This will read the json file of the currently selected entry and then append a new item
        //that is a copy of the currently selected entry and then save the json back to disk.
        jsonObj.id = jsonObj.id + "_copy"
        await appendJsonEntryInFile(jsonObj, this.fileName);
        entryList.updateList();
        entryList.selectedEntryId = jsonObj.id;
        break;
      case "Delete":
          //Deletes the selected item from the json file it is in.
        	var result = confirm("Are you sure you want to delete this entry?");
          if (result) {
            await deleteJsonEntryInFileByIndex(jsonObj, this.fileName, this.indexInParentObject);
            entryList.updateList();
            entryList.selectRandom();
          }
        break;
      default:
        // code block
    } 
    // console.log("teditFormSubmit_click");
    // this.createForm();
	}
  
    
}

// This is a shell around the json-editor to handle file editing
// class EditForm {
	
	// class methods
	// constructor(jsonContentData, htmlParent, schemas) {
		// this.jsonContentData = jsonContentData;
		// this.htmlParent = htmlParent;
		// this.schemas = schemas;
		// this.init();
	// }
	
	// async init(){
    // if(this.editor){
      // this.editor.schema = this.schemaInst;
    // }
		// this.createForm();
	// }
  
  // get type(){
    // return this.jsonContentData.jsonObject.type;
  // }
  
  // Returns the first schema it can find of the given type.
  // get schemaInst(){
    // return schemas.findOne({ "jsonObject.properties.type.default": { $eq: this.type } }).jsonObject;
  // }
	
	// createForm(){
    // if(this.editor) this.editor.destroy();
		// this.htmlParent.innerHTML = "";
		// Transform the json object to html
		// this.htmlParent.appendChild(this.createButtonsRow());
		// this.htmlParent.appendChild(createElement("div")); //container for the editor
    
    // Initialize the editor with a JSON schema
    // this.editor = new JSONEditor(this.htmlParent.childNodes[1],{
      // schema: this.schemaInst,
      // theme: 'spectre',
      // iconlib: 'spectre',
      // selectize: true,
      // remove_empty_properties: false
    // });
    // this.editor.setValue(this.jsonContentData.jsonObject);
	// }
  
  // setValue(jsonContentData){
		// this.jsonContentData = jsonContentData;
    // if(this.fileNameHTMLElement){
      // this.fileNameHTMLElement.innerHTML = jsonContentData.fileName;
    // }
    // this.createForm();
  // }
	
	// Create row of buttons
	// createButtonsRow(){
		// let y = document.createElement("DIV"), _this = this;
		// y.appendChild(createElement("BUTTON", undefined, {"title": "Save", "class": "btn btn-sm btn-primary mr-2 my-1"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-check'></i> Save"));
		// y.appendChild(createElement("BUTTON", undefined, {"title": "Duplicate", "class": "btn btn-sm btn-primary mr-2 my-1"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-copy'></i> Duplicate"));
		// y.appendChild(createElement("BUTTON", undefined, {"title": "Delete", "class": "btn btn-sm btn-primary mr-2 my-1 json-editor-btn-delete json-editor-btntype-deleteall"}, {"click": function() {_this.editFormSubmit_click(this);}}, "<i class='icon icon-delete'></i> Delete"));
    // this.fileNameHTMLElement = createElement("SPAN", undefined, undefined, undefined, this.jsonContentData.fileName);
		// y.appendChild(this.fileNameHTMLElement);
		// return y;
	// }
  
  
  // Ensures the order of the keys in the object is the same as it was when loaded from disk
	// async getValueKeepOrder(oldObj, newObj){
    // let key, keys;
    
    // Iterate over the keys in the new object to see if there is any new property
    // keys = Object.keys(newObj);
    // for(let y = 0, keyslength = keys.length; y<keyslength; y++){
      // key = keys[y];
      // if(typeof newObj[key] === 'object' && newObj[key] !== null){ //Check if the new key is an object
        // if(typeof oldObj[key] === 'object' && oldObj[key] !== null){ //The old key is an object
          // oldObj[key] = await this.getValueKeepOrder(oldObj[key], newObj[key]);
        // } else { //The old key is not an object. replace it entirely
          // oldObj[key] = newObj[key];
        // }
      // } else {
        // oldObj[key] = newObj[key];
      // }
    // }
    
    // Iterate over the keys in the old object delete keys that no longer exist in the new object
    // keys = Object.keys(oldObj);
    // for(let i = 0, keyslength = keys.length; i<keyslength; i++){
      // key = keys[i];
      // if (typeof newObj[key] === 'undefined'){
        // delete oldObj[key]; 
      // }
    // }
    // return oldObj;
  // }
	
  // When the user presses eighter save, duplicate or delete
	// async editFormSubmit_click(btnElement){
    // let jsonObj = await this.getValueKeepOrder(this.jsonContentData.jsonObject, this.editor.getValue());
    // let fileName = this.jsonContentData.fileName;
    // let indexInParentObject = this.jsonContentData.indexInParentObject;
    // switch(btnElement.title) {
      // case "Save":
        // Clicking save will get all the values from the edit form and modify the stored json
        // It will then write the json to a file.
        // updateJsonEntryInFileByIndex(jsonObj, fileName, indexInParentObject); //jsonObj[0] is the json data, jsonObj[1] is the filename
        // entryList.updateList();
        // break;
      // case "Duplicate":
        // This will read the json file of the currently selected entry and then append a new item
        // that is a copy of the currently selected entry and then save the json back to disk.
        // jsonObj.id = jsonObj.id + "_copy"
        // await appendJsonEntryInFile(jsonObj, fileName);
        // entryList.updateList();
        // entryList.selectedEntryId = jsonObj.id;
        // break;
      // case "Delete":
          // Deletes the selected item from the json file it is in.
        	// var result = confirm("Are you sure you want to delete this entry?");
          // if (result) {
            // deleteJsonEntryInFileByIndex(jsonObj, fileName, indexInParentObject);
            // entryList.updateList();
            // entryList.selectRandom();
          // }
        // break;
      // default:
        // code block
    // } 
    // this.createForm();
	// }
  
    
// }

