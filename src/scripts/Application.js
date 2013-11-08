
var getAjaxContent = require('./utilities/GetAjaxContent');
//var templateDataTableOld = require('../templates/data-table-old.hbs');
var templateDataTable = require('../templates/data-table.hbs');

var Application = {
	initialize: function() {
		var self = this;
		//var dataUrlOld = '/data/territories.json';
		var dataUrl = '/data/granteelist.json';

		$.when(getAjaxContent(dataUrl)).done(function(response) {
			self.buildTable(response);
		}).fail(function(error) {
			console.log(error);
		});

	},

	buildTable: function(data) {
		var self = this;
		var len = data.length;
		//var tmplDataTableold = templateDataTableOld;
		var tmplDataTable = templateDataTable;
		var $elTarget = $('#datatable-target');
		var $elTable;
		// var arYears = [];
		// var arPrograms = [];

		// for (var i=0; i<len; i++) {

		// 	if (arYears.indexOf(data[i].Year) === -1 ) {
		// 		arYears.push(data[i].Year);
		// 	}

		// 	if (arPrograms.indexOf(data[i].Program) === -1 ) {
		// 		arPrograms.push(data[i].Program);
		// 	}

		// }
		// arYears.sort();
		// arPrograms.sort();
		// console.log(arYears);
		// console.log(arPrograms);

		$elTarget.html(tmplDataTable(data));
		$elTable = $elTarget.find('table');
		$elTable.dataTable({
			"sPaginationType": "full_numbers",
			"iDisplayLength": 30,
			// "bLengthChange": false,
			// "bInfo": false
			// "bSort": true,
			"bSortClasses": false,
			"sDom": '<"data-table-heading"if<"clear">><"data-table-paginav"p>t<"data-table-paginav"p>'
		}).columnFilter({
			aoColumns: [
				null,
				null,
				null,
				//null,
				{sSelector: "#datafilter-years", type: "select" /*,values: arYears*/},
				null,
				{sSelector: "#datafilter-programs", type: "select" /*, values: arPrograms*/}
			]
		});
		$('.dataTables_filter input').attr({'placeholder': 'Keyword Search'});
		//remove text node 'Search' from generated label
		$('.dataTables_filter label').contents().filter(function() {
			return this.nodeType === 3;
		}).remove();




	}

}

module.exports = Application;
