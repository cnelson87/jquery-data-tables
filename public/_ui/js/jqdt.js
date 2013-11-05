;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){

var application = require('./Application');

$(function() {
	application.initialize();
});

},{"./Application":2}],2:[function(require,module,exports){

var getAjaxContent = require('./utilities/GetAjaxContent');

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
		//console.log('Application:initialize');
		var self = this;
		var $document = $(document);
		var $body = $('body');

		var $elTarget = $('#data-target');


	}

}

module.exports = Application;

},{"./utilities/GetAjaxContent":3}],3:[function(require,module,exports){

/**
*	returns an Ajax GET request using deferred, url is required, dataType is optional
**/
var GetAjaxContent = function(url, dataType) {
	return $.ajax({
		type: 'GET',
		url: url,
		dataType: dataType || 'json'
	});
};

module.exports = GetAjaxContent;

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL0FwcGxpY2F0aW9uLmpzIiwiL1VzZXJzL2Nocmlzbi9TaXRlcy9HaXRIdWIvY25lbHNvbjg3L2pxdWVyeS1kYXRhLXRhYmxlcy9zcmMvc2NyaXB0cy91dGlsaXRpZXMvR2V0QWpheENvbnRlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIlxudmFyIGFwcGxpY2F0aW9uID0gcmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHBsaWNhdGlvbi5pbml0aWFsaXplKCk7XG59KTtcbiIsIlxudmFyIGdldEFqYXhDb250ZW50ID0gcmVxdWlyZSgnLi91dGlsaXRpZXMvR2V0QWpheENvbnRlbnQnKTtcblxudmFyIEFwcGxpY2F0aW9uID0ge1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHQkLndoZW4oZ2V0QWpheENvbnRlbnQoJy9kYXRhL3RlcnJpdG9yaWVzLmpzb24nKSkuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0c2VsZi5idWlsZFRhYmxlKHJlc3BvbnNlKTtcblx0XHR9KS5mYWlsKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0fSk7XG5cblx0fSxcblxuXHRidWlsZFRhYmxlOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0Ly9jb25zb2xlLmxvZygnQXBwbGljYXRpb246aW5pdGlhbGl6ZScpO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG5cdFx0dmFyICRib2R5ID0gJCgnYm9keScpO1xuXG5cdFx0dmFyICRlbFRhcmdldCA9ICQoJyNkYXRhLXRhcmdldCcpO1xuXG5cblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb247XG4iLCJcbi8qKlxuKlx0cmV0dXJucyBhbiBBamF4IEdFVCByZXF1ZXN0IHVzaW5nIGRlZmVycmVkLCB1cmwgaXMgcmVxdWlyZWQsIGRhdGFUeXBlIGlzIG9wdGlvbmFsXG4qKi9cbnZhciBHZXRBamF4Q29udGVudCA9IGZ1bmN0aW9uKHVybCwgZGF0YVR5cGUpIHtcblx0cmV0dXJuICQuYWpheCh7XG5cdFx0dHlwZTogJ0dFVCcsXG5cdFx0dXJsOiB1cmwsXG5cdFx0ZGF0YVR5cGU6IGRhdGFUeXBlIHx8ICdqc29uJ1xuXHR9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2V0QWpheENvbnRlbnQ7XG4iXX0=
;