
//Toggles visiblity of all elements that do not have the given classname
function setElementVisibilityExceptId(Id, htmlElements, visible){
	let htmlElement;
	for (y = 0; y < htmlElements.length; y++) {
		htmlElement = htmlElements[y];
		if(htmlElement.id != Id){
			//The element's Id did not match the given Id
			if (visible) {
				htmlElement.style.display = "";	//The element should be visible
			} else {
				htmlElement.style.display = "none"; //The element should be hidden
			}
		} else {
			htmlElement.style.display = ""; //The element that has the Id should always be visible
		}
	}
}

//Get all siblings of the provided classname
function getHTMLSiblingsByClassName(className, htmlElement){
	let siblings = htmlElement.parentElement.childNodes;
	let sibling;
	let siblingsList = [];
	for (y = 0; y < siblings.length; y++) {
		sibling = siblings[y];
		if(sibling.id == className){
			siblingsList.push(sibling);
		}
	}
	return siblingsList;
}