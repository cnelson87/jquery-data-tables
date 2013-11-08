
var Application = require('./Application');
var Test = require('./Test');

$(function() {
	var pageId = $('body').attr('id');
	switch(pageId) {
		case 'page-test':
			Test.initialize();
			break;
		default:
			Application.initialize();
	}

});
