# Dialog editor

This page describes how to use the dialog editor. It assumes you know how to write dialog as per [NPSs.md](https://github.com/CleverRaven/Cataclysm-DDA/blob/master/doc/NPCs.md) and you know how to edit the JSON files. This doc shows an overview followed by different topics. Each topics ends with an animated gif summarizing the topic.


## Contents:
- Getting started
- Using previous topic (moving between topics)
- Using collapsed
- Using visualise


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
1. Shows the basic properties of the NPC. Click on it to collapse to its ID.
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

You want to use this to get a quick overview of the topic and responses.
Difference between not collapsed and collapsed:

![image](https://i.imgur.com/u33BnHW.png?1)

As you can see, the responses collapsed to only their text value.
click a text response to expand it:

![image](https://i.imgur.com/CsjQgNo.png)

Clicking an expanded response will collapse it again.
Uncheckig collapsed will expand all the topics.

You can use this in combination with conditions (explained below) to create the following visualisation (using refugee_beggar4 this time because it has conditions):

![image](https://i.imgur.com/pPNS4gE.png?1)

Here is a gif summarising collapsing topics:

![image](https://i.imgur.com/aAQNdLV.gif)



## Using conditions

You want to use this to see how your topics turn out when conditions are applied. 
For this topic the NPC refugee_beggar4 will be used. This is what his dialog looks like, pay attention to his conditions:

![image](https://i.imgur.com/TjmcdIS.png?1)

On top, you see one condition that is used in this dialog. If you select another topic, there may be more conditions that will be shown there.

In the responses, the condition is used 4 times. The first two responses apply when the condition is NOT true. The last two responses apply when the condition is true.

To apply the conditions, first check conditions true:

![image](https://i.imgur.com/SsVio3a.png?1)

Now the conditions are applied. If there is more then 1 condition, all conditions are applied simultaniously and you can check and uncheck the conditions individually. 
Because the condition npc_has_effect: beggar_has_eaten is unchecked, the dialog will appear as though the condition is false. In this case, the dynamic_line is 'no' and topics 0 and 1 are shown.

If the condition is checked, the dialog will appear as though the condition is true:

![Imgur](https://i.imgur.com/S7wI7j7.png?1)

Here, the dynamic line shows 'yes' and the responses 2 and 3 are shown, just as you would see in-game. 
Use this in combination with collapsing to create a simple overview of the spoken lines.

This gif shows a summary of the functionality:

![Imgur](https://i.imgur.com/ezXGykE.gif)



## Using visualise

You want to use this to see a web-like view of what topics can be traversed by a player.
Here, the NPC scavenger_merc will be used.

The basic controls:

![Imgur](https://i.imgur.com/qfqbxP0.png)

Depth will determine how many branches of dialog will be shown. 0 will show the current topic and all parent/child topics. 1 will show the current topic, parent and child topics of the current topic and the parent/child topics of those topics as well. Increasing the depth will continue adding branches and loops. It's recommended to start with default depth of 0.

The button visualise will show a canvas with a graph of the topic and parent/child topics.
The graph below shows the topics of scavenger_merc at depth 0:

![Imgur](https://i.imgur.com/cGoar8x.png?1)

Description of the components:
- The center node shows the current topic
- The blue arrow points to a child of the current topic
- The orange arrow comes from a parent of the current topic
- Two arrows show a loop meaning the topic allows the user to return to the current topic.
- The arrows may not always be cosistent as their color depends on what topic you are viewing it from (it can be a parent in one context and a child in another).

Description of user interaction:
- You can drag nodes around to better visualise it
- You can doubleclick a topic to show its parent and child relationships. If nothing happens all relationships for that topic are already shown.

![Imgur](https://i.imgur.com/6qOa3qL.png?1)



Here is a gif summarizing the functionality:

![Image demoing dialog visualiser1](https://i.imgur.com/8SeqXgC.gif)





This concludes this document.
