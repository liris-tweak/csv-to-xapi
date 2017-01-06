# csv-to-xapi-lab
Assisting in uploading a csv trace file onto an LRS as statements. This tool uses the web application `xapi-lab` (see [https://github.com/adlnet/xapi-lab](https://github.com/adlnet/xapi-lab)).

Refer to the [xAPI Spec](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md) when using this tool to better understand how all the components work together.

### features

You can to bind some fields of your csv file to a statement generator, in order to send a trace to an LRS. You c an also set constant values to your statements.

You can also define a column of the csv file as the column which value represents the *verb* of your statements. If so, each existing value in the chosen column has to be mapped with the statement generator.

### Installation

Run `git clone https://github.com/liris-tweak/csv-to-xapi.git`

### Use

Host this project on your server, then launch index.html.

Once the web app launched :

 * Trace File (csv) Configuration
  * Choose your trace file (csv format)
  * Optionnal: You can save / use a configuration file to reuse your work
  * Set the column headers
 * Verb Column Definition
  * Choose a column which will define every verb you have in your trace.
If you do not have such a column, still you can create a default verb.
  * *Parse JSON* button will force apply the statement map of your current verb.
  * *Upload Trace* Well, it opens a modal ... to upload your trace.
 * Statement Mapping
  * You can set constant values in your statement fields or bind them to your csv file.
  * You can copy statement mapping from another verb.
  * Binding follows the format : `{{*COLUMN_NAME* options}}`. Options are :


    --prefix *PREFIX_VALUE* : Add prefix to value
    --suffix *SUFFIX_VALUE* : Add suffix to value
    --toNumber              : Force number format for value

 * LRS Basic Auth Setup
  * Here you define your LRS endpoint + username + password


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
