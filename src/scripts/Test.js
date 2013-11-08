
var Test = {
	initialize: function() {
		var self = this;

		this.buildTable();

	},

	buildTable: function() {
		var self = this;
		var $elTarget = $('#datatable-target');
		var $elTable = $elTarget.find('table');


		$elTable.dataTable({
			"sPaginationType": "full_numbers",
			"iDisplayLength": 10,
			// "bLengthChange": false,
			// "bInfo": false
			//"bSort": true,
			"bSortClasses": false,

			//use this "sDom" with ColumnFilter plugin
			"sDom": '<"data-table-heading"if<"clear">><"data-table-paginav"p>t<"data-table-paginav"p>'

			//use this "sDom" with ColumnFilterWidgets plugin; W represents the injected filters
			// "sDom": '<"data-table-top"if<"clear">><"data-table-filters"W><"data-table-paginav"p>t<"data-table-paginav"p>',
			// "oColumnFilterWidgets": {
			// 	"aiExclude": [0,1,2,5],
			// 	"iMaxSelections": 1
			// }
		}).columnFilter({
			aoColumns: [
				null,
				null,
				null,
				null,
				{type: "select", values: []},
				{type: "select", values: []},
				{type: "select", values: []}
			]
		});
		$('.dataTables_filter input').attr({'placeholder': 'Keyword Search'});
		//remove text node 'Search' from generated label
		$('.dataTables_filter label').contents().filter(function() {
			return this.nodeType === 3;
		}).remove();


	}

}

module.exports = Test;
