//var global_regexp_for_csv_parsing = /{{([\w]+)?\s?(column\.\[(.+)\])?}}/g;

/**-----------------------------------------------------------------------------
// MARK: Global Vars
**/

// Statement parsing regex. Used to set the values of a statement from a csv file.
var global_regexp_for_csv_parsing = /{{([\w]+)?\s?(.*)}}/g;
var options_regexp_for_csv_parsing = /--[\w]*\s?[^\s]*/g;
// Name of the headers of each columns of the csv file.
var _column_names_ = [];
// The csv file parsed.
var _preview_data_ = [];
// List of the verbs
var _verbs_ = [];
// Index of the column chosen to set the verb of each statement.
var _verb_column_position_ = -1;
// The statements maps.
var _statements_ = [];
// The current statement map, according to a verb.
var _current_statement_ = {};
// The different progress bars of each verb.
var _DOM_verb_list_div_ = [];
// The required value field list.
var _required_values_list_ = [{
    'set': false,
    'field': [
      'actor.mbox', 'actor.mboxsha', 'actor.openid', 'actor.account'
    ]
  }, {
    'set': false,
    'field': [
      'verb.id'
    ]
  }];
// The recommanded value field list
var _recommanded_values_list_ = [{
    'set': false,
    'field': [
      'timestamp'
    ]
  }, {
    'set': false,
    'field': [
      'verb.display'
    ]
  }];

/**-----------------------------------------------------------------------------
// MARK: Upload CSV
**/

/**
 * Click on 'upload-btn'.
 * Parse the first file selected.
 * When done, fill the preview table.
 * Calls `create_header_inputs` & `update_verb_column_select.
 **/
$('#upload-btn').change(function(e) {
  Papa.parse($('#upload-btn')[0].files[0], {
    skipEmptyLines: true,
    preview: 5,
    worker: true,
    delimiter: $('#separator-select').val(),
    chunk: function(res){
      _preview_data_ = res.data;
      $('#preview-table tr').remove();
      // Insert title
      var html = '';
      html += '<tr>';
      for (var j = 0; j < _preview_data_[0].length; j++) {
        _column_names_[j] = $('#use-first-line-checkbox')[0].checked ? _preview_data_[0][j] : 'column' + j;
        html += '<th>' + _column_names_[j] + '</th>';
      }
      html += '</tr>';
      // Insert data
      $('#preview-table').append(html);
      for (var i = 0; i < 3; i++) {
        html = '';
        html += '<tr>';
        for (j = 0; j < _preview_data_[i].length; j++) {
          html += '<td>' + _preview_data_[i][j] + '</td>';
        }
        html += '</tr>';
        $('#preview-table tr').last().after(html);
      }
      //create input for header definition
      create_header_inputs(_preview_data_[0].length);
      update_verb_column_select();
    },
    complete: function() {}
  });
});


/**-----------------------------------------------------------------------------
// MARK: Column Header Definition
**/

/**
 * Hide the 'apply column header' button at start.
 */
$('#apply-column-header-btn').hide();

/**
 * Set the column headers.
 * Calls `update_preview_column_header`.
 */
$('#apply-column-header-btn').click(function(e) {
  var name = '';
  for (var i = 0; i < _column_names_.length; i++) {
    name = '#column-header-input-' + i;
    _column_names_[i] = $(name).val();
  }
  update_preview_column_header();
});

/**
 * Create the inputs use to set the column headers.
 * @param {required} column_count (Number) the number of columns (ie the number of input to create).
 */
function create_header_inputs(column_count) {
  // Remove every input.
  $('#column-header-table tr').remove();
  // create a line
  var tr = document.createElement('tr');
  // Show apply btn when input changes
  function chi_input_func(evt) {
    $('#apply-column-header-btn').show();
  }
  // For chaque column, create an input
  for (var i = 0; i < column_count; i++) {
    var td = document.createElement('td');
    var input = document.createElement('input');
    input.setAttribute('id', 'column-header-input-' + i);
    input.setAttribute('value', _column_names_[i]);
    input.addEventListener('input', chi_input_func);
    td.appendChild(input);
    tr.appendChild(td);
  }
  // Add the line to the table
  $('#column-header-table').append(tr);
}

/**
 * Set the column header input values according to `_column_names_`.
 **/
function update_header_inputs() {
  var id = '';
  for (var i = 0; i < _column_names_.length; i++) {
    id = '#column-header-input-' + i;
    $(id)[0].value = _column_names_[i];
  }
}

/**
 * Update the first line (the header) of the preview table. Use _column_names_ to fill the header.
 * Calls `update_preview_table` & `update_verb_column_select`.
 */
function update_preview_column_header() {
  $('#preview-table tr').first().remove();
  // Insert title
  var html = '';
  html += '<tr>';
  for (var j = 0; j < _column_names_.length; j++) {
    html += '<th>' + _column_names_[j] + '</th>';
  }
  html += '</tr>';
  // Insert data
  $('#preview-table tr').first().before(html);
  update_preview_table();
  update_verb_column_select();
  update_header_inputs();
}

/**
 * If `use-first-line-checkbox` changes (checked or not), change the `_column_names_`.
 * Calls `update_preview_column_header`.
 **/
$('#use-first-line-checkbox').change(function(e) {
  if ($('#use-first-line-checkbox')[0].checked) {
    if (_preview_data_.length > 0) {
      _column_names_ = [];
      for (var i = 0; i < _preview_data_[0].length; i++) {
        _column_names_[i] = _preview_data_[0][i];
      }
      update_preview_column_header();
    }
  }
});

/**-----------------------------------------------------------------------------
// MARK: Preview Table
**/

