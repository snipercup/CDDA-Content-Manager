
//Some fields require looking up other items. The required lists are added here.
async function loadExtraDefinitions(schemas, entries){
  
  //Get all the schemas that have a default value for type. Only the generic defenitions schema does not have that.
	let retreivedItems = schemas.find({ "jsonObject.properties.type.default": { $exists: true } })
	let genericDefinitions = schemas.find({ "jsonObject.properties.type.default": { $exists: false } })[0];
  
  let schema, schemaJSONObj, type, IDListOfType;
  for (let i = 0, amountOfSchemas = retreivedItems.length; i < amountOfSchemas; i++) { //Loop over the actual schemas, not generaldefinition
    schema = retreivedItems[i];
    schemaJSONObj = schema.jsonObject;
    type = schemaJSONObj.properties.type.default; //Get the type from the default value of the type property in the schema
    schemaJSONObj.definitions = {...schemaJSONObj.definitions, ...genericDefinitions.jsonObject}; //Load the general properties as definitions
    IDListOfType = await getIDListOfTypeFromCollection(type, entries, true); //Get all the id's of every item of this type
    // Save the list as a definition to the schema, just in case there's a use for it.
    schemaJSONObj.definitions[type] = { "type": "string", "description": "The id of another entry", "enum": IDListOfType };
    if(schemaJSONObj.properties["copy-from"]){
      schemaJSONObj.properties["copy-from"].enum = IDListOfType; //If there's a copy-from then the id list of this type goes here.
    }
    // Get a list of looks like entries. This is a list of anything that has a symbol
    if(schemaJSONObj.properties["looks_like"]){
      let retreivedItems = entries.find({ "jsonObject.symbol": { $exists: true } })
      let collectedItems = [];
      let jsonElementID = "", jsonObject, jsonEntry, retrievedItem;
      for (let i = 0, amountOfJSONObjects = retreivedItems.length; i < amountOfJSONObjects; i++) {
        retrievedItem = retreivedItems[i];
        jsonObject = retrievedItem.jsonObject;
        collectedItems.push(jsonObject["id"]);
      }
      schemaJSONObj.properties["looks_like"].enum = collectedItems;
    }
    
    //The schema can include a request to add the list of id's of a certain type.
    if(schemaJSONObj.get_ids_of_type){
      let ids = schemaJSONObj.get_ids_of_type;
      let c, definition, oneOf, one, defType, displayKey;
      
      //Loop over all the requested types that the schema wants id's from. Usually only one
      for (let x = 0, idsLen = ids.length; x < idsLen; x++) {
        defType = ids[x].type;
        displayKey = ids[x].display_key;
        IDListOfType = await getTypeFromCollection(defType, entries, false, displayKey); //Get all the id's of every item of type ids[x]
        if(IDListOfType.length < 1){ 
          console.log("Tried to get list of ids for type \"" + ids[x] + "\" but got nothing")
          continue;
        }
        definition = schemaJSONObj.definitions[defType]; //Get the currently defined definition from the schema
        
        if (typeof definition["oneOf"] === 'undefined'){
          if(definition.type == "array") {
            c = definition.items.enum; //Save the list that's already defined in the schema.
            definition.items.enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the enumeration.
          } else { //assume string
            c = definition.enum; //Save the list that's already defined in the schema.
            definition.enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the enumeration.
          }
        } else {
          oneOf = definition["oneOf"];
          for (let i = 0, oneOfLen = oneOf.length; i < oneOfLen; i++) {
            one = oneOf[i];
            if(one.type == "array") {
              c = one.items.enum; //Save the list that's already defined in the schema.
              one.items.enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the enumeration.
            } else { //assume string
              c = one.enum; //Save the list that's already defined in the schema.
              one.enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the enumeration.
            }
          }
        }
        schemaJSONObj.definitions[defType] = definition;
      }
    }
    
    // if(type == "ammunition_type"){
      // IDListOfType = await getIDListOfTypeFromCollection("AMMO", entries); //Get all the id's of every item of type ammo
      // let c = schemaJSONObj.definitions["AMMO"].enum; //Save the list that's already defined in the ammuition type schema.
      // schemaJSONObj.definitions["AMMO"].enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the ammo property enumeration.
    // }
    
    // if(this.type == "MONSTER"){
      // IDListOfType = await getIDListOfTypeFromCollection("SPECIES", entries); //Get all the id's of every item of type ammo
      // let c = schemaJSONObj.definitions["SPECIES"].items.enum; //Save the list that's already defined in the ammuition type schema.
      // schemaJSONObj.definitions["SPECIES"].items.enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the ammo property enumeration.
    // }
    
    // if(this.type == "monster_attack"){
      // IDListOfType = await getIDListOfTypeFromCollection("effect_type", entries); //Get all the id's of every item of type ammo
      // let c = schemaJSONObj.definitions["effect_type"].enum; //Save the list that's already defined in the ammuition type schema.
      // schemaJSONObj.definitions["effect_type"].enum = c.concat(IDListOfType.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the ammo property enumeration.
    // }
  }
}