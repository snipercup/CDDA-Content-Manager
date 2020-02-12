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
Changing properties allow you to bring changes to your cataclysm experience and can be very exciting. This chapter will go trough the types of changes you can make. Be sure to click 'save' when you are done with your changes. Not that some forms (but not all) display the properties in tabs like this:

![Imgur](https://i.imgur.com/2ipDkKD.png)

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


#### Basic single entry dropdown (string)
Some properties require a string just as described earlier. To help you pick valid values, these properties allow you to only select the values from the provided list:

![Imgur](https://i.imgur.com/XchE58O.png?1)

Just click on the list to make it drop down and select the entry you want. 
Some of these dropdown lists allow you to search for a value (but not all dropdown lists)

![Imgur](https://i.imgur.com/WdObN9f.png)

To do this, click the value to make the list drop down. Then click backspace to delete the current entry. Then start typing the value you want. If you come across a dropdown list that should support this feature but doesn't, please submit an issue.

Note that the dropdown is different from the 'change type' dropdown (which will be explained later)

![Imgur](https://i.imgur.com/dilaf9z.png?1)