/**
 * Updates the preview table.
 */
function update_preview_table() {
  $('#preview-table tr').not(':first').remove();
  var start = $('#use-first-line-checkbox')[0].checked ? 1 : 0;
  for (var i = start; i < 3; i++) {
    html = '';
    html += '<tr>';
    for (j = 0; j < _preview_data_[i].length; j++) {
      html += '<td>' + _preview_data_[i][j] + '</td>';
    }
    html += '</tr>';
    $('#preview-table tr').last().after(html);
  }
}

/**-----------------------------------------------------------------------------
// MARK: Verb Selection & Verb Div Creation
**/

/**
 * Fill the `verb-column-select` with the verbs.
 **/
function update_verb_column_select() {
  $('#verb-column-select option').remove();
  var html = '<option selected>-Do-not-use-a-column-as-verb-</option>';
  for (var j = 0; j < _column_names_.length; j++) {
    html += '<option>' + _column_names_[j] + '</option>';
  }
  $('#verb-column-select').append(html);
}

/**
 * Fill the `verb-column-select` with the verbs.
 **/
function get_verbs_list(){
  var start = $('#use-first-line-checkbox')[0].checked ? 1 : 0;
  // Returns true if `value` exists in `list`. Return false otherwise.
  function contains(list, value) {
    for (var i = 0; i < list.length; i++) {
      if (list[i] === value) return true;
    }
    return false;
  }
  // Parse the file with chunks in a worker.
  Papa.parse($('#upload-btn')[0].files[0], {
    skipEmptyLines: true,
    worker: true,
    chunk: function(results, parser) {
      var data = results.data;
      for (var i = start; i < data.length; i++)
       if (data[i][_verb_column_position_] !== undefined && !contains(_verbs_, data[i][_verb_column_position_]))
         _verbs_.push(data[i][_verb_column_position_]);
      if(start === 1) start = 0;
    },
    delimiter: $('#separator-select').val(),
    complete: function(res) {
      create_statement_templates();
    }
  });
}

/**
 * Find all the verbs and create the verb divs.
 * Create the progress bar for each verb.
 */
$('#verb-column-apply-btn').on('click', function(e) {
  // Set the position on the verb column.
  _verb_column_position_ = $("#verb-column-select")[0].selectedIndex - 1;
  // Reset the statements list.
  _statements_ = [];
  // The list of verbs existing in the csv file.
  _verbs_ = [];
  // If the user chose not to use a column
  if (_verb_column_position_ === -1) {
    _verbs_.push('__DEFAULT_STATEMENT__');
    create_statement_templates();
  } else {
    get_verbs_list();
  }
});

/**
 * Create a steatement template for each "verb".
 **/
function create_statement_templates(){
  var verbs = _verbs_;
  // For every verb, creates a new statement object.
  for (i = 0; i < verbs.length; i++) {
    _statements_.push({
      'verb': verbs[i],
      'statement': {}
    });
  }
  // Remove every "verb div" if there are old ones.
  $('#verbs-list-div div').remove();
  // And here we go, let's create some div.
  var div, table, tr1, tr2, tr3, tr4, tr5,
    th, td2, td3, td4, td5,
    pb2, pb3, pb4, pb5,
    btn;
  for (var i = 0; i < verbs.length; i++) {
    // The main div
    div = document.createElement('div');
    div.classList.add('col-md-3', 'col-lg-2', 'col-sm-6');
    // The table
    table = document.createElement('table');
    table.style.width = "100%";
    // The title
    tr1 = document.createElement('tr');
    th = document.createElement('th');
    th.textContent = verbs[i];
    tr1.appendChild(th);
    table.appendChild(tr1);
    // The required bar
    tr2 = document.createElement('tr');
    td2 = document.createElement('td');
    pb2 = document.createElement('div');
    pb2.classList.add('progress-bar', 'progress-bar-danger');
    pb2.style.width = '0%';
    pb2.textContent = '0%';
    td2.appendChild(pb2);
    tr2.appendChild(td2);
    table.appendChild(tr2);
    // The recommanded bar
    tr3 = document.createElement('tr');
    td3 = document.createElement('td');
    pb3 = document.createElement('div');
    pb3.classList.add('progress-bar', 'progress-bar-warning');
    pb3.role = 'progressbar';
    pb3.style.width = '0%';
    pb3.textContent = '0%';
    td3.appendChild(pb3);
    tr3.appendChild(td3);
    table.appendChild(tr3);
    // The optionnal bar
    tr4 = document.createElement('tr');
    td4 = document.createElement('td');
    pb4 = document.createElement('div');
    pb4.classList.add('progress-bar', 'progress-bar-success');
    pb4.role = 'progressbar';
    pb4.style.width = '0%';
    pb4.textContent = '0%';
    td4.appendChild(pb4);
    tr4.appendChild(td4);
    table.appendChild(tr4);
    // The source bar
    tr5 = document.createElement('tr');
    td5 = document.createElement('td');
    pb5 = document.createElement('div');
    pb5.classList.add('progress-bar');
    pb5.role = 'progressbar';
    pb5.style.width = '0%';
    pb5.textContent = '0%';
    td5.appendChild(pb5);
    tr5.appendChild(td5);
    table.appendChild(tr5);
    // Push the dom elements in global var
    _DOM_verb_list_div_.push({
      'verb': verbs[i],
      'required': pb2,
      'recommanded': pb3,
      'optionnal': pb4,
      'source': pb5
    });

    // The little 'edit' button.
    btn = document.createElement('div');
    btn.textContent = "edit";
    btn.style.textAlign = "center";
    btn.style.cursor = "pointer";
    btn.style.width = "100%";
    btn.setAttribute('data-column-value', verbs[i]);
    // On click on 'edit' btn, fill the form with the statement
    // corresponding to the selected verb.
    // Also set the "copy from" select.
    btn.addEventListener('click', function(evt) {
      var verb = evt.target.getAttribute('data-column-value');
      $('#-current-verb-title-')[0].textContent = verb;
      for (var i = 0; i < _statements_.length; i++)
        if (_statements_[i].verb === verb) {
          _current_statement_ = _statements_[i];
          fill_form_with_statement(_current_statement_.statement);
          set_copy_from_select(verb);
          _update_editor_();
        }
    });
    div.appendChild(table);
    div.appendChild(btn);
    $('#verbs-list-div').append(div);
  }
};

