
var getAjaxContent = require('./utilities/GetAjaxContent');
var templateDataTable = require('../templates/data-table.hbs');

var Application = {
	initialize: function() {
		var self = this;

		console.log('Application');

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

		var $elTarget = $('#data-target');
		var tmplDataTable = templateDataTable;

		console.log(data);

		console.log(tmplDataTable);

		$elTarget.html(tmplDataTable(data));


	}

}

module.exports = Application;
