# Content Editor

This guide describes how to use the content editor.

# Opening the content editor
If you just opened the content manager, you have to navigate to the content editor.

![Imgur](https://i.imgur.com/bVFczd5.png?2)


- Set the folder of your cataclysm game directory by clicking the change button and selecting the folder of your CDDA folder (where cataclysm-tiles.exe on windows is.)
- Select if you want to include only core content or also mods. You can also choose to include only mod data. Choosing one or both will affect load times (especially if you have a lot of mods)
- Click 'content manager' to open the content manager.


# Basic browsing
Once you clicked the content manager and it is done loading, you can select a filter from the list.

![Imgur](https://i.imgur.com/p6ogTQZ.png?1)

Selecting a filter will show a list of items that fit into that filter:

![Imgur](https://i.imgur.com/fG5q2RK.png?1)

The list contains whatever the filter says, so these may be monsters, items, terrain etc.
By default the text that is displayed is the ID of the json entry.

# Basic editing - save, duplicate and delete
Clicking on an item in the list will allow you to edit it.

![Imgur](https://i.imgur.com/1MSTSOg.png?1)

Way up top is the filename from which this entry is loaded. 
Below that are the following 3 buttons:

### Save
Clicking save will write whatever is on the form at that time to the file, overriding the entry that was loaded. To be specific, if it was the third entry in the file, the third entry will be overwritten with the current data. It doen't have to be the third, it will override whatever position it was in at the time.

### Duplicate
This is currently the way to add new items. Clicking duplicate will copy the current entry and add it to the file displayed on top. The ID of the entry will get _copy next to it. You can then change the ID to anything you want. Only change the id of the newly added item. Changing the id of already existing items that are used in-game a bad idea.

### Delete
Clicking this will delete the entry from the file. You will be prompted to be sure you really want to delete it. Like with the save button, it will delete the third entry int he file if it was the third entrywhen it was loaded. So even if you change the ID and then click delete, it will still delete the same entry it was before the ID change.


# Basic editing - changing, adding and deleting properties

### Adding and deleting properties
This is pretty easy, for the main json entry, just click on properties and select what properties you want:

![Imgur](https://i.imgur.com/3fPSpJk.png?1)

In this list you can enable or disable the properties for this entry. After doing so, click save to write your changes to the file. Note that this list will only show properties appropriate for the type you are currently editing. For example, mod_location property will not show up in the MONSTER form. If you think a property is missing from the list, you can add it by typing it at the bottom of the list and clicking 'add'. Do this at your own risk. If you think a property is missing from the list and should be there, please submit an issue.

Some properties have their own properties. you can edit them in the same way as the main json entry:

![Imgur](https://i.imgur.com/jhndngo.png?1)

In this example a property called use_action has a list of properties you can add and remove. 

Alternatively, you can edit the json directly by clicking 'json'

![Imgur](https://i.imgur.com/FvpYxEb.png?1)

Do this at your own risk.

### Changing properties
Changing properties allow you to bring changes to your cataclysm experience and can be very exciting. This chapter will go trough the types of changes you can make. Be sure to click 'save' when you are done with your changes. Note that some forms (but not all) display the properties in tabs like this:

![Imgur](https://i.imgur.com/2ipDkKD.png?1)

Look in these tabs (if any) if you are having trouble finding a particular property.

#### Basic text (string)
Changing basic text works much in the same way as any text editor.

![Imgur](https://i.imgur.com/uLo4jec.png?1)

Type the text you want to put into this property. Note that some properties like weight and volume may look like a number but is actually a string and is edited in the same way:

![Imgur](https://i.imgur.com/yUp7enE.png?1)

The description of the property should help you put in the right value.

#### Basic number (integer)
Works much like text, but will only accept a whole number

![Imgur](https://i.imgur.com/Ju0RF6d.png?1)


#### Decimal number (double or float)
This will accept numbers with a decimal, like 0.5:

![Imgur](https://i.imgur.com/gLQJQQh.png?1)

If you put in a whole number without decimal and click save, it will add .0 to your number automatically and this will show up the next time you load this entry.


#### True/false (boolean)
Allows you to set it to true or false. If it is checked it is true. if it is unchecked it is false.

![Imgur](https://i.imgur.com/YVrwvEB.png?1)

#### Single entry dropdown (string)
Some properties require a string just as described earlier. To help you pick valid values, these properties allow you to only select the values from the provided list:

![Imgur](https://i.imgur.com/XchE58O.png?1)

Just click on the list to make it drop down and select the entry you want. 
Some of these dropdown lists allow you to search for a value (but not all dropdown lists)

![Imgur](https://i.imgur.com/WdObN9f.png)

To do this, click the value to make the list drop down. Then click backspace to delete the current entry. Then start typing the value you want (sometimes you have to hit backspace once more before you can start typing). If you come across a dropdown list that should support this feature but doesn't, please submit an issue.

Note that the dropdown is different from the 'change type' dropdown (which will be explained later)

![Imgur](https://i.imgur.com/dilaf9z.png?1)


#### Multi entry dropdown (array)
This is used to edit a list of words (strings).

![Imgur](https://i.imgur.com/Lha70Ac.png?1)

Click next to an existing entry to make the list drop-down. You can then add as many from the list as you want by clicking them one-by-one. Like with the single entry dropdown, you can type to search for the entry you want:

![Imgur](https://i.imgur.com/QynFw5O.png?1)

To delete from this list, click the little x next to an entry.


#### Multi value list (map, nested array)
This may come in different forms, depending on the property. This example shows a nicely formatted list but it may not always be as neat:

![Imgur](https://i.imgur.com/dnsdmV4.png?1)

This is a list where each entry consists of a 'single entry dropdown' and a 'basic number'. You can change them as described earlier. To delete an entry, click the trashcan (you will be prompted). To add one, click '+vitamin'.

Here is an example that works under the same principle but has a different format:

![Imgur](https://i.imgur.com/dqWuycM.png?1)


#### Change format dropdown
This control allows you to change the format of the property. This means you can change it from a single text to a list, or from a list to an object with properties:

![Imgur](https://i.imgur.com/czjYmGI.png?1)

Currently this property called use_action is in the 'string format'. These names are only to convey the format of the property and mayt be different from property to property. For example the basic property called 'name' has eighter 'old format' or 'new format'

![Imgur](https://i.imgur.com/j1Dzh0t.png?1)

Now to change the format, simply select the format you want. In this example, I change from 'string format' to 'list format' and now I have  a list:

![Imgur](https://i.imgur.com/ge8DL3p.png)

Note that the items in the list can also be a different format:

![Imgur](https://i.imgur.com/mTAhFdx.png)

Now I changed the format of that entry to 'object format' so now use_action is a list with one 'object format' and one 'string format':

![Imgur](https://i.imgur.com/sGg4vVP.png?1)

What you put in depends on what you need. Different properties may have different formats. This tool attempts to help you correctly edit the json but be sure to read up on the documentation in the main repository for CDDA to get a sense of the properties you can use. 


# Troubleshooting
This is especially important in the early days of development where bugs come up and information is missing. This section explains some bugs and what to do with them

### Missing definition
This is where an entry has a property that is not defined by the content editor. It looks like this:

![Imgur](https://i.imgur.com/zRFj0Co.png?1)

Here is a property called 'relative' that has 2 properties called 'volume' and 'weight'. The content editor does not know these properties so it tries its best to fill in the blanks. It has determined that 'relative' should be an object and 'volume' and 'weight' should be a string. 

What to do: submit a bug report. Alternatively you can try to use the controls to edit the property the best you can but it is far from optimal. 

### Property is empty but should have a value
This may happen when the value is supposed to come from a list, but the value is not in the list. It looks like this:

![Imgur](https://i.imgur.com/rS8MKl2.png?1)

Here, it should display a flag, but the flag is missing from the definition so you can't select or display it.

What to do: Submit a bug report. Alternatively, this could mean that the entry has a value that is not valid. Please check that the value that is supposed to go there is a valid entry. By hovering over the item in the list you can peak at the json data as it was loaded from the disk:

![Imgur](https://i.imgur.com/Oyj4bqy.png?1)


# Advanced - managing filters
Filters are important to help you get the right entities to the surface. Filters are defined in a filters file in "\resources\app\data\json\collectionList\filters.json" so if you are running from the compiled version it could be located at "C:\Users\User\Downloads\cdda-content-manager-win32-x64-0.5.8\resources\app\data\json\collectionList\filters.json"

The contents of filters.json is not much different then the json of the game:

![Imgur](https://i.imgur.com/xkNj4Q5.png)

These are the properties for a filter:
```
		"type": "filter",                                               //should be filter. there are no other types right now but there may be in the future
		"name": "all_ammunition_type",                                  //an arbitrary name, serves no purpose currently
		"display_name": "Type: ammunition_type",                        //What it will be displayed as in the filter drop-down
		"display_key": "id",                                            //The property of the entry that will be displayed when the filter is applied. For example 'id', 'abstract', 'name' and 'result' may be interesting properties to note here
		"filter": { "jsonObject.type": { "$eq": "ammunition_type" } }   //The filter applied to the contents of the cataclysm data folder.
```

 The formatting for the query is defined here: https://github.com/techfort/LokiJS/wiki/Query-Examples. a more advanced example from the filters.json:
 
```
	{
		"type": "filter",
		"name": "all_mutation",
		"display_name": "Mutations",
		"display_key": "id",
		"filter": { "$and": [ 
        { "jsonObject.type": { "$eq": "mutation" } }, 
        { "fileName": { "$containsNone": "obsolete" } },
        { "$or": [
            { "jsonObject.valid": { "$eq": true } },
            { "jsonObject.valid": { "$exists": false } },
            { "jsonObject.threshold": { "$exists": true } }
        ] }
    ] }
	},
```

The "jsonObject" is the entity that holds the properties of each json entrie like 'id', 'name', 'valid', 'type', 'threshold' etc. 
The "fileName" is the absolute path to the file from which the json entry is loaded. In the above example all entries loaded from files that have 'obsolete' in the filename or the path to the file are excluded.
The third and last alternative to 'jsonObject' and 'filename' is 'indexInParentObject'. this could allow you to load only the entries that are in the third place in the json file for example (like this - "indexInParentObject": { "$eq": 3 }) but that may not be very useful.