/**-----------------------------------------------------------------------------
// MARK: Mapping Progress
**/

/**
 * Build the current statement on any input change.
 * Calls `update_mapping_progress`.
 **/
$("#statement-builder-values").change(function() {
  if($('#automatically-build').is(':checked')){
    var stmt = buildStatement();
    _check_ambigous_values_(stmt);
    _current_statement_.statement = stmt;
    update_mapping_progress();
    // Update editor
    _update_editor_();
  }
});

/**
 * Click on `parse-json-btn`. Build the current statement.
 * Also calls `update_mapping_progress` to set the different progress bars.
 **/
$('#parse-json-btn').click(function(e) {
  var stmt = buildStatement();
  _check_ambigous_values_(stmt);
  _current_statement_.statement = stmt;
  update_mapping_progress();
  // Update editor
  _update_editor_();
});

/**
 * Update editor panel with statement.
 **/
function _update_editor_(){
  var stmt = _current_statement_.statement;
  editor.setValue(JSON.stringify(stmt, undefined, 4)); // or session.setValue
  editor.clearSelection(); // or session.setValue
}

/**
 * Update the mapping progress bar of either a statement (param) or the current_statement.
 *
 **/
function update_mapping_progress(statement) {
  // If `statement` is null, use the current_statement.
  statement = statement || _current_statement_;
  var stmt = statement.statement;
  var verb = statement.verb;
  // List of the csv file columns bound to the statement.
  var column_used = [];
  // Check if a certain path exists in an object. Returns true if so, false otherwise.
  function path_is_set(path, parent) {
    if (path.length === 0) {
      return true;
    } else {
      if (parent[path[0]] === undefined || parent[path[0]] === null) {
        return false;
      } else {
        var old_path = path.shift();
        return path_is_set(path, parent[old_path]);
      }
    }
  }
  // Check for the bound columns in the statement object.
  // Fill column_used with them (a column name is pushed once and only once).
  function look_for_property(parent) {
    for (var child in parent) {
      if (typeof parent[child] === 'object') {
        look_for_property(parent[child]);
      } else {
        var str = parent[child];
        var m = global_regexp_for_csv_parsing.exec(str);
        global_regexp_for_csv_parsing.lastIndex = 0;
        if (m !== null) {
          var word = m[1];
          var exists = false;
          for (var i = 0; i < column_used.length; i++)
            if (column_used[i] === word)
              exists = true;
          if (!exists) {
            column_used.push(word);
          }
        }
      }
    }
  }
  // Update the progress bars
  var i, j, k = 0;
  for (i = 0; i < _DOM_verb_list_div_.length; i++) {
    if (_DOM_verb_list_div_[i].verb === verb) {
      // Required using
      var cpt = 0;
      for (j = 0; j < _required_values_list_.length; j++)
        for (k = 0; k < _required_values_list_[j].field.length; k++)
          if (path_is_set(_required_values_list_[j].field[k].split('.'), stmt)) {
            cpt++;
            k = _required_values_list_[j].field.length;
          }
      var moy = (cpt / _required_values_list_.length) * 100;
      _DOM_verb_list_div_[i].required.style.width = _DOM_verb_list_div_[i].required.textContent = Math.floor(moy) + '%';
      // Recommanded using
      cpt = 0;
      for (j = 0; j < _recommanded_values_list_.length; j++)
        for (k = 0; k < _recommanded_values_list_[j].field.length; k++)
          if (path_is_set(_recommanded_values_list_[j].field[k].split('.'), stmt)) {
            cpt++;
            k = _recommanded_values_list_[j].field.length;
          }
      moy = (cpt / _recommanded_values_list_.length) * 100;
      _DOM_verb_list_div_[i].recommanded.style.width = _DOM_verb_list_div_[i].recommanded.textContent = Math.floor(moy) + '%';
      // Column using
      look_for_property(stmt);
      moy = (column_used.length / _column_names_.length) * 100;
      _DOM_verb_list_div_[i].source.style.width = _DOM_verb_list_div_[i].source.textContent = Math.floor(moy) + '%';
    }
  }
}

/**-----------------------------------------------------------------------------
// MARK: Statement Functions
**/


$('#generate_statement_from_json_btn').on('click', function(){
  var stmt_text = editor.getValue();
  var stmt = null;
  try {
    stmt = JSON.parse(stmt_text);
    _check_ambigous_values_(stmt);
    fill_form_with_statement(stmt);
    _current_statement_.statement = stmt;
    update_mapping_progress();
  } catch (e) {
    notify({ message: "Invalid JSON, cannot generate statement.\n" + e });
  }
});

/**
 * Check value automatically set by the original application in order to force
 * user choices.
 * For example : `timestamp` might not be a real timestamp but a column name.
 **/
