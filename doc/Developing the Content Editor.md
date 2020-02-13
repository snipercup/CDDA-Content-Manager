# Developing the Content Editor

This guide describes how to develop the content editor. For using the content editor, please see [Using the Content Editor](https://github.com/snipercup/CDDA-Content-Manager/blob/master/doc/Using%20the%20Content%20Editor.md)


## Introduction

Most of the work that goes into the content manager is done here: https://github.com/snipercup/CDDA-Content-Manager/tree/master/data/json/schemas. The schemas provide a definition of the forms for each type of json entry. The definition of the schemas can be found here: https://json-schema.org/. In addition, some extra schema-properties are defined by the form manager called [json-editor](https://github.com/json-editor/json-editor).

There are two special schemas that are not used directly by the form manager:
- generaldefinitions - these are definitions shared by all schemas but may not apply to every schema
- generalproperties - These properties are loaded into specific schemas and become one with the schema.

Other then the schemas there isn't really much to develop regarding the content Editor. Some minor changes may be applied in [schema-styles.css](https://github.com/snipercup/CDDA-Content-Manager/blob/master/src/style/schema-styles.css) and [schemas.js](https://github.com/snipercup/CDDA-Content-Manager/blob/master/src/schemas.js). 

Some key concepts that will be explained here are: 
- Enumerated values
- PropertyOrder
- References
