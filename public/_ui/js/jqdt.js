;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){

var Application = require('./Application');

$(function() {
	Application.initialize();
});

},{"./Application":2}],2:[function(require,module,exports){

var getAjaxContent = require('./utilities/GetAjaxContent');
var templateDataTable = require('../templates/data-table.hbs');
var templateDataFilters = require('../templates/data-filters.hbs');
var templateNoResults = require('../templates/no-results.hbs');
var CustomApp = require('./CustomApp');

var Application = {
	initialize: function() {
		var self = this;

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
		var $body = $('body');
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
			// "fnDrawCallback": function( oSettings ) {
			// 	alert( 'DataTables has redrawn the table' );
			// },
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

		if ($body.hasClass('custom-select-page')) {
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
		// 	self.search();
		// });

	},

	reset: function() {
		//this.$elSearch.val('');
		this.$elFilters.prop('selectedIndex',0);
		this.obTable.fnFilterClear();
		this.obTable.fnSort([[0,'asc']]);
	},

	search: function() {

	}

}

module.exports = Application;

},{"../templates/data-table.hbs":3,"../templates/data-filters.hbs":4,"../templates/no-results.hbs":5,"./utilities/GetAjaxContent":6,"./CustomApp":7}],6:[function(require,module,exports){

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

},{}],7:[function(require,module,exports){

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

},{"./widgets/CustomSelect":8}],8:[function(require,module,exports){

var templateCustomSelect = require('../../templates/custom-select.hbs');

var CustomSelect = function($select, objOptions){

	this.$select = $select;
	this.$options = this.$select.children('option');
	this.$parent = this.$select.parent();
	this.$el = null;
	this.$label = null;
	this.$links = null;
	this.$current = null;

	this.template = null;

	this.options = $.extend({
		className: 'custom-select-container',
		selectorLabel: '.custom-select-label',
		selectorTemplate: '#tmpCustomSelect'
	}, objOptions || {});

	this._init();

};

CustomSelect.prototype = {

/**
*	Private Methods
**/
	_init: function(){
		var self = this;

		this.template = templateCustomSelect;

		this.$el = $('<div></div>',{
			'class': this.options.className,
			'tabindex': '-1'
		});

		this._buildData();

		this._bindEvents();

		this.render();

		this.$links = this.$el.find('a');
		this.$label = this.$el.find(this.options.selectorLabel);

	},

	_buildData: function(){
		var self = this;
		var index = this.getIndex();
		var label = this.getLabel();
		var $opt;

		this.obData = {
			//index: index,
			label: label,
			items: []
		};

		for (var i=0, len = this.$options.length; i<len; i++) {
			$opt = $(this.$options[i]);
			this.obData.items[i] = {
				rel: $opt.attr('value'),
				text: $opt.text(),
				//to set active...
				//active: i === index ? true : false //...too fancy
				active: false //...much simpler
			}
		}
		//...and more direct
		this.obData.items[index].active = true;

	},

	_bindEvents: function(){
		var self = this;

		this.$select
			.on('change', function(e){
				self.__onSelectChange(e);
			})
			.on('focus', function(e){
				self.__onSelectFocus(e);
			});

		this.$el
			.on('focusin', function(e){
				self.__onActive();
			})
			.on('focusout', function(e){
				self.__onInactive();
			})
			.on('mouseenter', function(e){
				self.__onActive();
			})
			.on('mouseleave', function(e){
				self.__onInactive();
			})
			.on('click', 'a', function(e){
				e.preventDefault();
				self.$current = $(this);
				self.__onClick(e);
			});

	},


/**
*	Event Handlers
**/

	__onSelectChange: function(e){
		//console.log('__onSelectChange');
		var val = this.$select.val();
		$.event.trigger('CustomSelect:selectChanged', [val]);
	},

	__onSelectFocus: function(e){
		//console.log('__onSelectFocus');
		this.$el.focus();
	},

	__onActive: function(e){
		//console.log('__onActive');
		this.$el.addClass('active');
	},

	__onInactive: function(e){
		//console.log('__onInactive');
		this.$el.removeClass('active');
	},

	__onClick: function(e){
		//console.log('__onClick');
		this.updateUI();
		this.__onInactive();
	},


/**
*	Public API
**/

	updateUI: function(){
		var val = this.$current.attr('rel');
		var text = this.$current.text();

		this.$label.text(text);

		this.$links.removeClass('active');
		this.$current.addClass('active');

		this.$select.val(val);
		this.$select.change();

	},

	getIndex: function(){
		return this.$select.prop('selectedIndex');
	},

	getLabel: function(){
		return this.$select.find('option:selected').text();
	},

	render: function(){
		// var html = Mustache.to_html(this.template, this.obData);
		// this.$el.html(html).appendTo(this.$parent);

		this.$el.html(this.template(this.obData)).appendTo(this.$parent);

		this.$select.addClass('replaced');
		return this.$el;
	}

};

module.exports = CustomSelect;

},{"../../templates/custom-select.hbs":9}],4:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n	<div id=\"datafilter-programs\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-years\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-cities\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-states\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-countries\" class=\"data-filter\"></div>\n\n	<button id=\"datafilters-reset\">Clear All Filters</button>\n";
  })
},{"handleify":10}],3:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n			<tr data-id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n				"
    + "\n				<td class=\"name\"><a href=\"/detailurl?id=";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (stack1 = helpers.Name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.Name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a></td>\n				<td>";
  if (stack1 = helpers.City) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.City; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</td>\n				<td>";
  if (stack1 = helpers.State) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.State; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</td>\n				<td class=\"hidden\">";
  if (stack1 = helpers.Country) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.Country; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</td>\n				<td class=\"year\">";
  if (stack1 = helpers.Year) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.Year; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</td>\n				<td class=\"num\"><span title=\"";
  if (stack1 = helpers.Amount) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.Amount; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (stack1 = helpers.AmountStr) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.AmountStr; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span></td>\n				<td class=\"program\">";
  if (stack1 = helpers.Program) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.Program; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</td>\n			</tr>\n			";
  return buffer;
  }

  buffer += "\n	<table>\n		<thead>\n			<tr>\n				"
    + "\n				<th class=\"name\">Name</th>\n				<th>City</th>\n				<th>State</th>\n				<th class=\"hidden\">Country</th>\n				<th class=\"year\">Year</th>\n				<th class=\"num\">Amount</th>\n				<th class=\"program\">Program</th>\n			</tr>\n		</thead>\n		<tfoot>\n			<tr>\n				"
    + "\n				<th class=\"name\">Name</th>\n				<th>City</th>\n				<th>State</th>\n				<th class=\"hidden\">Country</th>\n				<th class=\"year\">Year</th>\n				<th class=\"num\">Amount</th>\n				<th class=\"program\">Program</th>\n			</tr>\n		</tfoot>\n		<tbody>\n			";
  stack1 = helpers.each.call(depth0, depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</tbody>\n	</table>\n";
  return buffer;
  })
},{"handleify":10}],5:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"no-results\">\n	<p>Your selections have returned 0 results.</p>\n	<button class=\"clearall\">Clear All Filters</button>\n</div>";
  })
},{"handleify":10}],10:[function(require,module,exports){
module.exports = exports = require('handlebars/lib/handlebars/base.js').create()
require('handlebars/lib/handlebars/utils.js').attach(exports)
require('handlebars/lib/handlebars/runtime.js').attach(exports)
},{"handlebars/lib/handlebars/base.js":11,"handlebars/lib/handlebars/utils.js":12,"handlebars/lib/handlebars/runtime.js":13}],11:[function(require,module,exports){
/*jshint eqnull: true */

module.exports.create = function() {

var Handlebars = {};

// BEGIN(BROWSER)

Handlebars.VERSION = "1.0.0";
Handlebars.COMPILER_REVISION = 4;

Handlebars.REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};

Handlebars.helpers  = {};
Handlebars.partials = {};

var toString = Object.prototype.toString,
    functionType = '[object Function]',
    objectType = '[object Object]';

Handlebars.registerHelper = function(name, fn, inverse) {
  if (toString.call(name) === objectType) {
    if (inverse || fn) { throw new Handlebars.Exception('Arg not supported with multiple helpers'); }
    Handlebars.Utils.extend(this.helpers, name);
  } else {
    if (inverse) { fn.not = inverse; }
    this.helpers[name] = fn;
  }
};

Handlebars.registerPartial = function(name, str) {
  if (toString.call(name) === objectType) {
    Handlebars.Utils.extend(this.partials,  name);
  } else {
    this.partials[name] = str;
  }
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Missing helper: '" + arg + "'");
  }
});

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;

  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(conditional, options) {
  var type = toString.call(conditional);
  if(type === functionType) { conditional = conditional.call(this); }

  if(!conditional || Handlebars.Utils.isEmpty(conditional)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(conditional, options) {
  return Handlebars.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn});
});