function _check_ambigous_values_(stmt) {
  if (stmt.timestamp === 'Invalid date' && $('#statement-timestamp input')[0].value.indexOf('{{') !== -1) {
    stmt.timestamp = $('#statement-timestamp input')[0].value;
  }
}

/**
 * If `clone` is true, returns a clone of the statement belonging to `verb`.
 * Otherwise returns the origin statement.
 **/
function get_statement(verb, clone) {
  for (var i = 0; i < _statements_.length; i++) {
    if (_statements_[i].verb === verb)
      if (clone)
        return JSON.parse(JSON.stringify(_statements_[i]));
      else return _statements_[i];
  }
  return null;
}

/**
 * Calls `get_mapping_properties` for each statement.
 **/
function generate_statements_mappings() {
  for (var i = 0; i < _statements_.length; i++) {
    _statements_[i].mapping = get_mapping_properties(_statements_[i].statement);
  }
}

/**
 * Returns a mapping (Array) between the statement `stmt` and the csv columns.
 **/
function get_mapping_properties(stmt) {
  var result = [];
  // Returns the column index of a given column header.
  function get_column_number(name) {
    for (var i = 0; i < _column_names_.length; i++)
      if (_column_names_[i] === name)
        return i;
  }
  // Go through the statement to seek for column mapping.
  // Fill the result array.
  function look_for_property(parent, path) {
    for (var child in parent) {
      var new_path = [];
      for(var i = 0 ; i < path.length; i++)
        new_path.push(path[i]);
      new_path.push(child);
      if (typeof parent[child] === 'object') {
        look_for_property(parent[child], new_path);
      } else {
        var m = global_regexp_for_csv_parsing.exec(parent[child]);
        global_regexp_for_csv_parsing.lastIndex = 0;
        if (m !== null) {
          var options = null;
          // If there are options for the mapping, we push them in `options`
          if (m[2]) {
            if (!options) options = {};
            var matches = options_regexp_for_csv_parsing.exec(m[2]);
            while (matches) {
              var tosplit = matches[0];
              var splitted = tosplit.split(' ');
              options[splitted[0]] = splitted[1];
              if(splitted[1] === undefined) options[splitted[0]] = true;
              matches = options_regexp_for_csv_parsing.exec(m[2]);
            }
          }
          var map = {
            'path': new_path,
            'column': get_column_number(m[1])
          };
          if (options) map.options = options;
          result.push(map);
        }
      }
    }
  }
  look_for_property(stmt, []);
  return result;
}

/**-----------------------------------------------------------------------------
// MARK: Upload trace functions
**/

/**
 * On `upload-trace-btn`, open the `-upload-modal-` modal.
 **/
$('#upload-trace-btn').click(function(e) {
  $('#-upload-modal-').modal();
});

/**
 * On `upload-trace-btn`, open the `-upload-modal-` modal.
 **/
$("#-registration-id-trace-upload-btn-").on('click', function() {
  $('#-registration-id-trace-upload-')[0].value = _guid_gen();
});

/**
 * Modified version of tincan `_sendStatementQueue_` function.
 * Returns a promise which resolve on success (200) and reject otherwise.
 **/
function _sendStatementQueue_(stmts) {
  return new Promise(
    function(resolve, reject) {
      setupConfig();
      ADL.XAPIWrapper.sendStatements(stmts, function(r, obj) {
        //console.log(r);
        //console.log(obj);
        // notification
        if (r.status == 200) {
          resolve();
        } else {
          reject();
        }
      });
    });
  // console.log(stmts);
  // return new Promise(
  //   function(resolve, reject) {
  //     setTimeout(resolve, 10);
  //   }
  // );
}

/**
 * On `-trace-upload-btn-` click, generate the statement mappings (`generate_statements_mappings`).
 * Then for each line of the csv file, create the statement and queues it.
 * Send the statement list to the lrs using `_sendStatementQueue_`.
 **/
