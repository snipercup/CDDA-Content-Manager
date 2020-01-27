
//Some fields require looking up other items. The required lists are added here.
//schemas = collection of json schemas. entries = collection of all entries of the game
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
    
    //The schema can include a request to move a enum property from a definition to a certain property.
    //This is a workaround because the reference in a nested array fails when the editor is created again.
    if(schemaJSONObj.get_enums_from_definition){
      let getEnums = schemaJSONObj.get_enums_from_definition;
      let from, to, enumProperty, pathArray, traverseStep, traverseProperty, pathInt, c;
      
      //Loop over the defined path and set the property in the end
      for (let x = 0, gLen = getEnums.length; x < gLen; x++) {
        from = schemaJSONObj.definitions[getEnums[x].from];
        to = getEnums[x].to;
        enumProperty = from["enum"];
        pathArray = to.split(".")
        
        traverseProperty = schemaJSONObj.properties
        for (let i = 0, pathLen = pathArray.length; i < pathLen; i++) {
          traverseStep = pathArray[i];
          pathInt = parseInt(traverseStep); //Sometimes it can be items.0 and we want to get the 0 to get the correct property
          if(isNaN(pathInt)){
            traverseProperty = traverseProperty[traverseStep];
          } else {
            traverseProperty = traverseProperty[pathInt];
          }
          if(i == pathLen-1){ //When at the end of the path, set the enum for the property
            if(traverseProperty.enum){ //If the enum property is there, append to it. otherwise, set it.
              c = traverseProperty.enum; //Save the list that's already defined in the schema.
              traverseProperty.enum = c.concat(enumProperty.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the enumeration.
            } else {
              traverseProperty.enum = enumProperty;
            }
          }
        }
      }
    }
    
    schemaJSONObj = await recursiveSetFilteredEnums(schemaJSONObj, entries);
  }
}



async function recursiveSetFilteredEnums(schemaDefinition, entries){
  let jsonString = "", keys, key, value, tempstring = "", arrItem, addSpace, schemakey, optionsCopy, optionsKeys, isNumber;
  
  if(typeof schemaDefinition === 'object' && schemaDefinition !== null){
    if(Array.isArray(schemaDefinition)){ //It's an array
      for(let x = 0, arrLen = schemaDefinition.length; x < arrLen; x++){ //Loop over every item in the array
        schemaDefinition[x] = await recursiveSetFilteredEnums(schemaDefinition[x], entries);
      }
    } else { //It's an object
      keys = Object.keys(schemaDefinition);
      for(let y = 0, keyLen = keys.length; y < keyLen; y++){ //Loop over every key in the entry
        key = keys[y];
        value = schemaDefinition[key];
        if(key == "filteredEnum"){
           //Create enum property
           schemaDefinition.enum = await getFilteredListFromCollection(schemaDefinition[key].filter, entries, true, schemaDefinition[key].display_key)
        }
        if(typeof value === 'object' && value !== null){
          schemaDefinition[key] = await recursiveSetFilteredEnums(schemaDefinition[key], entries);
        }
      }
    }
  }
  return schemaDefinition;
}