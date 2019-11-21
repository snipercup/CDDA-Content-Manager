# Cataclysm content manager


## Features:
- Dialog editor (well it only allows viewing atm)
- Spells viewer (only mods folder)

## Installation:

### Windows binary:
- Go to [releases](https://github.com/snipercup/CDDA-Content-Manager/releases) and download the latest release
- extract the zip file and run the .exe file. There is no installation.
- first step is to select your cataclysm game folder. After that you're ready to go.

### Windows developer environment:
- download a copy of the source
- download and install [node.js](https://nodejs.org/en/download/) (it includes npm)
- scroll to the bottom of [this](https://github.com/electron/electron/blob/master/docs/tutorial/first-app.md) page. 
- Execute the commands you see there (npm install and npm start).

### Linux:
- download a copy of the source
- download and install [node.js](https://nodejs.org/en/download/) (it includes npm)
- scroll to the bottom of [this](https://github.com/electron/electron/blob/master/docs/tutorial/first-app.md) page. 
- Execute the commands you see there (npm install and npm start).

#### Demo of the dialog editor:
![Image demoing dialog editor](https://i.imgur.com/Be7ab2i.gif)

The visualiser. The blue arrow means it's a child. The yellow arrow means it's a parent. The direction means you can go from one topic to another topic. Double clicking an element will fetch all parents and children and connect them to the appropriate nodes.
![Image demoing dialog visualiser1](https://i.imgur.com/egcny23.gif)

Increasing the depth before clicking visualise will get the node's children/parents, and the children's children/parents for each level in depth.
![Image demoing dialog visualiser](https://i.imgur.com/x8AB5M8.gif)