$('#-trace-upload-btn-').on('click', function() {
  generate_statements_mappings();
  // Reset the upload progress bar
  $('#-trace-upload-progress-')[0].classList.remove('progress-bar-success');
  $('#-trace-upload-progress-')[0].textContent = $('#-trace-upload-progress-')[0].style.width = "0%";

  // Beginning of the loop (header on first line or not)
  var start = $('#use-first-line-checkbox')[0].checked ? 1 : 0;
  // Chunk index
  var chunk_index = 0;
  // Chunk size
  var chunk_size = 10000000;
  // File size
  var file_size = $('#upload-btn')[0].files[0].size;
  // Paerser resume function
  var resume = null;
  // True when parse.complete is called.
  var completed = false;
  // Basically do `obj`[`path`] = `value`.
  function setToValue(obj, value, path, options) {
    var i;
    for (i = 0; i < path.length - 1; i++)
      obj = obj[path[i]];
    obj[path[i]] = value;
    // If there are options, modify the value according to those.
    if (options) {
      // Add the prefix to the value.
      if (options['--prefix']) {
        obj[path[i]] = options['--prefix'] + obj[path[i]];
      }
      // Add the suffix to the value.
      if (options['--suffix']) {
        obj[path[i]] = obj[path[i]] + options['--suffix'];
      }
      // Transforme the value into number.
      if (options['--toNumber']) {
        obj[path[i]] = Number(obj[path[i]]);
      }
    }
    if(obj[path[i]] === null || obj[path[i]] === undefined){
      obj[path[i]] = "";
    }
  }

  // Send 1x`cap` statements from the position `index` from the csv file datas.
  function sendPackage(index, cap, data) {
    // List of statements to send.
    var statements_to_send = [];
    // origin index
    var origin = index;
    // Loop to load 1x`cap` obsels.
    while (index < data.length && index - origin < cap) {
      var stmt = null;
      if (_verb_column_position_ === -1) stmt = get_statement("__DEFAULT_STATEMENT__", true);
      else stmt = get_statement(data[index][_verb_column_position_], true);
      for (var j = 0; j < stmt.mapping.length; j++) {
        var keys = stmt.mapping[j].path;
        setToValue(stmt.statement, data[index][stmt.mapping[j].column], stmt.mapping[j].path, stmt.mapping[j].options);
      }
      stmt.statement.context = stmt.context || {};
      stmt.statement.context.registration = $('#-registration-id-trace-upload-')[0].value;
      statements_to_send.push(stmt.statement);
      index++;
    }
    if (statements_to_send.length > 0) {
      // Send the statement and wait for response.
      _sendStatementQueue_(statements_to_send).then(function() {
        // Update upload progress bar status
        $('#-trace-upload-progress-')[0].style.width = Math.floor((( chunk_index * chunk_size / file_size ) * 100) + ((index / data.length) * (chunk_size / file_size) * 100)) + '%';
        $('#-trace-upload-progress-')[0].textContent = Math.floor(((( chunk_index * chunk_size / file_size ) * 100) + ((index / data.length) * (chunk_size / file_size) * 100))) + '%';
        // Send the rest of the datas.
        sendPackage(index, cap, data);
      }).catch(function(err) {
        console.log(err);
      });
    } else {
      chunk_index += 1;
      if(!completed) resume();
      else{
        saveLogs();
        $('#-trace-upload-progress-')[0].style.width = "100%";
        $('#-trace-upload-progress-')[0].classList.add('progress-bar-success');
        $('#-trace-upload-progress-')[0].textContent = "Upload complete";
      }
    }
  }

  Papa.parse($('#upload-btn')[0].files[0], {
    skipEmptyLines: true,
    chunk: function(results, parser) {
      parser.pause();
      resume = parser.resume;
      var data = results.data;

      // Start the upload.
      sendPackage(start, 1000, data);

      if(start === 1) start = 0;
    },
    delimiter: $('#separator-select').val(),
    complete: function(res) {
      completed = true;
    }
  });

});


function saveLogs(){
    var logString = "";
    // UUID
    logString += "Registration id : "+ $('#-registration-id-trace-upload-')[0].value + "\n\n";
    logString += "Origin file : " +  $('#upload-btn')[0].files[0].name + "\n\n";
    // Splitted
    if(_verb_column_position_ !== -1){
      logString += "Typified by : "+ _preview_data_[0][_verb_column_position_] + "\n\n";
    }
    logString += "Statements mapping : \n";
    for(var i = 0; i < _statements_.length; i++){
      logString += "    Verb : "+_statements_[i].verb+"\n";
      logString += "    Mapping : \n";
      for(var j = 0 ; j < _statements_[i].mapping.length; j++){
        logString += "        " + _preview_data_[0][_statements_[i].mapping[j].column]+" : ";
        for(var k = 0 ; k < _statements_[i].mapping[j].path.length - 1; k++){
          logString += _statements_[i].mapping[j].path[k] + ' > '
        }
        logString += _statements_[i].mapping[j].path[k] + "\n";
      }
      logString += "    ============================================================== \n";
    }
    // The text of the file.
    var txt = "data:text/json;charset=utf-8," + logString;
    // And here we send.
    var encodedUri = encodeURI(txt);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trace_upload_logs.txt");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
};

/** ----------------------------------------------------------------------------
// MARK: Autocomplete Functions
**/

/**
 * Suggest column names when input contains '{{'.
 * Autocompletes on tabulation.
 **/
function autocomplete_input(evt) {
  // If input is a tabulation, we prevent default behavior.
  if (evt.which === 9) {
    evt.preventDefault();
  }
  // Value from input.
  var txt = evt.target.value;
  // Regex to match for autocomplete.
  var regex = /^{{([\w]+)?\s?(.*)(}})?$/ig;
  // We try to get a match, which can be the last match if the user keep striking the tabulation key
  // Or a new match from input
  var match = evt.target.getAttribute('data-autocomplete-lastMatch');
  var reg = null;
  if (!match) reg = regex.exec(txt);
  if (reg && reg[1]) match = reg[1];
  if (match) {
    // We lowercase the match.
    match = match.toLowerCase();
    // str will contain each column names matching the input and fill the tooltip.
    var str = '';
    // Each matching column name will be pushed into `headers`.
    var headers = [];
    var count = 0;
    // We look for each matching column name.
    for (var i = 0; i < _column_names_.length; i++) {
      if (_column_names_[i].toLowerCase().indexOf(match) !== -1) {
        str += _column_names_[i] + '\n';
        headers.push(_column_names_[i]);
      }
    }
    // If the key stroke is tabulation, we autocomplete.
    if (evt.which === 9) {
      evt.target.setAttribute('data-autocomplete-lastMatch', match);
      if (evt.target.getAttribute('data-autocomplete-index')) {
        var index = parseInt(evt.target.getAttribute('data-autocomplete-index'));
        evt.target.value = "{{" + headers[index];
        if (headers.length > index + 1)
          evt.target.setAttribute('data-autocomplete-index', index + 1);
        else
          evt.target.removeAttribute('data-autocomplete-index');
      } else {
        evt.target.value = '{{' + headers[0];
        if (headers.length > 1)
          evt.target.setAttribute('data-autocomplete-index', 1);
      }
      // If the key stroke is not tabulation, we display tooltip with match.
    } else {
      evt.target.removeAttribute('data-autocomplete-lastMatch');
      evt.target.removeAttribute('data-autocomplete-index');
      if (str.length < 1) {
        evt.target.classList.add('-has-error-');
      } else {
        evt.target.classList.remove('-has-error-');
      }
      if (str !== evt.target.title) {
        $(evt.target).tooltip('destroy');
        setTimeout(function() {
          evt.target.title = str;
          $(evt.target).tooltip({
              'animation': false,
              'placement': 'right'
            })
            .tooltip('show');
          evt.target.title = str;
        }, 20);
      }
    }
  } else {
    $(evt.target).tooltip('hide');
  }
}

