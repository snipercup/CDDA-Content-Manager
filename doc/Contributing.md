# Contributing

If you know anything about Javascript or JSON Schemas you can contributibute to this project. If you don't know about these two topics but still would like to contribute, you can update the documentation on the tools.

To contribute, clone the repository to your desktop, make your changes and submit a pull request.


# Overall structure of this project:

The application is powered by electron. This is no more then a shell around the application and handles file handling amongst other things. The actual application is build up from HTML, Javascript and CSS. The main page shows application-wide settings like game folder and core/mods inclusion and an overview of the tools in the application. Each tool is considered its own project and there is little similarity between them. They are isolated from the rest and you can work on any of them or add a new tool. To add a new tool copy one of the other tools or just index.html and start building from there. To start building means you edit the html file and write the html/javascript needed for this tool. If the javascript becomes bulky or includes functions that may be shared amongst tools, put the code in a js file and include it in the .html file.