Handlebars.registerHelper('with', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});

// END(BROWSER)

return Handlebars;
};

},{}],12:[function(require,module,exports){
exports.attach = function(Handlebars) {

var toString = Object.prototype.toString;

// BEGIN(BROWSER)

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

var escapeChar = function(chr) {
  return escape[chr] || "&amp;";
};

Handlebars.Utils = {
  extend: function(obj, value) {
    for(var key in value) {
      if(value.hasOwnProperty(key)) {
        obj[key] = value[key];
      }
    }
  },

  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    } else if (string == null || string === false) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = string.toString();

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  },

  isEmpty: function(value) {
    if (!value && value !== 0) {
      return true;
    } else if(toString.call(value) === "[object Array]" && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
};

// END(BROWSER)

return Handlebars;
};

},{}],13:[function(require,module,exports){
exports.attach = function(Handlebars) {

// BEGIN(BROWSER)

Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = Handlebars.VM.program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common) {
          ret = {};
          Handlebars.Utils.extend(ret, common);
          Handlebars.Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

      var compilerInfo = container.compilerInfo || [],
          compilerRevision = compilerInfo[0] || 1,
          currentRevision = Handlebars.COMPILER_REVISION;

      if (compilerRevision !== currentRevision) {
        if (compilerRevision < currentRevision) {
          var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
              compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
          throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
                "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
        } else {
          // Use the embedded version info since the runtime doesn't know about this revision yet
          throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
                "Please update your runtime to a newer version ("+compilerInfo[1]+").";
        }
      }

      return result;
    };
  },

  programWithDepth: function(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var program = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    program.program = i;
    program.depth = args.length;
    return program;
  },
  program: function(i, fn, data) {
    var program = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    program.program = i;
    program.depth = 0;
    return program;
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;

// END(BROWSER)

return Handlebars;

};

},{}],9:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n			<li><a href=\"#";
  if (stack1 = helpers.rel) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.rel; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" rel=\"";
  if (stack1 = helpers.rel) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.rel; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"";
  options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data};
  if (stack1 = helpers.active) { stack1 = stack1.call(depth0, options); }
  else { stack1 = depth0.active; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if (!helpers.active) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a></li>\n			";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "active";
  }

  buffer += "	<span class=\"custom-select-label\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n	<span class=\"custom-select-arrow\"></span>\n	<div class=\"custom-select-list\">\n		<ul>\n			";
  stack1 = helpers.each.call(depth0, depth0.items, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</ul>\n	</div>";
  return buffer;
  })
},{"handleify":10}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL0FwcGxpY2F0aW9uLmpzIiwiL1VzZXJzL2Nocmlzbi9TaXRlcy9HaXRIdWIvY25lbHNvbjg3L2pxdWVyeS1kYXRhLXRhYmxlcy9zcmMvc2NyaXB0cy91dGlsaXRpZXMvR2V0QWpheENvbnRlbnQuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL0N1c3RvbUFwcC5qcyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvc3JjL3NjcmlwdHMvd2lkZ2V0cy9DdXN0b21TZWxlY3QuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy90ZW1wbGF0ZXMvZGF0YS1maWx0ZXJzLmhicyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvc3JjL3RlbXBsYXRlcy9kYXRhLXRhYmxlLmhicyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvc3JjL3RlbXBsYXRlcy9uby1yZXN1bHRzLmhicyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ydW50aW1lLmpzIiwiL1VzZXJzL2Nocmlzbi9TaXRlcy9HaXRIdWIvY25lbHNvbjg3L2pxdWVyeS1kYXRhLXRhYmxlcy9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvc3JjL3RlbXBsYXRlcy9jdXN0b20tc2VsZWN0LmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIlxudmFyIEFwcGxpY2F0aW9uID0gcmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHRBcHBsaWNhdGlvbi5pbml0aWFsaXplKCk7XG59KTtcbiIsIlxudmFyIGdldEFqYXhDb250ZW50ID0gcmVxdWlyZSgnLi91dGlsaXRpZXMvR2V0QWpheENvbnRlbnQnKTtcbnZhciB0ZW1wbGF0ZURhdGFUYWJsZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9kYXRhLXRhYmxlLmhicycpO1xudmFyIHRlbXBsYXRlRGF0YUZpbHRlcnMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvZGF0YS1maWx0ZXJzLmhicycpO1xudmFyIHRlbXBsYXRlTm9SZXN1bHRzID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL25vLXJlc3VsdHMuaGJzJyk7XG52YXIgQ3VzdG9tQXBwID0gcmVxdWlyZSgnLi9DdXN0b21BcHAnKTtcblxudmFyIEFwcGxpY2F0aW9uID0ge1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLiRlbENvbnRhaW5lciA9ICQoJyNkYXRhLXRhYmxlLWNvbnRhaW5lcicpO1xuXHRcdHRoaXMuJGVsRmlsdGVyc0NvbnRhaW5lciA9ICQoJyNkYXRhLWZpbHRlcnMtY29udGFpbmVyJyk7XG5cdFx0dGhpcy4kZWxUYWJsZSA9IG51bGw7XG5cdFx0dGhpcy4kZWxSZXNldCA9IG51bGw7XG5cdFx0dGhpcy4kZWxGaWx0ZXJzID0gbnVsbDtcblx0XHR0aGlzLiRlbFNlYXJjaCA9IG51bGw7XG5cblx0XHR0aGlzLmRhdGFVcmwgPSAnL2RhdGEvZ3JhbnRlZWxpc3QuanNvbic7XG5cdFx0dGhpcy5vYlRhYmxlID0gbnVsbDtcblx0XHR0aGlzLm9iRGF0YSA9IG51bGw7XG5cblx0XHR0aGlzLmdldERhdGEoKTtcblxuXHR9LFxuXG5cdGdldERhdGE6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdCQud2hlbihnZXRBamF4Q29udGVudCh0aGlzLmRhdGFVcmwpKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRzZWxmLm9iRGF0YSA9IHJlc3BvbnNlO1xuXHRcdFx0c2VsZi5idWlsZFRhYmxlKCk7XG5cdFx0fSkuZmFpbChmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdH0pO1xuXG5cdH0sXG5cblx0YnVpbGRUYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciAkYm9keSA9ICQoJ2JvZHknKTtcblx0XHR2YXIgdG1wbERhdGFGaWx0ZXJzID0gdGVtcGxhdGVEYXRhRmlsdGVycztcblx0XHR2YXIgdG1wbERhdGFUYWJsZSA9IHRlbXBsYXRlRGF0YVRhYmxlO1xuXHRcdHZhciB0bXBsZU5vUmVzdWx0cyA9IHRlbXBsYXRlTm9SZXN1bHRzO1xuXG5cdFx0dGhpcy4kZWxDb250YWluZXIuaHRtbCh0bXBsRGF0YVRhYmxlKHRoaXMub2JEYXRhKSk7XG5cdFx0dGhpcy4kZWxGaWx0ZXJzQ29udGFpbmVyLmh0bWwodG1wbERhdGFGaWx0ZXJzKCkpO1xuXHRcdHRoaXMuJGVsVGFibGUgPSB0aGlzLiRlbENvbnRhaW5lci5maW5kKCd0YWJsZScpO1xuXG5cdFx0dGhpcy5vYlRhYmxlID0gdGhpcy4kZWxUYWJsZS5kYXRhVGFibGUoe1xuXHRcdFx0XCJhb0NvbHVtbkRlZnNcIjogW1xuXHRcdFx0XHR7XCJzVHlwZVwiOiBcInRpdGxlLW51bWVyaWNcIiwgXCJhVGFyZ2V0c1wiOiBbNV19XG5cdFx0XHRdLFxuXHRcdFx0XCJvTGFuZ3VhZ2VcIjoge1xuXHRcdFx0XHRcInNaZXJvUmVjb3Jkc1wiOiB0bXBsZU5vUmVzdWx0cygpXG5cdFx0XHR9LFxuXHRcdFx0Ly8gXCJmbkRyYXdDYWxsYmFja1wiOiBmdW5jdGlvbiggb1NldHRpbmdzICkge1xuXHRcdFx0Ly8gXHRhbGVydCggJ0RhdGFUYWJsZXMgaGFzIHJlZHJhd24gdGhlIHRhYmxlJyApO1xuXHRcdFx0Ly8gfSxcblx0XHRcdFwic1BhZ2luYXRpb25UeXBlXCI6IFwiZnVsbF9udW1iZXJzXCIsXG5cdFx0XHRcImlEaXNwbGF5TGVuZ3RoXCI6IDMwLFxuXHRcdFx0XCJiU29ydENsYXNzZXNcIjogZmFsc2UsXG5cdFx0XHRcIm9TZWFyY2hcIjoge1wic1NlYXJjaFwiOiBcIlwiLCBcImJTbWFydFwiOiB0cnVlLCBcImJSZWdleFwiOiB0cnVlfSxcblx0XHRcdFwic0RvbVwiOiAnPFwiZGF0YS10YWJsZS1oZWFkaW5nXCJpZjxcImNsZWFyXCI+PjxcImRhdGEtdGFibGUtcGFnaW5hdlwicD50PFwiZGF0YS10YWJsZS1wYWdpbmF2XCJwPidcblx0XHR9KS5jb2x1bW5GaWx0ZXIoe1xuXHRcdFx0YW9Db2x1bW5zOiBbXG5cdFx0XHRcdC8vbnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0e3NTZWxlY3RvcjogXCIjZGF0YWZpbHRlci1jaXRpZXNcIiwgdHlwZTogXCJzZWxlY3RcIn0sXG5cdFx0XHRcdHtzU2VsZWN0b3I6IFwiI2RhdGFmaWx0ZXItc3RhdGVzXCIsIHR5cGU6IFwic2VsZWN0XCJ9LFxuXHRcdFx0XHR7c1NlbGVjdG9yOiBcIiNkYXRhZmlsdGVyLWNvdW50cmllc1wiLCB0eXBlOiBcInNlbGVjdFwifSxcblx0XHRcdFx0e3NTZWxlY3RvcjogXCIjZGF0YWZpbHRlci15ZWFyc1wiLCB0eXBlOiBcInNlbGVjdFwifSxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0e3NTZWxlY3RvcjogXCIjZGF0YWZpbHRlci1wcm9ncmFtc1wiLCB0eXBlOiBcInNlbGVjdFwifVxuXHRcdFx0XVxuXHRcdH0pO1xuXHRcdCQoJy5kYXRhVGFibGVzX2ZpbHRlciBpbnB1dCcpLmF0dHIoeydwbGFjZWhvbGRlcic6ICdLZXl3b3JkIFNlYXJjaCd9KTtcblx0XHQvL3JlbW92ZSB0ZXh0IG5vZGUgJ1NlYXJjaCcgZnJvbSBnZW5lcmF0ZWQgbGFiZWxcblx0XHQkKCcuZGF0YVRhYmxlc19maWx0ZXIgbGFiZWwnKS5jb250ZW50cygpLmZpbHRlcihmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm5vZGVUeXBlID09PSAzO1xuXHRcdH0pLnJlbW92ZSgpO1xuXG5cdFx0dGhpcy4kZWxSZXNldCA9IHRoaXMuJGVsRmlsdGVyc0NvbnRhaW5lci5maW5kKCcjZGF0YWZpbHRlcnMtcmVzZXQnKTtcblx0XHR0aGlzLiRlbEZpbHRlcnMgPSB0aGlzLiRlbEZpbHRlcnNDb250YWluZXIuZmluZCgnc2VsZWN0Jyk7XG5cdFx0dGhpcy4kZWxTZWFyY2ggPSBudWxsO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cblx0XHRpZiAoJGJvZHkuaGFzQ2xhc3MoJ2N1c3RvbS1zZWxlY3QtcGFnZScpKSB7XG5cdFx0XHRDdXN0b21BcHAuaW5pdGlhbGl6ZSgpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMuJGVsVGFibGUub24oJ2NsaWNrJywgJ2J1dHRvbi5jbGVhcmFsbCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHNlbGYucmVzZXQoKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuJGVsUmVzZXQub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0c2VsZi5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gdGhpcy4kZWxTZWFyY2gub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuXHRcdC8vIFx0c2VsZi5zZWFyY2goKTtcblx0XHQvLyB9KTtcblxuXHR9LFxuXG5cdHJlc2V0OiBmdW5jdGlvbigpIHtcblx0XHQvL3RoaXMuJGVsU2VhcmNoLnZhbCgnJyk7XG5cdFx0dGhpcy4kZWxGaWx0ZXJzLnByb3AoJ3NlbGVjdGVkSW5kZXgnLDApO1xuXHRcdHRoaXMub2JUYWJsZS5mbkZpbHRlckNsZWFyKCk7XG5cdFx0dGhpcy5vYlRhYmxlLmZuU29ydChbWzAsJ2FzYyddXSk7XG5cdH0sXG5cblx0c2VhcmNoOiBmdW5jdGlvbigpIHtcblxuXHR9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjtcbiIsIlxuLyoqXG4qXHRyZXR1cm5zIGFuIEFqYXggR0VUIHJlcXVlc3QgdXNpbmcgZGVmZXJyZWQsIHVybCBpcyByZXF1aXJlZCwgZGF0YVR5cGUgaXMgb3B0aW9uYWxcbioqL1xudmFyIEdldEFqYXhDb250ZW50ID0gZnVuY3Rpb24odXJsLCBkYXRhVHlwZSkge1xuXHRyZXR1cm4gJC5hamF4KHtcblx0XHR0eXBlOiAnR0VUJyxcblx0XHR1cmw6IHVybCxcblx0XHRkYXRhVHlwZTogZGF0YVR5cGUgfHwgJ2pzb24nXG5cdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZXRBamF4Q29udGVudDtcbiIsIlxudmFyIEN1c3RvbVNlbGVjdCA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9DdXN0b21TZWxlY3QnKTtcblxudmFyIEN1c3RvbUFwcCA9IHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciAkc2VsZWN0cyA9ICQoJyNkYXRhLWZpbHRlcnMtY29udGFpbmVyJykuZmluZCgnc2VsZWN0Jyk7XG5cblx0XHRjb25zb2xlLmxvZygnQ3VzdG9tQXBwJywkc2VsZWN0cyk7XG5cblx0XHRmb3IgKHZhciBpPTAsIGxlbiA9ICRzZWxlY3RzLmxlbmd0aDsgaTxsZW47IGkrKykge1xuXHRcdFx0bmV3IEN1c3RvbVNlbGVjdCgkKCRzZWxlY3RzW2ldKSk7XG5cdFx0fVxuXG5cblx0fSxcblxuXHRzZWFyY2g6IGZ1bmN0aW9uKCkge1xuXG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEN1c3RvbUFwcDtcbiIsIlxudmFyIHRlbXBsYXRlQ3VzdG9tU2VsZWN0ID0gcmVxdWlyZSgnLi4vLi4vdGVtcGxhdGVzL2N1c3RvbS1zZWxlY3QuaGJzJyk7XG5cbnZhciBDdXN0b21TZWxlY3QgPSBmdW5jdGlvbigkc2VsZWN0LCBvYmpPcHRpb25zKXtcblxuXHR0aGlzLiRzZWxlY3QgPSAkc2VsZWN0O1xuXHR0aGlzLiRvcHRpb25zID0gdGhpcy4kc2VsZWN0LmNoaWxkcmVuKCdvcHRpb24nKTtcblx0dGhpcy4kcGFyZW50ID0gdGhpcy4kc2VsZWN0LnBhcmVudCgpO1xuXHR0aGlzLiRlbCA9IG51bGw7XG5cdHRoaXMuJGxhYmVsID0gbnVsbDtcblx0dGhpcy4kbGlua3MgPSBudWxsO1xuXHR0aGlzLiRjdXJyZW50ID0gbnVsbDtcblxuXHR0aGlzLnRlbXBsYXRlID0gbnVsbDtcblxuXHR0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7XG5cdFx0Y2xhc3NOYW1lOiAnY3VzdG9tLXNlbGVjdC1jb250YWluZXInLFxuXHRcdHNlbGVjdG9yTGFiZWw6ICcuY3VzdG9tLXNlbGVjdC1sYWJlbCcsXG5cdFx0c2VsZWN0b3JUZW1wbGF0ZTogJyN0bXBDdXN0b21TZWxlY3QnXG5cdH0sIG9iak9wdGlvbnMgfHwge30pO1xuXG5cdHRoaXMuX2luaXQoKTtcblxufTtcblxuQ3VzdG9tU2VsZWN0LnByb3RvdHlwZSA9IHtcblxuLyoqXG4qXHRQcml2YXRlIE1ldGhvZHNcbioqL1xuXHRfaW5pdDogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGVDdXN0b21TZWxlY3Q7XG5cblx0XHR0aGlzLiRlbCA9ICQoJzxkaXY+PC9kaXY+Jyx7XG5cdFx0XHQnY2xhc3MnOiB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lLFxuXHRcdFx0J3RhYmluZGV4JzogJy0xJ1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5fYnVpbGREYXRhKCk7XG5cblx0XHR0aGlzLl9iaW5kRXZlbnRzKCk7XG5cblx0XHR0aGlzLnJlbmRlcigpO1xuXG5cdFx0dGhpcy4kbGlua3MgPSB0aGlzLiRlbC5maW5kKCdhJyk7XG5cdFx0dGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5maW5kKHRoaXMub3B0aW9ucy5zZWxlY3RvckxhYmVsKTtcblxuXHR9LFxuXG5cdF9idWlsZERhdGE6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBpbmRleCA9IHRoaXMuZ2V0SW5kZXgoKTtcblx0XHR2YXIgbGFiZWwgPSB0aGlzLmdldExhYmVsKCk7XG5cdFx0dmFyICRvcHQ7XG5cblx0XHR0aGlzLm9iRGF0YSA9IHtcblx0XHRcdC8vaW5kZXg6IGluZGV4LFxuXHRcdFx0bGFiZWw6IGxhYmVsLFxuXHRcdFx0aXRlbXM6IFtdXG5cdFx0fTtcblxuXHRcdGZvciAodmFyIGk9MCwgbGVuID0gdGhpcy4kb3B0aW9ucy5sZW5ndGg7IGk8bGVuOyBpKyspIHtcblx0XHRcdCRvcHQgPSAkKHRoaXMuJG9wdGlvbnNbaV0pO1xuXHRcdFx0dGhpcy5vYkRhdGEuaXRlbXNbaV0gPSB7XG5cdFx0XHRcdHJlbDogJG9wdC5hdHRyKCd2YWx1ZScpLFxuXHRcdFx0XHR0ZXh0OiAkb3B0LnRleHQoKSxcblx0XHRcdFx0Ly90byBzZXQgYWN0aXZlLi4uXG5cdFx0XHRcdC8vYWN0aXZlOiBpID09PSBpbmRleCA/IHRydWUgOiBmYWxzZSAvLy4uLnRvbyBmYW5jeVxuXHRcdFx0XHRhY3RpdmU6IGZhbHNlIC8vLi4ubXVjaCBzaW1wbGVyXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vLi4uYW5kIG1vcmUgZGlyZWN0XG5cdFx0dGhpcy5vYkRhdGEuaXRlbXNbaW5kZXhdLmFjdGl2ZSA9IHRydWU7XG5cblx0fSxcblxuXHRfYmluZEV2ZW50czogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLiRzZWxlY3Rcblx0XHRcdC5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHNlbGYuX19vblNlbGVjdENoYW5nZShlKTtcblx0XHRcdH0pXG5cdFx0XHQub24oJ2ZvY3VzJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHNlbGYuX19vblNlbGVjdEZvY3VzKGUpO1xuXHRcdFx0fSk7XG5cblx0XHR0aGlzLiRlbFxuXHRcdFx0Lm9uKCdmb2N1c2luJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHNlbGYuX19vbkFjdGl2ZSgpO1xuXHRcdFx0fSlcblx0XHRcdC5vbignZm9jdXNvdXQnLCBmdW5jdGlvbihlKXtcblx0XHRcdFx0c2VsZi5fX29uSW5hY3RpdmUoKTtcblx0XHRcdH0pXG5cdFx0XHQub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbihlKXtcblx0XHRcdFx0c2VsZi5fX29uQWN0aXZlKCk7XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHNlbGYuX19vbkluYWN0aXZlKCk7XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0c2VsZi4kY3VycmVudCA9ICQodGhpcyk7XG5cdFx0XHRcdHNlbGYuX19vbkNsaWNrKGUpO1xuXHRcdFx0fSk7XG5cblx0fSxcblxuXG4vKipcbipcdEV2ZW50IEhhbmRsZXJzXG4qKi9cblxuXHRfX29uU2VsZWN0Q2hhbmdlOiBmdW5jdGlvbihlKXtcblx0XHQvL2NvbnNvbGUubG9nKCdfX29uU2VsZWN0Q2hhbmdlJyk7XG5cdFx0dmFyIHZhbCA9IHRoaXMuJHNlbGVjdC52YWwoKTtcblx0XHQkLmV2ZW50LnRyaWdnZXIoJ0N1c3RvbVNlbGVjdDpzZWxlY3RDaGFuZ2VkJywgW3ZhbF0pO1xuXHR9LFxuXG5cdF9fb25TZWxlY3RGb2N1czogZnVuY3Rpb24oZSl7XG5cdFx0Ly9jb25zb2xlLmxvZygnX19vblNlbGVjdEZvY3VzJyk7XG5cdFx0dGhpcy4kZWwuZm9jdXMoKTtcblx0fSxcblxuXHRfX29uQWN0aXZlOiBmdW5jdGlvbihlKXtcblx0XHQvL2NvbnNvbGUubG9nKCdfX29uQWN0aXZlJyk7XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHR9LFxuXG5cdF9fb25JbmFjdGl2ZTogZnVuY3Rpb24oZSl7XG5cdFx0Ly9jb25zb2xlLmxvZygnX19vbkluYWN0aXZlJyk7XG5cdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHR9LFxuXG5cdF9fb25DbGljazogZnVuY3Rpb24oZSl7XG5cdFx0Ly9jb25zb2xlLmxvZygnX19vbkNsaWNrJyk7XG5cdFx0dGhpcy51cGRhdGVVSSgpO1xuXHRcdHRoaXMuX19vbkluYWN0aXZlKCk7XG5cdH0sXG5cblxuLyoqXG4qXHRQdWJsaWMgQVBJXG4qKi9cblxuXHR1cGRhdGVVSTogZnVuY3Rpb24oKXtcblx0XHR2YXIgdmFsID0gdGhpcy4kY3VycmVudC5hdHRyKCdyZWwnKTtcblx0XHR2YXIgdGV4dCA9IHRoaXMuJGN1cnJlbnQudGV4dCgpO1xuXG5cdFx0dGhpcy4kbGFiZWwudGV4dCh0ZXh0KTtcblxuXHRcdHRoaXMuJGxpbmtzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHR0aGlzLiRjdXJyZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcblxuXHRcdHRoaXMuJHNlbGVjdC52YWwodmFsKTtcblx0XHR0aGlzLiRzZWxlY3QuY2hhbmdlKCk7XG5cblx0fSxcblxuXHRnZXRJbmRleDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy4kc2VsZWN0LnByb3AoJ3NlbGVjdGVkSW5kZXgnKTtcblx0fSxcblxuXHRnZXRMYWJlbDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy4kc2VsZWN0LmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLnRleHQoKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0Ly8gdmFyIGh0bWwgPSBNdXN0YWNoZS50b19odG1sKHRoaXMudGVtcGxhdGUsIHRoaXMub2JEYXRhKTtcblx0XHQvLyB0aGlzLiRlbC5odG1sKGh0bWwpLmFwcGVuZFRvKHRoaXMuJHBhcmVudCk7XG5cblx0XHR0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUodGhpcy5vYkRhdGEpKS5hcHBlbmRUbyh0aGlzLiRwYXJlbnQpO1xuXG5cdFx0dGhpcy4kc2VsZWN0LmFkZENsYXNzKCdyZXBsYWNlZCcpO1xuXHRcdHJldHVybiB0aGlzLiRlbDtcblx0fVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEN1c3RvbVNlbGVjdDtcbiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiXFxuXHQ8ZGl2IGlkPVxcXCJkYXRhZmlsdGVyLXByb2dyYW1zXFxcIiBjbGFzcz1cXFwiZGF0YS1maWx0ZXJcXFwiPjwvZGl2Plxcblxcblx0PGRpdiBpZD1cXFwiZGF0YWZpbHRlci15ZWFyc1xcXCIgY2xhc3M9XFxcImRhdGEtZmlsdGVyXFxcIj48L2Rpdj5cXG5cXG5cdDxkaXYgaWQ9XFxcImRhdGFmaWx0ZXItY2l0aWVzXFxcIiBjbGFzcz1cXFwiZGF0YS1maWx0ZXJcXFwiPjwvZGl2Plxcblxcblx0PGRpdiBpZD1cXFwiZGF0YWZpbHRlci1zdGF0ZXNcXFwiIGNsYXNzPVxcXCJkYXRhLWZpbHRlclxcXCI+PC9kaXY+XFxuXFxuXHQ8ZGl2IGlkPVxcXCJkYXRhZmlsdGVyLWNvdW50cmllc1xcXCIgY2xhc3M9XFxcImRhdGEtZmlsdGVyXFxcIj48L2Rpdj5cXG5cXG5cdDxidXR0b24gaWQ9XFxcImRhdGFmaWx0ZXJzLXJlc2V0XFxcIj5DbGVhciBBbGwgRmlsdGVyczwvYnV0dG9uPlxcblwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8dHIgZGF0YS1pZD1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmlkKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pZDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XCJcbiAgICArIFwiXFxuXHRcdFx0XHQ8dGQgY2xhc3M9XFxcIm5hbWVcXFwiPjxhIGhyZWY9XFxcIi9kZXRhaWx1cmw/aWQ9XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmlkKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pZDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5OYW1lKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5OYW1lOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvYT48L3RkPlxcblx0XHRcdFx0PHRkPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5DaXR5KSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5DaXR5OyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvdGQ+XFxuXHRcdFx0XHQ8dGQ+XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLlN0YXRlKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5TdGF0ZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3RkPlxcblx0XHRcdFx0PHRkIGNsYXNzPVxcXCJoaWRkZW5cXFwiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5Db3VudHJ5KSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5Db3VudHJ5OyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvdGQ+XFxuXHRcdFx0XHQ8dGQgY2xhc3M9XFxcInllYXJcXFwiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5ZZWFyKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5ZZWFyOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvdGQ+XFxuXHRcdFx0XHQ8dGQgY2xhc3M9XFxcIm51bVxcXCI+PHNwYW4gdGl0bGU9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5BbW91bnQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLkFtb3VudDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5BbW91bnRTdHIpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLkFtb3VudFN0cjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3NwYW4+PC90ZD5cXG5cdFx0XHRcdDx0ZCBjbGFzcz1cXFwicHJvZ3JhbVxcXCI+XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLlByb2dyYW0pIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLlByb2dyYW07IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC90ZD5cXG5cdFx0XHQ8L3RyPlxcblx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiXFxuXHQ8dGFibGU+XFxuXHRcdDx0aGVhZD5cXG5cdFx0XHQ8dHI+XFxuXHRcdFx0XHRcIlxuICAgICsgXCJcXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwibmFtZVxcXCI+TmFtZTwvdGg+XFxuXHRcdFx0XHQ8dGg+Q2l0eTwvdGg+XFxuXHRcdFx0XHQ8dGg+U3RhdGU8L3RoPlxcblx0XHRcdFx0PHRoIGNsYXNzPVxcXCJoaWRkZW5cXFwiPkNvdW50cnk8L3RoPlxcblx0XHRcdFx0PHRoIGNsYXNzPVxcXCJ5ZWFyXFxcIj5ZZWFyPC90aD5cXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwibnVtXFxcIj5BbW91bnQ8L3RoPlxcblx0XHRcdFx0PHRoIGNsYXNzPVxcXCJwcm9ncmFtXFxcIj5Qcm9ncmFtPC90aD5cXG5cdFx0XHQ8L3RyPlxcblx0XHQ8L3RoZWFkPlxcblx0XHQ8dGZvb3Q+XFxuXHRcdFx0PHRyPlxcblx0XHRcdFx0XCJcbiAgICArIFwiXFxuXHRcdFx0XHQ8dGggY2xhc3M9XFxcIm5hbWVcXFwiPk5hbWU8L3RoPlxcblx0XHRcdFx0PHRoPkNpdHk8L3RoPlxcblx0XHRcdFx0PHRoPlN0YXRlPC90aD5cXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwiaGlkZGVuXFxcIj5Db3VudHJ5PC90aD5cXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwieWVhclxcXCI+WWVhcjwvdGg+XFxuXHRcdFx0XHQ8dGggY2xhc3M9XFxcIm51bVxcXCI+QW1vdW50PC90aD5cXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwicHJvZ3JhbVxcXCI+UHJvZ3JhbTwvdGg+XFxuXHRcdFx0PC90cj5cXG5cdFx0PC90Zm9vdD5cXG5cdFx0PHRib2R5Plxcblx0XHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L3Rib2R5Plxcblx0PC90YWJsZT5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIm5vLXJlc3VsdHNcXFwiPlxcblx0PHA+WW91ciBzZWxlY3Rpb25zIGhhdmUgcmV0dXJuZWQgMCByZXN1bHRzLjwvcD5cXG5cdDxidXR0b24gY2xhc3M9XFxcImNsZWFyYWxsXFxcIj5DbGVhciBBbGwgRmlsdGVyczwvYnV0dG9uPlxcbjwvZGl2PlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGJsb2NrSGVscGVyTWlzc2luZz1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIG9wdGlvbnM7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDxsaT48YSBocmVmPVxcXCIjXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAucmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgcmVsPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMucmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5yZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwiXCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMiwgcHJvZ3JhbTIsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmFjdGl2ZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIG9wdGlvbnMpOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuYWN0aXZlOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZiAoIWhlbHBlcnMuYWN0aXZlKSB7IHN0YWNrMSA9IGJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgc3RhY2sxLCBvcHRpb25zKTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMudGV4dCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAudGV4dDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L2E+PC9saT5cXG5cdFx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJhY3RpdmVcIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlx0PHNwYW4gY2xhc3M9XFxcImN1c3RvbS1zZWxlY3QtbGFiZWxcXFwiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9zcGFuPlxcblx0PHNwYW4gY2xhc3M9XFxcImN1c3RvbS1zZWxlY3QtYXJyb3dcXFwiPjwvc3Bhbj5cXG5cdDxkaXYgY2xhc3M9XFxcImN1c3RvbS1zZWxlY3QtbGlzdFxcXCI+XFxuXHRcdDx1bD5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXRlbXMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0PC91bD5cXG5cdDwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSJdfQ==
;