/**
 * Autocomplete on keyup and prevent default behavior on tabulation strike.
 **/
$(".-autocomplete-target-").on('keyup', autocomplete_input);
$(".-autocomplete-target-").on('keydown', function(evt) {
  if (evt.which === 9)
    evt.preventDefault();
});

/** ----------------------------------------------------------------------------
// MARK: Copy from functions
**/

/**
 * Fill the "copy from" select with every verb except the current one.
 **/
function set_copy_from_select(verb) {
  var opt;
  var first = true;
  $('#-copy-from-select- option').remove();
  for (var i = 0; i < _statements_.length; i++) {
    if (_statements_[i].verb !== verb) {
      opt = document.createElement('option');
      if (first) {
        first = false;
        opt.selected = true;
      }
      opt.textContent = _statements_[i].verb;
      $('#-copy-from-select-').append(opt);
    }
  }
}

/**
 * Fill the form with the statement (`stmt`) datas.
 * Might be a bug nest. Must be...
 **/
function fill_form_with_statement(stmt) {
  var keys = [];
  if (stmt.actor) {
    if (stmt.actor.objectType === 'Agent') {
      // Agent type actor options
      $('#actor-type option:nth-child(1)').attr('selected', 'selected');
      $("#actor-agent-email")[0].value = (stmt.actor.mbox) ? stmt.actor.mbox.replace('mailto:', '') : '';
      $("#actor-agent-email-sha1")[0].value = stmt.actor.mbox_sha1sum || '';
      $("#actor-agent-openid")[0].value = stmt.actor.openid || '';
      $("#actor-agent-account")[0].value = (stmt.actor.account) ? JSON.stringify(stmt.actor.account) : '';
      $("#actor-agent-name")[0].value = stmt.actor.name || '';
    } else if (stmt.actor.objectType === 'Group') {
      // Agent group type options
      $('#actor-type option:nth-child(2)').attr('selected', 'selected');
      $("#actor-group-email")[0].value = (stmt.actor.mbox) ? stmt.actor.mbox.replace('mailto:', '') : '';
      $("#actor-group-email-sha1")[0].value = stmt.actor.mbox_sha1sum || '';
      $("#actor-group-openid")[0].value = stmt.actor.openid || '';
      $("#actor-group-account")[0].value = (stmt.actor.account) ? JSON.stringify(stmt.actor.account) : '';
      $("#actor-group-name")[0].value = stmt.actor.name || '';
      $("#actor-group-members")[0].value = (stmt.actor.member) ? JSON.stringify(stmt.actor.member) : '';
    }
  }
  if (stmt.verb) {
    $("#verb-id")[0].value = stmt.verb.id || '';
    if (stmt.verb.id) {
      var _verb_code_name = stmt.verb.id.split('/')[stmt.verb.id.split('/').length - 1];
      $("#predefined-verb option").filter(function() {
        return this.text == _verb_code_name;
      }).attr('selected', true);
    }
    else{
      $("#predefined-verb option:nth-child(1)").attr('selected', true);
    }
    if (stmt.verb.display) {
      keys = Object.keys(stmt.verb.display);
      $("#verb-display")[0].value = (keys.length > 0) ? stmt.verb.display[keys[0]] : '';
      $("#verb-language")[0].value = (keys.length > 0) ? keys[0] : '';
    }
  }
  if (stmt.object) {
    if (stmt.object.objectType === 'Activity') {
      $('#object-type option:nth-child(1)').attr('selected', 'selected');
      $("#object-activity-id")[0].value = stmt.object.id;
      if (stmt.object.definition) {
        if (stmt.object.definition.description) {
          keys = Object.keys(stmt.object.definition.description);
          $("#object-activity-description")[0].value = (keys.length > 0) ? stmt.object.definition.description[keys[0]] : '';
          $("#object-activity-language")[0].value = (keys.length > 0) ? keys[0] : '';
        }
        if (stmt.object.definition.name) {
          keys = Object.keys(stmt.object.definition.name);
          $("#object-activity-name")[0].value = (keys.length > 0) ? stmt.object.definition.name[keys[0]] : '';
          $("#object-activity-language")[0].value = (keys.length > 0) ? keys[0] : '';
        }
        if (stmt.object.definition.interactionType) {
          switch (stmt.object.definition.interactionType) {
            case 'choice':
              $('#object-activity-interaction-type option:nth-child(2)').attr('selected', 'selected');
              if (stmt.object.definition.choices) {
                $("#object-activity-component-list-choices").value = JSON.stringify(stmt.object.definition.choices);
              }
              break;
            case 'sequencing':
              $('#object-activity-interaction-type option:nth-child(3)').attr('selected', 'selected');
              if (stmt.object.definition.choices) {
                $("#object-activity-component-list-choices").value = JSON.stringify(stmt.object.definition.choices);
              }
              break;
            case 'likert':
              $('#object-activity-interaction-type option:nth-child(4)').attr('selected', 'selected');
              if (stmt.object.definition.choices) {
                $("#object-activity-component-list-scale").value = JSON.stringify(stmt.object.definition.scale);
              }
              break;
            case 'matching':
              $('#object-activity-interaction-type option:nth-child(5)').attr('selected', 'selected');
              if (stmt.object.definition.source) {
                $("#object-activity-component-list-source").value = JSON.stringify(stmt.object.definition.source);
              }
              if (stmt.object.definition.target) {
                $("#object-activity-component-list-scale").target = JSON.stringify(stmt.object.definition.target);
              }
              break;
            case 'performance':
              $('#object-activity-interaction-type option:nth-child(6)').attr('selected', 'selected');
              if (stmt.object.definition.steps) {
                $("#object-activity-component-list-scale").value = JSON.stringify(stmt.object.definition.steps);
              }
              break;
            case 'true-false':
              $('#object-activity-interaction-type option:nth-child(7)').attr('selected', 'selected');
              break;
            case 'fill-in':
              $('#object-activity-interaction-type option:nth-child(8)').attr('selected', 'selected');
              break;
            case 'long-fill-in':
              $('#object-activity-interaction-type option:nth-child(9)').attr('selected', 'selected');
              break;
            case 'numeric':
              $('#object-activity-interaction-type option:nth-child(10)').attr('selected', 'selected');
              break;
          }
        }
        if (stmt.object.definition.correctResponsesPattern) {
          $("#object-activity-correct-responses-pattern").value = JSON.stringify(stmt.object.definition.correctResponsesPattern);
        }
        if (stmt.object.definition.extensions) {
          $("#object-activity-extensions").value = JSON.stringify(stmt.object.definition.extensions);
        }
      }
    } else if (stmt.object.objectType === 'Agent') {
      $('#object-type option:nth-child(2)').attr('selected', 'selected');
      $("#object-agent-email")[0].value = (stmt.object.mbox) ? stmt.object.mbox.replace('mailto:', '') : '';
      $("#object-agent-email-sha1")[0].value = stmt.object.mbox_sha1sum || '';
      $("#object-agent-openid")[0].value = stmt.object.openid || '';
      $("#object-agent-account")[0].value = (stmt.object.account) ? JSON.stringify(stmt.object.account) : '';
      $("#object-agent-name")[0].value = stmt.object.name || '';
    } else if (stmt.object.objectType === 'Group') {
      $('#object-type option:nth-child(3)').attr('selected', 'selected');
      $("#object-group-email")[0].value = (stmt.object.mbox) ? stmt.object.mbox.replace('mailto:', '') : '';
      $("#object-group-email-sha1")[0].value = stmt.object.mbox_sha1sum || '';
      $("#object-group-openid")[0].value = stmt.object.openid || '';
      $("#object-group-account")[0].value = (stmt.object.account) ? JSON.stringify(stmt.object.account) : '';
      $("#object-group-name")[0].value = stmt.object.name || '';
      $("#object-group-members")[0].value = (stmt.object.member) ? JSON.stringify(stmt.object.member) : '';
    } else if (stmt.object.objectType === 'StatementRef') {
      $('#object-type option:nth-child(4)').attr('selected', 'selected');
      $("#object-statementref-id")[0].value = stmt.object.id || '';
    } else if (stmt.object.objectType === 'SubStatement') {
      $('#object-type option:nth-child(5)').attr('selected', 'selected');
      var obj = {};
      keys = Object.keys(stmt.object);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] !== 'objectType') {
          obj[keys[i]] = stmt.object[keys[i]];
        }
      }
      $("#object-substatement-json")[0].value = JSON.stringify(obj);
    }
  }
  if (stmt.result) {
    if (stmt.result.completion === undefined) {
      $('#result-completion option:nth-child(1)').attr('selected', 'selected');
    } else if (stmt.result.completion === true) {
      $('#result-completion option:nth-child(2)').attr('selected', 'selected');
    } else {
      $('#result-completion option:nth-child(3)').attr('selected', 'selected');
    }
    if (stmt.result.success === undefined) {
      $('#result-success option:nth-child(1)').attr('selected', 'selected');
    } else if (stmt.success.completion === true) {
      $('#result-success option:nth-child(2)').attr('selected', 'selected');
    } else {
      $('#result-success option:nth-child(3)').attr('selected', 'selected');
    }
    if (stmt.result.score) {
      $("#result-raw-score")[0].value = stmt.result.score.raw || '';
      $("#result-min-score")[0].value = stmt.result.score.min || '';
      $("#result-max-score")[0].value = stmt.result.score.max || '';
      $("#result-scaled-score")[0].value = stmt.result.score.scaled || '';
    }
    $("#result-duration")[0].value = stmt.result.duration || '';
    $("#result-response")[0].value = stmt.result.response || '';
    $("#result-extensions")[0].value = (stmt.result.extensions) ? JSON.stringify(stmt.result.extensions) : '';
  }
  if (stmt.context) {
    $("#context-language")[0].value = stmt.context.language || '';
    $("#context-revision")[0].value = stmt.context.revision || '';
    $("#context-platform")[0].value = stmt.context.platform || '';
    $("#context-extensions")[0].value = (stmt.context.extensions) ? JSON.stringify(stmt.context.extensions) : '';
    $("#context-context-activities")[0].value = (stmt.context.contextActivities) ? JSON.stringify(stmt.context.contextActivities) : '';
    if (stmt.context.team) {
      $("#context-team-name")[0].value = stmt.context.team.name || '';
      $("#context-team-members")[0].value = (stmt.context.team.member) ? JSON.stringify(stmt.context.team.member) : '';
    }
    if (stmt.context.instructor) {
      $("#context-instructor-email")[0].value = (stmt.context.instructor.mbox) ? stmt.context.instructor.mbox.replace('mailto:', '') : '';
      $("#context-instructor-name")[0].value = stmt.context.instructor.name || '';
    }
  }
  if (stmt.attachments) {
    $("#attachment-usage-type")[0].value = stmt.attachments[0].usageType || '';
    $("#attachment-content-type")[0].value = stmt.attachments[0].contentType || '';
    $("#attachment-length")[0].value = stmt.attachments[0].length || '';
    $("#attachment-sha2")[0].value = stmt.attachments[0].sha2 || '';
    $("#attachment-file-url")[0].value = stmt.attachments[0].fileUrl || '';
    if (stmt.attachments.display) {
      keys = Object.keys(stmt.attachments.display);
      $("#attachment-display")[0].value = (keys.length > 0) ? stmt.attachments.display[keys[0]] : '';
      $("#attachment-language")[0].value = (keys.length > 0) ? keys[0] : '';
    }
    if (stmt.attachments.description) {
      keys = Object.keys(stmt.attachments.description);
      $("#attachment-description")[0].value = (keys.length > 0) ? stmt.attachments.description[keys[0]] : '';
      $("#attachment-language")[0].value = (keys.length > 0) ? keys[0] : '';
    }
  }
  $("#statement-timestamp input")[0].value = stmt.timestamp || '';
  $("#statement-version")[0].value = stmt.version || '';
  $("#statement-id")[0].value = stmt.id || '';
}

