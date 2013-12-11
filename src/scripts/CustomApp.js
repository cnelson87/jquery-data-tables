
var CustomSelect = require('./widgets/CustomSelect');

var CustomApp = {
	initialize: function() {
		var self = this;
		var $selects = $('#data-filters-container').find('select');

		console.log('CustomApp',$selects);

		for (var i=0, len = $selects.length; i<len; i++) {
			new CustomSelect($($selects[i]));
		}


	},

	search: function() {

	}

}

module.exports = CustomApp;
