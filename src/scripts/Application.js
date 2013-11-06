
var getAjaxContent = require('./utilities/GetAjaxContent');
var templateDataTable = require('../templates/data-table.hbs');

var Application = {
	initialize: function() {
		var self = this;

		$.when(getAjaxContent('/data/territories.json')).done(function(response) {
			self.buildTable(response);
		}).fail(function(error) {
			console.log(error);
		});

	},

	buildTable: function(data) {
		var self = this;
		var $document = $(document);
		var $body = $('body');
		var tmplDataTable = templateDataTable;
		var $elTarget = $('#data-target');
		var $elTable;
		var dt;


		for (var i=0, len=data.length; i<len; i++) {
			dt = new Date(data[i].date.replace(/-/g,'/'));
			data[i].year = dt.getFullYear().toString();
		}


		$elTarget.html(tmplDataTable(data));
		$elTable = $elTarget.find('table');
		$elTable.dataTable({
			"sPaginationType": "full_numbers",
			"iDisplayLength": 40,
			// "bLengthChange": false,
			// "bInfo": false
			"bSortClasses": false,
			//"bSort": true,
			"sDom": '<"data-table-top"if><"data-table-filters"W>t<"data-table-bottom"p><"clear">',
			"oColumnFilterWidgets": {
				"aiExclude": [0,1,2],
				"iMaxSelections": 1
			}
		});
		$('.dataTables_filter input').attr({'placeholder': 'Keyword Search'});



	}

}

module.exports = Application;