/**
 * Copy the statement mapping from a verb to the current one.
 * Also calls `fill_form_with_statement`.
 **/
$('#-copy-from-btn-').on('click', function(evt) {
  var verb = $('#-copy-from-select-').find(":selected").text();
  for (var i = 0; i < _statements_.length; i++) {
    if (_statements_[i].verb === verb) {
      _current_statement_.statement = _statements_[i].statement;
      fill_form_with_statement(_current_statement_.statement);
    }
  }
});

/** ----------------------------------------------------------------------------
// MARK: Config Export / Import
**/

/**
 * Copy the statements and a few information into a json file.
 * Propose to download it.
 **/
$('#-config-download-btn-').on('click', function(evt) {
  // The json to create in a file.
  var json = {
    "_column_names_": _column_names_,
    "_use_first_col_as_header": $('#use-first-line-checkbox')[0].checked,
    "_verb_column_position_": _verb_column_position_,
    "_statements_": _statements_
  };
  // The text of the file.
  var txt = "data:text/json;charset=utf-8," + JSON.stringify(json, null, '  ');
  // And here we send.
  var encodedUri = encodeURI(txt);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.json");
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
});

/**
 * Read a json file and set the statements / column headers / verb index / etc.
 * Calls `update_preview_column_header` & `update_mapping_progress` for each statement.
 **/
