
var getAjaxContent = require('./utils/GetAjaxContent');
var templateDataTable = require('../templates/data-table.hbs');
var templateDataFilters = require('../templates/data-filters.hbs');
var templateNoResults = require('../templates/no-results.hbs');
var CustomApp = require('./CustomApp');

var Application = {
	initialize: function() {
		var self = this;

		this.$body = $('body');
		this.$elContainer = $('#data-table-container');
		this.$elFiltersContainer = $('#data-filters-container');
		this.$elTable = null;
		this.$elReset = null;
		this.$elFilters = null;
		this.$elSearch = null;

		this.dataUrl = '/data/granteelist.json';
		this.obTable = null;
		this.obData = null;

		this.getData();

	},

	getData: function() {
		var self = this;

		$.when(getAjaxContent(this.dataUrl)).done(function(response) {
			self.obData = response;
			self.buildTable();
		}).fail(function(error) {
			console.log(error);
		});

	},

	buildTable: function() {
		var self = this;
		var tmplDataFilters = templateDataFilters;
		var tmplDataTable = templateDataTable;
		var tmpleNoResults = templateNoResults;

		this.$elContainer.html(tmplDataTable(this.obData));
		this.$elFiltersContainer.html(tmplDataFilters());
		this.$elTable = this.$elContainer.find('table');

		this.obTable = this.$elTable.dataTable({
			"aoColumnDefs": [
				{"sType": "title-numeric", "aTargets": [5]}
			],
			"oLanguage": {
				"sZeroRecords": tmpleNoResults()
			},
/*
			"fnDrawCallback": function( oSettings ) {
				alert( 'DataTables has redrawn the table' );
			},
*/
			"sPaginationType": "full_numbers",
			"iDisplayLength": 30,
			"bSortClasses": false,
			"oSearch": {"sSearch": "", "bSmart": true, "bRegex": true},
			"sDom": '<"data-table-heading"if<"clear">><"data-table-paginav"p>t<"data-table-paginav"p>'
		}).columnFilter({
			aoColumns: [
				//null,
				null,
				{sSelector: "#datafilter-cities", type: "select"},
				{sSelector: "#datafilter-states", type: "select"},
				{sSelector: "#datafilter-countries", type: "select"},
				{sSelector: "#datafilter-years", type: "select"},
				null,
				{sSelector: "#datafilter-programs", type: "select"}
			]
		});
		$('.dataTables_filter input').attr({'placeholder': 'Keyword Search'});
		//remove text node 'Search' from generated label
		$('.dataTables_filter label').contents().filter(function() {
			return this.nodeType === 3;
		}).remove();

		this.$elReset = this.$elFiltersContainer.find('#datafilters-reset');
		this.$elFilters = this.$elFiltersContainer.find('select');
		this.$elSearch = null;

		this.bindEvents();

		if (this.$body.hasClass('custom-select-page')) {
			CustomApp.initialize();
		}

	},

	bindEvents: function() {
		var self = this;

		this.$elTable.on('click', 'button.clearall', function(e) {
			e.preventDefault();
			self.reset();
		});

		this.$elReset.on('click', function(e) {
			e.preventDefault();
			self.reset();
		});

		// this.$elSearch.on('keyup', function(e) {
		// self.search();
		// });

	},

	reset: function() {
		//this.$elSearch.val('');
		this.$elFilters.prop('selectedIndex',0);
		this.obTable.fnFilterClear();
		this.obTable.fnSort([[0,'asc']]);
		if (this.$body.hasClass('custom-select-page')) {
			CustomApp.$selects.change();
		}
	},

	search: function() {
		// TODO: custom search function
	}

};

module.exports = Application;
