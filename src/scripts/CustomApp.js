
var CustomSelect = require('./widgets/CustomSelect');

var CustomApp = {
	initialize: function() {
		var self = this;

		this.$selects = $('#data-filters-container').find('select');

		for (var i=0, len = this.$selects.length; i<len; i++) {
			new CustomSelect($(this.$selects[i]));
		}

	}

};

module.exports = CustomApp;
