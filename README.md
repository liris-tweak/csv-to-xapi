# csv-to-xapi-lab
Assisting in uploading a csv trace file onto an LRS as statements. This tool uses the web application `xapi-lab` (see [https://github.com/adlnet/xapi-lab](https://github.com/adlnet/xapi-lab)).

Refer to the [xAPI Spec](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md) when using this tool to better understand how all the components work together.

### Features

You can to bind some fields of your csv file to a statement generator, in order to send a trace to an LRS. You can also set constant values to your statements.

You can also define a column of the csv file as the column which value represents a *template* of your statements. If so, each existing value in the chosen column has to be mapped with the statement generator.

### Links

 * [xAPI Standard Vocabulary](http://xapi.vocab.pub/datasets/adl/)
 * [Communities of pratice](https://www.adlnet.gov/adl-research/performance-tracking-analysis/experience-api/xapi-community-of-practice-cop/)
 * [Serious Game Community of practice vocabulary](http://xapi.e-ucm.es/vocab/seriousgames)


### Installation

Run `git clone https://github.com/liris-tweak/csv-to-xapi.git`

### Use

Host this project on your server, then launch index.html.

Once the web app launched :

 * In the first box you can

     + Choose your trace file (csv)
     + Save your import configuration to a file / load a previously saved configuration
     + Preview the table and customize column headers


 * Once a CSV file is loaded, in the second box, you have two choices

     + If all the rows have roughly the same structure, you can keep the default option ;
       you will then have to describe a single template for all rows.
     + If the rows have different structure/semantics depending on one column,
       you should select this column as the "template column".
       You will then be able to define as many templates as the different values
       present in this column.
     Then click on the small *edit* link between each template to edit it in the third box.
     + The four bars for each template represent its level of completeness.


 * The third box allows you to edit one of the template from the second box.

     + You can also copy it from another template.
     + For each xAPI field, you can either use
       - a constant value, by typing it directly (e.g. ``john@doe.com``), or
       - a value from a CSV column,
         by typing the column name between double curly braces (e.g. ``{{email}}``).

     + For more complex use cases, the double-curly-braces notation accepts options,
       using the syntax ``{{*COLUMN_NAME* options}}``. Available options are:
       - --prefix *PREFIX_VALUE* : Add a prefix before the column value
       - --suffix *SUFFIX_VALUE* : Add suffix after the column value
       - --toNumber              : Formatted as a number (rather than a text string)
     + The *`Generate JSON Statement`* button will force apply the changes in the third box to the current template.


 * At the bottom of the third box, you can preview the generated statement in JSON.
    + The *`Generate statement from JSON`* button will force apply the changes `FROM` the editor box `TO` the template. This feature is designed for the users who know how to edit a correct statement JSON.



 * In the bottom box, you can setup LRS information (URL, username, password)
   + The *Upload Trace* button will... well, upload the trace to the LRS.


 *  When you upload the trace to the LRS, the application will ask you a *registration ID*, and propose to generate one.
   The registration ID is an attribute of each xAPI statement. When you query the LRS, you can filter statements by their registration ID (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#213-get-statements).

   Actually, this is the only way to organize your statements in an LRS, so we suggest that you use a fresh registration ID for each trace that you upload in an LRS, and that you keep a list of the registration IDs of your traces.

   Note also that registrations ID are required by the xAPI specification to be UUIDs. The application can generate an UUID for you using the standard UUID4 algorithm (https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29). The application generate such UUID using the following project [https://github.com/broofa/node-uuid](https://github.com/broofa/node-uuid).

## License
   Copyright &copy;2016 Advanced Distributed Learning

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