$('#-config-upload-btn-').on('change', function(evt) {
  var file = $('#-config-upload-btn-')[0].files[0];
  var reader = new FileReader();
  // Closure to capture the file information.
  reader.onload = (function(theFile) {
    return function(e) {
      var raw = e.target.result;
      var json = JSON.parse(raw);
      $('#use-first-line-checkbox')[0].checked = json._use_first_col_as_header;
      _column_names_ = json._column_names_;
      update_preview_column_header();
      _verb_column_position_ = json._verb_column_position_;
      var pos_plus_one = _verb_column_position_ + 1;
      var str = '#verb-column-select option:nth(' + pos_plus_one + ')';
      $(str).attr('selected', 'selected');
      $('#verb-column-apply-btn').click();
      _statements_ = json._statements_;
      for (var i = 0; i < _statements_.length; i++) {
        update_mapping_progress(_statements_[i]);
      }
    };
  })(file);
  // Read in the image file as a data URL.
  reader.readAsText(file);
});

/** ----------------------------------------------------------------------------
// MARK: (utility) UUID Generator
**/

/**
 * Generate a "UUID-like" string.
 **/
function _guid_gen() {
  return uuid.v4();
}

/** ----------------------------------------------------------------------------
// MARK: TEST GET DATA FROM LRS
**/

function _check_lrs_status_function_() {
  var req = new XMLHttpRequest();
  req.open('GET', 'MY_LRS_URI', true);
  req.setRequestHeader("X-Experience-API-Version", "1.0.0");
  req.setRequestHeader("Authorization", "Basic " + btoa("MY_LRS_USERNAME" + ":" + "MY_LRS_PASSWORD"));
  req.onreadystatechange = function(aEvt) {
    if (req.readyState == 4) {
      if (req.status == 200)
        console.log(req.responseText);
      else
        console.log("Erreur pendant le chargement de la page.\n");
    }
  };
  req.send(null);
}

/** ----------------------------------------------------------------------------
// MARK: TEST TEXT TO UUID
**/
/*function splice(str, index, count, add) {
  // We cannot pass negative indexes dirrectly to the 2nd slicing operation.
  if (index < 0) {
    index = str.length + index;
    if (index < 0) {
      index = 0;
    }
  }

  return str.slice(0, index) + (add || "") + str.slice(index + count);
}

var test= "yolO C'est m0i";
var res = "";

console.log(test.length);

for(var i = 0 ; i < test.length ; i++){
  var val = test[i].charCodeAt(0);
  var string = val.toString(16);
  res += string;
}
for(var i = test.length; i < 16 ; i++){
  var rand = Math.floor(Math.random() * (255 + 1));
  var string = rand.toString(16);
  res += string;
}

console.log(res);

res = splice(res, 20, 0, '-');
res = splice(res, 16, 0, '-');
res = splice(res, 12, 0, '-');
res = splice(res, 8, 0, '-');


console.log(res);*/
