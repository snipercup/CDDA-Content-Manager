
//Some fields require looking up other items. The required lists are added here.
//schemas = collection of json schemas. entries = collection of all entries of the game
async function loadExtraDefinitions(schemas, entries){
  
  //Get all the schemas that have a default value for type. Only the generic defenitions schema does not have that.
	let retreivedItems = schemas.find({ "jsonObject.properties.type.default": { $exists: true } });
	let genericProperties = schemas.findOne({ "jsonObject.generalProperties": { $eq: true } });
	let genericDefinitions = schemas.findOne({ "jsonObject.generalDefinitions": { $eq: true } });
  
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
    
    //The schema can include a request include properties from generalproperties.json.
    //In contrast to generalDefinitions, these become properties of the schema itself.
    if(schemaJSONObj.include_properties){
      let includes = schemaJSONObj.include_properties;
      let property, propertyOrder, genericProperty;
      
      //Loop over the properties and add them to the schema
      for (let x = 0, gLen = includes.length; x < gLen; x++) {
        property = includes[x].property;
        propertyOrder = includes[x].propertyOrder;
        
        if(property){
          genericProperty = genericProperties.jsonObject[property]; //Get the property from the generic property list
          if(genericProperty){
            schemaJSONObj.properties[property] = genericProperty; //Add it to the schema
            if(propertyOrder){
              schemaJSONObj.properties[property].propertyOrder = propertyOrder; //set the property order if it was noted.
            }
          }
        }
      }
    }
    
    schemaJSONObj = await recursiveSetProperties(schemaJSONObj, entries, schemaJSONObj);
  }
}



async function recursiveSetProperties(schemaDefinition, entries, currentSchema){
  let jsonString = "", keys, key, value, c, schemakey, schemakeys, objectKey, genericDefinitions, filteredEnum;
  
  if(typeof schemaDefinition === 'object' && schemaDefinition !== null){
    if(Array.isArray(schemaDefinition)){ //It's an array
      for(let x = 0, arrLen = schemaDefinition.length; x < arrLen; x++){ //Loop over every item in the array
        schemaDefinition[x] = await recursiveSetProperties(schemaDefinition[x], entries, currentSchema);
      }
    } else { //It's an object
      keys = Object.keys(schemaDefinition);
      for(let y = 0, keyLen = keys.length; y < keyLen; y++){ //Loop over every key in the entry
        key = keys[y];
        value = schemaDefinition[key];
        if(key == "filteredEnum"){
            filteredEnum = await getFilteredListFromCollection(value.filter, entries, true, value.display_key)
            if(schemaDefinition.enum){ //If the enum property is there, append to it. otherwise, set it.
              c = schemaDefinition.enum; //Save the list that's already defined in the schema.
              schemaDefinition.enum = c.concat(filteredEnum.filter((item) => c.indexOf(item) < 0)); //Merge the two lists and put it back into the enumeration.
            } else {
              schemaDefinition.enum = filteredEnum;
            }
        }
        if(key == "includeDefinition"){
          //Copy the contents of the definition into this object. This is a workaround since the jsonEditor forgets its schema when you reference another property from a property that is also referenced elsewhere.
          genericDefinitions = schemas.findOne({ "jsonObject.generalDefinitions": { $eq: true } });
          schemakey = genericDefinitions.jsonObject[value];
          if(!schemakey) { //If generaldefinitions does not have the definition, look inside the current schema
            schemakey = currentSchema.definitions[value];
          }
          if(schemakey) {
            schemakeys = Object.keys(schemakey); //take all of the keys in the requested object
            for(let n = 0, schemakeysLen = schemakeys.length; n < schemakeysLen; n++){ //Loop over every key in the entry
                objectKey = schemakeys[n];
                if(!schemaDefinition[objectKey]){ //If the key does not already exist, add it
                  schemaDefinition[objectKey] = schemakey[objectKey];
                }
            }
          }
        }
        if(typeof value === 'object' && value !== null){
          schemaDefinition[key] = await recursiveSetProperties(schemaDefinition[key], entries, currentSchema);
        }
      }
    }
  }
  return schemaDefinition;
}