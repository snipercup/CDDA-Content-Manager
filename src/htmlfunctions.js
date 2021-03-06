//From https://stackoverflow.com/questions/9066792/get-table-parent-of-an-element
function getNearestTableAncestor(htmlElementNode) {
    while (htmlElementNode) {
        htmlElementNode = htmlElementNode.parentNode;
        if (htmlElementNode) {
			if (htmlElementNode.tagName.toLowerCase() === 'table') {
				return htmlElementNode;
			}
        }
    }
    return undefined;
}    

function createElement (tagName, id, attrs, events, innerhtml) {
  attrs = Object.assign(attrs || {}, { id: id });
  events = Object.assign(events || {});
  
  var el = document.createElement(tagName);
  Object.keys(attrs).forEach((key) => {
    if (attrs [key] !== undefined) {
      el.setAttribute(key, attrs [key]);
    }
  });
  
  Object.keys(events).forEach((key) => {
    if (typeof events [key] === 'function') {
      el.addEventListener(key, events [key]);
    }
  });

  if(innerhtml){
    el.innerHTML = innerhtml;
  }

  return el;
}


//When an user doubleclicks on an entry in one of the lists.
function moveEntryBetweenLists(entryItem, sourceList, targetList, ondblclickFunction){
	//Remove the item from the addedEntryList and add it to the availableEntryList
	let newOption = entryItem.cloneNode(true);
	newOption.ondblclick = ondblclickFunction;
	sourceList.removeChild(entryItem);
	targetList.appendChild(newOption);
}

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

function sortSelect(selElem) {
    var tmpAry = new Array();
    for (var i=0;i<selElem.options.length;i++) {
        tmpAry[i] = new Array();
        tmpAry[i][0] = selElem.options[i].text;
        tmpAry[i][1] = selElem.options[i].value;
        tmpAry[i][2] = selElem.options[i].title;
    }
    tmpAry.sort();
    while (selElem.options.length > 0) {
        selElem.options[0] = null;
    }
    for (var i=0;i<tmpAry.length;i++) {
        var op = new Option(tmpAry[i][0], tmpAry[i][1]);
		op.title = tmpAry[i][2];
        selElem.options[i] = op;
    }
    return;
}