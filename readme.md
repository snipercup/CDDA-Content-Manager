# Cataclysm content manager


## Features:
- [Dialog editor](https://github.com/snipercup/CDDA-Content-Manager/blob/master/doc/dialogeditor.md) (well it only allows viewing atm)
- [Content editor](https://github.com/snipercup/CDDA-Content-Manager/blob/master/doc/Content%20Editor.md)
- [Mod summary](https://discourse.cataclysmdda.org/t/tool-mod-summary/22204)

## Installation:

#### For windows users:
- Go to [releases](https://github.com/snipercup/CDDA-Content-Manager/releases) and download the latest release
- extract the zip file and run the .exe file. There is no installation.
- first step is to select your cataclysm game folder. After that you're ready to go.

#### Windows developer environment:
- download a copy of the source
- download and install [node.js](https://nodejs.org/en/download/) (it includes npm)
- scroll to the bottom of [this](https://github.com/electron/electron/blob/master/docs/tutorial/first-app.md) page. 
- Execute the commands you see there (npm install and npm start).

#### Linux:
- download a copy of the source
- download and install [node.js](https://nodejs.org/en/download/) (it includes npm)
- scroll to the bottom of [this](https://github.com/electron/electron/blob/master/docs/tutorial/first-app.md) page. 
- Execute the commands you see there (npm install and npm start).

## Using the content manager:

Please see the [quick start guide](https://github.com/snipercup/CDDA-Content-Manager/blob/master/doc/quick%20start%20guide.md) to get started.

## Alternative projects:

- See https://github.com/KorGgenT/cdda-item-creator for an alternative item creator.
- See https://github.com/I-am-Erk/CDDA-Tilesets for a tileset for Cataclysm you can contribute to.

## Demo:

#### Demo of the content editor:
Basic editing of fields. Pressing save will save the json to the file, linted. Pressing delete will delete the entry from the file. Pressing duplicate will create a new entry for you to edit. 
![Image demoing content editor](https://i.imgur.com/UzaGa7T.gif)

Simple editing of arrays, lookup field for copy-from, only the properties you add are visible and you can add more.
![Content Editor Demo 2](https://i.imgur.com/rVSDTnI.gif)


#### Demo of the dialog editor:
![Image demoing dialog editor](https://i.imgur.com/Be7ab2i.gif)

The visualiser. The blue arrow means it's a child. The yellow arrow means it's a parent. The direction means you can go from one topic to another topic. Double clicking an element will fetch all parents and children and connect them to the appropriate nodes.

![Image demoing dialog visualiser1](https://i.imgur.com/8SeqXgC.gif)

Increasing the depth before clicking visualise will get the node's children/parents, and the children's children/parents for each level in depth.
![Image demoing dialog visualiser](https://i.imgur.com/x8AB5M8.gif)
