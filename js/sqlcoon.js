
activeLineCss = "activeline";

var vimMode = function(obj) {
	if ($("#vim-mode")[0].checked) {
		editor.setOption("keyMap", "vim");
	}
	else {
		editor.setOption("keyMap", "default");
	}
};

var darkTheme = function(obj) {
	if ($("#dark-theme")[0].checked) {
		editor.setOption("theme", "monokai");
		activeLineCss = "dark-activeline";
	}
	else {
		editor.setOption("theme", "default");
		activeLineCss = "activeline";
	}
	hlLine = editor.setLineClass(editor.getCursor().line, activeLineCss);
};

var toggleSchemas = function(btn) {
	if (btn.className.indexOf("active") == -1) {
		$("#left-panel").show();
		dataSource.request({ sql: "SHOW TABLES" }, function(result) {
			var tables = result.resultSet;
			var key = objectGetFirst(tables[0]);
			var html = "";
			var menu = "<ul class='dropdown-menu' role='menu' aria-labelledby='dLabel'>";
				menu += "<li onclick='viewColumns(this)'>View Columns</li>";
				menu += "<li onclick='selectRows(this)'>Select Rows - Limit 100</li>";
				menu += "<li onclick='dropTable(this)'>Drop Table</li>";
				menu += "</ul>"; 
			for (var i = 0; i < tables.length; i++) {
				html += "<div class='left-panel-item dropdown'><i class='icon-list-alt'></i><button class='dropdown-toggle' data-toggle='dropdown' role='button'>" + tables[i][key] + "<b class='caret'></b></button>" + menu + "</div>";
			};
			$("#left-panel").html(html);
		});
	}
	else {
		$("#left-panel").hide();
	}
};

var menuOperationForTable = function(item, sql) {
	var table = item.parentNode.previousSibling.innerHTML.replace(/\<.*/, "");
	sql = sql.replace(/%table%/g, table);
	editor.setValue(sql);
	executeCode(sql);
	editor.focus();
};

var viewColumns = function(item) {
	var sql = "SHOW COLUMNS FROM %table%;";
	menuOperationForTable(item, sql);
};

var selectRows = function(item) {
	var sql = "SELECT * FROM %table%\nLIMIT 100;";
	menuOperationForTable(item, sql);
};

var dropTable = function(item) {
	var sql = "DROP TABLE %table%;";
	if (confirm("You will lose all data in the table. Do you want to continue?")) {
		menuOperationForTable(item, sql);
	}
};

var toggleResultPanel = function(btn) {
	if (btn.className.indexOf("active") == -1) {
		$("#result-panel").show();
	}
	else {
		$("#result-panel").hide();
	}
};

var toggleOutputPanel = function(btn) {
	if (btn.className.indexOf("active") == -1) {
		$("#output-panel").show();
	}
	else {
		$("#output-panel").hide();
	}
};

var clearOutput = function() {
	document.getElementById("output").innerHTML = "";
}

var objectGetFirst = function(obj) {
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			return i;
		}
	};
};

var copy = function(objA, objB) {
	for (var i in objB) {
		if (objB.hasOwnProperty(i) && objB[i] !== null) {
			objA[i] = objB[i];
		}
	};
	return objA;
};

var JSONPDataSource = function(globalConfig) {

	var globalConfig = {
		url: "QueryDatabase.php",
		dataType: "jsonp",
		type: "GET",
		jsonp: "jsonp",
		timeout: 5000
	};

	this.setOnError = function(callback) {
		globalConfig.error = callback;
	};
	
	this.request = function(data, callback) {
		var config = copy({}, globalConfig);
		config.data = data;
		config.success = callback;
		$.ajax(config);
	};
};

var getHTMLTable = function(data) {
	var html = "<table class='table table-striped table-hover table-condensed'>";
	html += "<thead><tr>";
	html += "<th>#</th>";
	for (var i in data[0]) {
		html += "<th>" + i + "</th>";
	}
	html += "</tr></thead>";
	html += "<tbody>";
	for (var i = 0; i < data.length; i++) {
		html += "<tr>";
		html += "<td>" + (i + 1) + "</td>";
		for (var j in data[i]) {
			var value = data[i][j] == "" ? "<span class='null-cell'>NULL<span>" : data[i][j];
			html += "<td>" + value + "</td>";
		}
		html += "</tr>";
	};
	html += "</tbody>";
	html += "</table>";
	return html;
}

var dataSource = new JSONPDataSource();
dataSource.setOnError(function(result) {
	printMessage(result.responseText.replace(/jQuery\w+?\(/, "").replace(/\);$/, ""), true);
});

var printMessage = function(result, isError) {
	var type = isError ? "error" : "success";
	var html = '<div class="alert alert-' + type + '"><button data-dismiss="alert" class="close" type="button">×</button>' + result + '</div>';
	document.getElementById("output").innerHTML = html + document.getElementById("output").innerHTML;
};

var executeCode = function(code) {
	dataSource.request({ sql: code }, function(result) {
		if (typeof result == "string") {
			printMessage(result, true);
		}
		else {
			document.getElementById("result").innerHTML = getHTMLTable(result.resultSet);
			printMessage(result.affectedRows + " row(s) affected", false);
		}
	});
};

CodeMirror.commands.execute = function(context) {
	executeCode(context.getSelection() || context.getValue());
}

var editor;

$(document).ready(function() {
	editor = CodeMirror.fromTextArea(document.getElementById("code"), {
		mode: "text/x-mysql",
		tabMode: "indent",
		indentUnit: 4,
		smartIndent: true,
		lineNumbers: true,
		extraKeys: {"Shift-Ctrl-Enter": "execute"},
		undoDepth: 200,
		matchBrackets: true,
		//theme: "monokai",
		onCursorActivity: function() {
			editor.setLineClass(hlLine, null, null);
			hlLine = editor.setLineClass(editor.getCursor().line, null, activeLineCss);
		}
	});

	editor.setSize(null, "430px");
	vimMode();
	darkTheme();
	editor.focus();
});

