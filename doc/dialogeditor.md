# Dialog editor

This page describes how to use the dialog editor. It assumes you know how to write dialog as per [NPSs.md](https://github.com/CleverRaven/Cataclysm-DDA/blob/master/doc/NPCs.md) and you know how to edit the JSON files.


## Contents:
- Getting started



## Getting started:

- Follow the installation instructions on the [main page](https://github.com/snipercup/CDDA-Content-Manager)
- Click on dialog editor:

![Image](https://i.imgur.com/LA9kF3J.png?1)


It may take a moment to load in all the spells. You should see this window:

![Image](https://i.imgur.com/YxbfG65.png?1)


Brief overview of the interface:
- To the left you see a list of NPC's
- To the right you see the window where the dialog will appear when you select a NPC. 
- There are some tools in the right part of the window that will be explained later.

Select a NPC.For this tutorial a simple one will be used named scavenger_hunter

![Image](https://i.imgur.com/x8FJxYL.png?1)

Overview of the interface:
1. Shows the basic properties of the NPC
2. Shows the filename where the NPC is in so you know you are looking at the right file.
3. Previous topic: this is a link you can click that takes you to the previous topic you came from. If this is the first topic you selected, it does nothing
4. Collapsed: It will collapse the responses to only show the lines you can select as a player
5. Depth: 0 and visualise: They go together to visualise the dialog, this will be explained later.
6. Conditions true: Checking this box will display the topic as though the conditions apply (see 7)
7. U_is_wearing: badge_marshal: This is a condition that is used in a dialog. It just so happens to be u_is_wearing this time but it can be any condition and any number of conditions as long as the condition is used in the dialog. If the condition is unchecked, the dialog is shown as though the condition is false. If you check the condition, the dialog is shown as though the condition is true.
8. The dialog itself. You can click on the text in the responses to collapse that line to only show the text. You can click on topic in the responses to change to the topic it is referring to.

This concludes the basic functionality. This should help you write the dialog for the NPC and see how it will appear to the player as well as what topics it leads to. More detailed instructions are shown below.


## Using previous topic (moving between topics)
You want to use this to switch between topics you are working on. Lets take the dialog of scavenger_hunter:
![Image](https://i.imgur.com/gFDETXR.png?1)

You know you are at his first topic because the id, previous topic and chat are all the same.
Now navigate to the first response topic by clicking the response topic:
![image](https://i.imgur.com/hV93LEe.png)

You are now at the topic you clicked:

![image](https://i.imgur.com/wG9lEeI.png?1)

The ID of the current topic has changed to the topic ID you just clicked and the previous topic link stayed the same this time because it was the first topic.
Now click the previous topic:

![image](https://i.imgur.com/nSHesBJ.png?1)

The previous topic is now the topic you came from and the current topic is the first topic you saw when clicking a NPC. 
You can use this to click trough differen topics and go back and forth.
It only shows what topic you came from last time, it does not show a trail of topics you followed to get here.

Here is a gif that summarises navigating:
![image](https://i.imgur.com/2aXLVVL.gif)


## Using collapsed


## Using visualise


## Using conditions


