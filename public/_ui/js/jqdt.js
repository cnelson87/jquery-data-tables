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
		// 	self.search();
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

		this.$selects = $('#data-filters-container').find('select');

		for (var i=0, len = this.$selects.length; i<len; i++) {
			new CustomSelect($(this.$selects[i]));
		}

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
	this.$links = null;
	this.$current = null;
	this.$label = null;

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
		this.$current = $(this.$links[0]);
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
			// .on('mouseenter', function(e){
			// 	self.__onActive();
			// })
			// .on('mouseleave', function(e){
			// 	self.__onInactive();
			// })
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
		console.log('__onSelectChange');
		var index = this.getIndex();
		var val = this.getValue();
		var $current = $(this.$links[index]);
		if ($current[0] !== this.$current[0]) {
			$current.click();
		}
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
		var val = this.getValue();
		var rel = this.$current.attr('rel');
		var text = this.$current.text();

		this.$label.text(text);

		this.$links.removeClass('active');
		this.$current.addClass('active');

		if (rel !== val) {
			this.$select.val(rel);
			this.$select.change();
		}

	},

	getIndex: function(){
		return this.$select.prop('selectedIndex');
	},

	getLabel: function(){
		return this.$select.find('option:selected').text();
	},

	getValue: function(){
		return this.$select.val();
	},

	render: function(){
		this.$el.html(this.template(this.obData)).appendTo(this.$parent);
		this.$select.addClass('replaced');
		return this.$el;
	}

};

module.exports = CustomSelect;

},{"../../templates/custom-select.hbs":9}],3:[function(require,module,exports){
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
},{"handleify":10}],4:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n	<div id=\"datafilter-programs\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-years\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-cities\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-states\" class=\"data-filter\"></div>\n\n	<div id=\"datafilter-countries\" class=\"data-filter\"></div>\n\n	<button id=\"datafilters-reset\">Clear All Filters</button>\n";
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL0FwcGxpY2F0aW9uLmpzIiwiL1VzZXJzL2Nocmlzbi9TaXRlcy9HaXRIdWIvY25lbHNvbjg3L2pxdWVyeS1kYXRhLXRhYmxlcy9zcmMvc2NyaXB0cy91dGlsaXRpZXMvR2V0QWpheENvbnRlbnQuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy9zY3JpcHRzL0N1c3RvbUFwcC5qcyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvc3JjL3NjcmlwdHMvd2lkZ2V0cy9DdXN0b21TZWxlY3QuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy90ZW1wbGF0ZXMvZGF0YS10YWJsZS5oYnMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy90ZW1wbGF0ZXMvbm8tcmVzdWx0cy5oYnMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL3NyYy90ZW1wbGF0ZXMvZGF0YS1maWx0ZXJzLmhicyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ydW50aW1lLmpzIiwiL1VzZXJzL2Nocmlzbi9TaXRlcy9HaXRIdWIvY25lbHNvbjg3L2pxdWVyeS1kYXRhLXRhYmxlcy9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXNuL1NpdGVzL0dpdEh1Yi9jbmVsc29uODcvanF1ZXJ5LWRhdGEtdGFibGVzL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpc24vU2l0ZXMvR2l0SHViL2NuZWxzb244Ny9qcXVlcnktZGF0YS10YWJsZXMvc3JjL3RlbXBsYXRlcy9jdXN0b20tc2VsZWN0LmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIlxudmFyIEFwcGxpY2F0aW9uID0gcmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHRBcHBsaWNhdGlvbi5pbml0aWFsaXplKCk7XG59KTtcbiIsIlxudmFyIGdldEFqYXhDb250ZW50ID0gcmVxdWlyZSgnLi91dGlsaXRpZXMvR2V0QWpheENvbnRlbnQnKTtcbnZhciB0ZW1wbGF0ZURhdGFUYWJsZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9kYXRhLXRhYmxlLmhicycpO1xudmFyIHRlbXBsYXRlRGF0YUZpbHRlcnMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvZGF0YS1maWx0ZXJzLmhicycpO1xudmFyIHRlbXBsYXRlTm9SZXN1bHRzID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL25vLXJlc3VsdHMuaGJzJyk7XG52YXIgQ3VzdG9tQXBwID0gcmVxdWlyZSgnLi9DdXN0b21BcHAnKTtcblxudmFyIEFwcGxpY2F0aW9uID0ge1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLiRib2R5ID0gJCgnYm9keScpO1xuXHRcdHRoaXMuJGVsQ29udGFpbmVyID0gJCgnI2RhdGEtdGFibGUtY29udGFpbmVyJyk7XG5cdFx0dGhpcy4kZWxGaWx0ZXJzQ29udGFpbmVyID0gJCgnI2RhdGEtZmlsdGVycy1jb250YWluZXInKTtcblx0XHR0aGlzLiRlbFRhYmxlID0gbnVsbDtcblx0XHR0aGlzLiRlbFJlc2V0ID0gbnVsbDtcblx0XHR0aGlzLiRlbEZpbHRlcnMgPSBudWxsO1xuXHRcdHRoaXMuJGVsU2VhcmNoID0gbnVsbDtcblxuXHRcdHRoaXMuZGF0YVVybCA9ICcvZGF0YS9ncmFudGVlbGlzdC5qc29uJztcblx0XHR0aGlzLm9iVGFibGUgPSBudWxsO1xuXHRcdHRoaXMub2JEYXRhID0gbnVsbDtcblxuXHRcdHRoaXMuZ2V0RGF0YSgpO1xuXG5cdH0sXG5cblx0Z2V0RGF0YTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0JC53aGVuKGdldEFqYXhDb250ZW50KHRoaXMuZGF0YVVybCkpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdHNlbGYub2JEYXRhID0gcmVzcG9uc2U7XG5cdFx0XHRzZWxmLmJ1aWxkVGFibGUoKTtcblx0XHR9KS5mYWlsKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0fSk7XG5cblx0fSxcblxuXHRidWlsZFRhYmxlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIHRtcGxEYXRhRmlsdGVycyA9IHRlbXBsYXRlRGF0YUZpbHRlcnM7XG5cdFx0dmFyIHRtcGxEYXRhVGFibGUgPSB0ZW1wbGF0ZURhdGFUYWJsZTtcblx0XHR2YXIgdG1wbGVOb1Jlc3VsdHMgPSB0ZW1wbGF0ZU5vUmVzdWx0cztcblxuXHRcdHRoaXMuJGVsQ29udGFpbmVyLmh0bWwodG1wbERhdGFUYWJsZSh0aGlzLm9iRGF0YSkpO1xuXHRcdHRoaXMuJGVsRmlsdGVyc0NvbnRhaW5lci5odG1sKHRtcGxEYXRhRmlsdGVycygpKTtcblx0XHR0aGlzLiRlbFRhYmxlID0gdGhpcy4kZWxDb250YWluZXIuZmluZCgndGFibGUnKTtcblxuXHRcdHRoaXMub2JUYWJsZSA9IHRoaXMuJGVsVGFibGUuZGF0YVRhYmxlKHtcblx0XHRcdFwiYW9Db2x1bW5EZWZzXCI6IFtcblx0XHRcdFx0e1wic1R5cGVcIjogXCJ0aXRsZS1udW1lcmljXCIsIFwiYVRhcmdldHNcIjogWzVdfVxuXHRcdFx0XSxcblx0XHRcdFwib0xhbmd1YWdlXCI6IHtcblx0XHRcdFx0XCJzWmVyb1JlY29yZHNcIjogdG1wbGVOb1Jlc3VsdHMoKVxuXHRcdFx0fSxcblx0XHRcdC8vIFwiZm5EcmF3Q2FsbGJhY2tcIjogZnVuY3Rpb24oIG9TZXR0aW5ncyApIHtcblx0XHRcdC8vIFx0YWxlcnQoICdEYXRhVGFibGVzIGhhcyByZWRyYXduIHRoZSB0YWJsZScgKTtcblx0XHRcdC8vIH0sXG5cdFx0XHRcInNQYWdpbmF0aW9uVHlwZVwiOiBcImZ1bGxfbnVtYmVyc1wiLFxuXHRcdFx0XCJpRGlzcGxheUxlbmd0aFwiOiAzMCxcblx0XHRcdFwiYlNvcnRDbGFzc2VzXCI6IGZhbHNlLFxuXHRcdFx0XCJvU2VhcmNoXCI6IHtcInNTZWFyY2hcIjogXCJcIiwgXCJiU21hcnRcIjogdHJ1ZSwgXCJiUmVnZXhcIjogdHJ1ZX0sXG5cdFx0XHRcInNEb21cIjogJzxcImRhdGEtdGFibGUtaGVhZGluZ1wiaWY8XCJjbGVhclwiPj48XCJkYXRhLXRhYmxlLXBhZ2luYXZcInA+dDxcImRhdGEtdGFibGUtcGFnaW5hdlwicD4nXG5cdFx0fSkuY29sdW1uRmlsdGVyKHtcblx0XHRcdGFvQ29sdW1uczogW1xuXHRcdFx0XHQvL251bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdHtzU2VsZWN0b3I6IFwiI2RhdGFmaWx0ZXItY2l0aWVzXCIsIHR5cGU6IFwic2VsZWN0XCJ9LFxuXHRcdFx0XHR7c1NlbGVjdG9yOiBcIiNkYXRhZmlsdGVyLXN0YXRlc1wiLCB0eXBlOiBcInNlbGVjdFwifSxcblx0XHRcdFx0e3NTZWxlY3RvcjogXCIjZGF0YWZpbHRlci1jb3VudHJpZXNcIiwgdHlwZTogXCJzZWxlY3RcIn0sXG5cdFx0XHRcdHtzU2VsZWN0b3I6IFwiI2RhdGFmaWx0ZXIteWVhcnNcIiwgdHlwZTogXCJzZWxlY3RcIn0sXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdHtzU2VsZWN0b3I6IFwiI2RhdGFmaWx0ZXItcHJvZ3JhbXNcIiwgdHlwZTogXCJzZWxlY3RcIn1cblx0XHRcdF1cblx0XHR9KTtcblx0XHQkKCcuZGF0YVRhYmxlc19maWx0ZXIgaW5wdXQnKS5hdHRyKHsncGxhY2Vob2xkZXInOiAnS2V5d29yZCBTZWFyY2gnfSk7XG5cdFx0Ly9yZW1vdmUgdGV4dCBub2RlICdTZWFyY2gnIGZyb20gZ2VuZXJhdGVkIGxhYmVsXG5cdFx0JCgnLmRhdGFUYWJsZXNfZmlsdGVyIGxhYmVsJykuY29udGVudHMoKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5ub2RlVHlwZSA9PT0gMztcblx0XHR9KS5yZW1vdmUoKTtcblxuXHRcdHRoaXMuJGVsUmVzZXQgPSB0aGlzLiRlbEZpbHRlcnNDb250YWluZXIuZmluZCgnI2RhdGFmaWx0ZXJzLXJlc2V0Jyk7XG5cdFx0dGhpcy4kZWxGaWx0ZXJzID0gdGhpcy4kZWxGaWx0ZXJzQ29udGFpbmVyLmZpbmQoJ3NlbGVjdCcpO1xuXHRcdHRoaXMuJGVsU2VhcmNoID0gbnVsbDtcblxuXHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXG5cdFx0aWYgKHRoaXMuJGJvZHkuaGFzQ2xhc3MoJ2N1c3RvbS1zZWxlY3QtcGFnZScpKSB7XG5cdFx0XHRDdXN0b21BcHAuaW5pdGlhbGl6ZSgpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMuJGVsVGFibGUub24oJ2NsaWNrJywgJ2J1dHRvbi5jbGVhcmFsbCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHNlbGYucmVzZXQoKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuJGVsUmVzZXQub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0c2VsZi5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gdGhpcy4kZWxTZWFyY2gub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuXHRcdC8vIFx0c2VsZi5zZWFyY2goKTtcblx0XHQvLyB9KTtcblxuXHR9LFxuXG5cdHJlc2V0OiBmdW5jdGlvbigpIHtcblx0XHQvL3RoaXMuJGVsU2VhcmNoLnZhbCgnJyk7XG5cdFx0dGhpcy4kZWxGaWx0ZXJzLnByb3AoJ3NlbGVjdGVkSW5kZXgnLDApO1xuXHRcdHRoaXMub2JUYWJsZS5mbkZpbHRlckNsZWFyKCk7XG5cdFx0dGhpcy5vYlRhYmxlLmZuU29ydChbWzAsJ2FzYyddXSk7XG5cdFx0aWYgKHRoaXMuJGJvZHkuaGFzQ2xhc3MoJ2N1c3RvbS1zZWxlY3QtcGFnZScpKSB7XG5cdFx0XHRDdXN0b21BcHAuJHNlbGVjdHMuY2hhbmdlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdHNlYXJjaDogZnVuY3Rpb24oKSB7XG5cblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb247XG4iLCJcbi8qKlxuKlx0cmV0dXJucyBhbiBBamF4IEdFVCByZXF1ZXN0IHVzaW5nIGRlZmVycmVkLCB1cmwgaXMgcmVxdWlyZWQsIGRhdGFUeXBlIGlzIG9wdGlvbmFsXG4qKi9cbnZhciBHZXRBamF4Q29udGVudCA9IGZ1bmN0aW9uKHVybCwgZGF0YVR5cGUpIHtcblx0cmV0dXJuICQuYWpheCh7XG5cdFx0dHlwZTogJ0dFVCcsXG5cdFx0dXJsOiB1cmwsXG5cdFx0ZGF0YVR5cGU6IGRhdGFUeXBlIHx8ICdqc29uJ1xuXHR9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2V0QWpheENvbnRlbnQ7XG4iLCJcbnZhciBDdXN0b21TZWxlY3QgPSByZXF1aXJlKCcuL3dpZGdldHMvQ3VzdG9tU2VsZWN0Jyk7XG5cbnZhciBDdXN0b21BcHAgPSB7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMuJHNlbGVjdHMgPSAkKCcjZGF0YS1maWx0ZXJzLWNvbnRhaW5lcicpLmZpbmQoJ3NlbGVjdCcpO1xuXG5cdFx0Zm9yICh2YXIgaT0wLCBsZW4gPSB0aGlzLiRzZWxlY3RzLmxlbmd0aDsgaTxsZW47IGkrKykge1xuXHRcdFx0bmV3IEN1c3RvbVNlbGVjdCgkKHRoaXMuJHNlbGVjdHNbaV0pKTtcblx0XHR9XG5cblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ3VzdG9tQXBwO1xuIiwiXG52YXIgdGVtcGxhdGVDdXN0b21TZWxlY3QgPSByZXF1aXJlKCcuLi8uLi90ZW1wbGF0ZXMvY3VzdG9tLXNlbGVjdC5oYnMnKTtcblxudmFyIEN1c3RvbVNlbGVjdCA9IGZ1bmN0aW9uKCRzZWxlY3QsIG9iak9wdGlvbnMpe1xuXG5cdHRoaXMuJHNlbGVjdCA9ICRzZWxlY3Q7XG5cdHRoaXMuJG9wdGlvbnMgPSB0aGlzLiRzZWxlY3QuY2hpbGRyZW4oJ29wdGlvbicpO1xuXHR0aGlzLiRwYXJlbnQgPSB0aGlzLiRzZWxlY3QucGFyZW50KCk7XG5cdHRoaXMuJGVsID0gbnVsbDtcblx0dGhpcy4kbGlua3MgPSBudWxsO1xuXHR0aGlzLiRjdXJyZW50ID0gbnVsbDtcblx0dGhpcy4kbGFiZWwgPSBudWxsO1xuXG5cdHRoaXMudGVtcGxhdGUgPSBudWxsO1xuXG5cdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHtcblx0XHRjbGFzc05hbWU6ICdjdXN0b20tc2VsZWN0LWNvbnRhaW5lcicsXG5cdFx0c2VsZWN0b3JMYWJlbDogJy5jdXN0b20tc2VsZWN0LWxhYmVsJyxcblx0XHRzZWxlY3RvclRlbXBsYXRlOiAnI3RtcEN1c3RvbVNlbGVjdCdcblx0fSwgb2JqT3B0aW9ucyB8fCB7fSk7XG5cblx0dGhpcy5faW5pdCgpO1xuXG59O1xuXG5DdXN0b21TZWxlY3QucHJvdG90eXBlID0ge1xuXG4vKipcbipcdFByaXZhdGUgTWV0aG9kc1xuKiovXG5cdF9pbml0OiBmdW5jdGlvbigpe1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZUN1c3RvbVNlbGVjdDtcblxuXHRcdHRoaXMuJGVsID0gJCgnPGRpdj48L2Rpdj4nLHtcblx0XHRcdCdjbGFzcyc6IHRoaXMub3B0aW9ucy5jbGFzc05hbWUsXG5cdFx0XHQndGFiaW5kZXgnOiAnLTEnXG5cdFx0fSk7XG5cblx0XHR0aGlzLl9idWlsZERhdGEoKTtcblxuXHRcdHRoaXMuX2JpbmRFdmVudHMoKTtcblxuXHRcdHRoaXMucmVuZGVyKCk7XG5cblx0XHR0aGlzLiRsaW5rcyA9IHRoaXMuJGVsLmZpbmQoJ2EnKTtcblx0XHR0aGlzLiRjdXJyZW50ID0gJCh0aGlzLiRsaW5rc1swXSk7XG5cdFx0dGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5maW5kKHRoaXMub3B0aW9ucy5zZWxlY3RvckxhYmVsKTtcblxuXHR9LFxuXG5cdF9idWlsZERhdGE6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBpbmRleCA9IHRoaXMuZ2V0SW5kZXgoKTtcblx0XHR2YXIgbGFiZWwgPSB0aGlzLmdldExhYmVsKCk7XG5cdFx0dmFyICRvcHQ7XG5cblx0XHR0aGlzLm9iRGF0YSA9IHtcblx0XHRcdC8vaW5kZXg6IGluZGV4LFxuXHRcdFx0bGFiZWw6IGxhYmVsLFxuXHRcdFx0aXRlbXM6IFtdXG5cdFx0fTtcblxuXHRcdGZvciAodmFyIGk9MCwgbGVuID0gdGhpcy4kb3B0aW9ucy5sZW5ndGg7IGk8bGVuOyBpKyspIHtcblx0XHRcdCRvcHQgPSAkKHRoaXMuJG9wdGlvbnNbaV0pO1xuXHRcdFx0dGhpcy5vYkRhdGEuaXRlbXNbaV0gPSB7XG5cdFx0XHRcdHJlbDogJG9wdC5hdHRyKCd2YWx1ZScpLFxuXHRcdFx0XHR0ZXh0OiAkb3B0LnRleHQoKSxcblx0XHRcdFx0Ly90byBzZXQgYWN0aXZlLi4uXG5cdFx0XHRcdC8vYWN0aXZlOiBpID09PSBpbmRleCA/IHRydWUgOiBmYWxzZSAvLy4uLnRvbyBmYW5jeVxuXHRcdFx0XHRhY3RpdmU6IGZhbHNlIC8vLi4ubXVjaCBzaW1wbGVyXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vLi4uYW5kIG1vcmUgZGlyZWN0XG5cdFx0dGhpcy5vYkRhdGEuaXRlbXNbaW5kZXhdLmFjdGl2ZSA9IHRydWU7XG5cblx0fSxcblxuXHRfYmluZEV2ZW50czogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLiRzZWxlY3Rcblx0XHRcdC5vbignY2hhbmdlJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHNlbGYuX19vblNlbGVjdENoYW5nZShlKTtcblx0XHRcdH0pXG5cdFx0XHQub24oJ2ZvY3VzJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHNlbGYuX19vblNlbGVjdEZvY3VzKGUpO1xuXHRcdFx0fSk7XG5cblx0XHR0aGlzLiRlbFxuXHRcdFx0Lm9uKCdmb2N1c2luJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHNlbGYuX19vbkFjdGl2ZSgpO1xuXHRcdFx0fSlcblx0XHRcdC5vbignZm9jdXNvdXQnLCBmdW5jdGlvbihlKXtcblx0XHRcdFx0c2VsZi5fX29uSW5hY3RpdmUoKTtcblx0XHRcdH0pXG5cdFx0XHQvLyAub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbihlKXtcblx0XHRcdC8vIFx0c2VsZi5fX29uQWN0aXZlKCk7XG5cdFx0XHQvLyB9KVxuXHRcdFx0Ly8gLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oZSl7XG5cdFx0XHQvLyBcdHNlbGYuX19vbkluYWN0aXZlKCk7XG5cdFx0XHQvLyB9KVxuXHRcdFx0Lm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0c2VsZi4kY3VycmVudCA9ICQodGhpcyk7XG5cdFx0XHRcdHNlbGYuX19vbkNsaWNrKGUpO1xuXHRcdFx0fSk7XG5cblx0fSxcblxuXG4vKipcbipcdEV2ZW50IEhhbmRsZXJzXG4qKi9cblxuXHRfX29uU2VsZWN0Q2hhbmdlOiBmdW5jdGlvbihlKXtcblx0XHRjb25zb2xlLmxvZygnX19vblNlbGVjdENoYW5nZScpO1xuXHRcdHZhciBpbmRleCA9IHRoaXMuZ2V0SW5kZXgoKTtcblx0XHR2YXIgdmFsID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdHZhciAkY3VycmVudCA9ICQodGhpcy4kbGlua3NbaW5kZXhdKTtcblx0XHRpZiAoJGN1cnJlbnRbMF0gIT09IHRoaXMuJGN1cnJlbnRbMF0pIHtcblx0XHRcdCRjdXJyZW50LmNsaWNrKCk7XG5cdFx0fVxuXHRcdCQuZXZlbnQudHJpZ2dlcignQ3VzdG9tU2VsZWN0OnNlbGVjdENoYW5nZWQnLCBbdmFsXSk7XG5cdH0sXG5cblx0X19vblNlbGVjdEZvY3VzOiBmdW5jdGlvbihlKXtcblx0XHQvL2NvbnNvbGUubG9nKCdfX29uU2VsZWN0Rm9jdXMnKTtcblx0XHR0aGlzLiRlbC5mb2N1cygpO1xuXHR9LFxuXG5cdF9fb25BY3RpdmU6IGZ1bmN0aW9uKGUpe1xuXHRcdC8vY29uc29sZS5sb2coJ19fb25BY3RpdmUnKTtcblx0XHR0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdH0sXG5cblx0X19vbkluYWN0aXZlOiBmdW5jdGlvbihlKXtcblx0XHQvL2NvbnNvbGUubG9nKCdfX29uSW5hY3RpdmUnKTtcblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdH0sXG5cblx0X19vbkNsaWNrOiBmdW5jdGlvbihlKXtcblx0XHQvL2NvbnNvbGUubG9nKCdfX29uQ2xpY2snKTtcblx0XHR0aGlzLnVwZGF0ZVVJKCk7XG5cdFx0dGhpcy5fX29uSW5hY3RpdmUoKTtcblx0fSxcblxuXG4vKipcbipcdFB1YmxpYyBBUElcbioqL1xuXG5cdHVwZGF0ZVVJOiBmdW5jdGlvbigpe1xuXHRcdHZhciB2YWwgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0dmFyIHJlbCA9IHRoaXMuJGN1cnJlbnQuYXR0cigncmVsJyk7XG5cdFx0dmFyIHRleHQgPSB0aGlzLiRjdXJyZW50LnRleHQoKTtcblxuXHRcdHRoaXMuJGxhYmVsLnRleHQodGV4dCk7XG5cblx0XHR0aGlzLiRsaW5rcy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0dGhpcy4kY3VycmVudC5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHRpZiAocmVsICE9PSB2YWwpIHtcblx0XHRcdHRoaXMuJHNlbGVjdC52YWwocmVsKTtcblx0XHRcdHRoaXMuJHNlbGVjdC5jaGFuZ2UoKTtcblx0XHR9XG5cblx0fSxcblxuXHRnZXRJbmRleDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy4kc2VsZWN0LnByb3AoJ3NlbGVjdGVkSW5kZXgnKTtcblx0fSxcblxuXHRnZXRMYWJlbDogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy4kc2VsZWN0LmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLnRleHQoKTtcblx0fSxcblxuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy4kc2VsZWN0LnZhbCgpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUodGhpcy5vYkRhdGEpKS5hcHBlbmRUbyh0aGlzLiRwYXJlbnQpO1xuXHRcdHRoaXMuJHNlbGVjdC5hZGRDbGFzcygncmVwbGFjZWQnKTtcblx0XHRyZXR1cm4gdGhpcy4kZWw7XG5cdH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDdXN0b21TZWxlY3Q7XG4iLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0PHRyIGRhdGEtaWQ9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFwiXG4gICAgKyBcIlxcblx0XHRcdFx0PHRkIGNsYXNzPVxcXCJuYW1lXFxcIj48YSBocmVmPVxcXCIvZGV0YWlsdXJsP2lkPVwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuTmFtZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuTmFtZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L2E+PC90ZD5cXG5cdFx0XHRcdDx0ZD5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuQ2l0eSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuQ2l0eTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3RkPlxcblx0XHRcdFx0PHRkPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5TdGF0ZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuU3RhdGU7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC90ZD5cXG5cdFx0XHRcdDx0ZCBjbGFzcz1cXFwiaGlkZGVuXFxcIj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuQ291bnRyeSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuQ291bnRyeTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3RkPlxcblx0XHRcdFx0PHRkIGNsYXNzPVxcXCJ5ZWFyXFxcIj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuWWVhcikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuWWVhcjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3RkPlxcblx0XHRcdFx0PHRkIGNsYXNzPVxcXCJudW1cXFwiPjxzcGFuIHRpdGxlPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuQW1vdW50KSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5BbW91bnQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuQW1vdW50U3RyKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5BbW91bnRTdHI7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9zcGFuPjwvdGQ+XFxuXHRcdFx0XHQ8dGQgY2xhc3M9XFxcInByb2dyYW1cXFwiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5Qcm9ncmFtKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5Qcm9ncmFtOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvdGQ+XFxuXHRcdFx0PC90cj5cXG5cdFx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblx0PHRhYmxlPlxcblx0XHQ8dGhlYWQ+XFxuXHRcdFx0PHRyPlxcblx0XHRcdFx0XCJcbiAgICArIFwiXFxuXHRcdFx0XHQ8dGggY2xhc3M9XFxcIm5hbWVcXFwiPk5hbWU8L3RoPlxcblx0XHRcdFx0PHRoPkNpdHk8L3RoPlxcblx0XHRcdFx0PHRoPlN0YXRlPC90aD5cXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwiaGlkZGVuXFxcIj5Db3VudHJ5PC90aD5cXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwieWVhclxcXCI+WWVhcjwvdGg+XFxuXHRcdFx0XHQ8dGggY2xhc3M9XFxcIm51bVxcXCI+QW1vdW50PC90aD5cXG5cdFx0XHRcdDx0aCBjbGFzcz1cXFwicHJvZ3JhbVxcXCI+UHJvZ3JhbTwvdGg+XFxuXHRcdFx0PC90cj5cXG5cdFx0PC90aGVhZD5cXG5cdFx0PHRmb290Plxcblx0XHRcdDx0cj5cXG5cdFx0XHRcdFwiXG4gICAgKyBcIlxcblx0XHRcdFx0PHRoIGNsYXNzPVxcXCJuYW1lXFxcIj5OYW1lPC90aD5cXG5cdFx0XHRcdDx0aD5DaXR5PC90aD5cXG5cdFx0XHRcdDx0aD5TdGF0ZTwvdGg+XFxuXHRcdFx0XHQ8dGggY2xhc3M9XFxcImhpZGRlblxcXCI+Q291bnRyeTwvdGg+XFxuXHRcdFx0XHQ8dGggY2xhc3M9XFxcInllYXJcXFwiPlllYXI8L3RoPlxcblx0XHRcdFx0PHRoIGNsYXNzPVxcXCJudW1cXFwiPkFtb3VudDwvdGg+XFxuXHRcdFx0XHQ8dGggY2xhc3M9XFxcInByb2dyYW1cXFwiPlByb2dyYW08L3RoPlxcblx0XHRcdDwvdHI+XFxuXHRcdDwvdGZvb3Q+XFxuXHRcdDx0Ym9keT5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0PC90Ym9keT5cXG5cdDwvdGFibGU+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJuby1yZXN1bHRzXFxcIj5cXG5cdDxwPllvdXIgc2VsZWN0aW9ucyBoYXZlIHJldHVybmVkIDAgcmVzdWx0cy48L3A+XFxuXHQ8YnV0dG9uIGNsYXNzPVxcXCJjbGVhcmFsbFxcXCI+Q2xlYXIgQWxsIEZpbHRlcnM8L2J1dHRvbj5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIlxcblx0PGRpdiBpZD1cXFwiZGF0YWZpbHRlci1wcm9ncmFtc1xcXCIgY2xhc3M9XFxcImRhdGEtZmlsdGVyXFxcIj48L2Rpdj5cXG5cXG5cdDxkaXYgaWQ9XFxcImRhdGFmaWx0ZXIteWVhcnNcXFwiIGNsYXNzPVxcXCJkYXRhLWZpbHRlclxcXCI+PC9kaXY+XFxuXFxuXHQ8ZGl2IGlkPVxcXCJkYXRhZmlsdGVyLWNpdGllc1xcXCIgY2xhc3M9XFxcImRhdGEtZmlsdGVyXFxcIj48L2Rpdj5cXG5cXG5cdDxkaXYgaWQ9XFxcImRhdGFmaWx0ZXItc3RhdGVzXFxcIiBjbGFzcz1cXFwiZGF0YS1maWx0ZXJcXFwiPjwvZGl2Plxcblxcblx0PGRpdiBpZD1cXFwiZGF0YWZpbHRlci1jb3VudHJpZXNcXFwiIGNsYXNzPVxcXCJkYXRhLWZpbHRlclxcXCI+PC9kaXY+XFxuXFxuXHQ8YnV0dG9uIGlkPVxcXCJkYXRhZmlsdGVycy1yZXNldFxcXCI+Q2xlYXIgQWxsIEZpbHRlcnM8L2J1dHRvbj5cXG5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzLCBibG9ja0hlbHBlck1pc3Npbmc9aGVscGVycy5ibG9ja0hlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBvcHRpb25zO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8bGk+PGEgaHJlZj1cXFwiI1wiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5yZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLnJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIHJlbD1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAucmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcIlwiO1xuICBvcHRpb25zID0ge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9O1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5hY3RpdmUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCBvcHRpb25zKTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmFjdGl2ZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYgKCFoZWxwZXJzLmFjdGl2ZSkgeyBzdGFjazEgPSBibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIHN0YWNrMSwgb3B0aW9ucyk7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnRleHQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLnRleHQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiYWN0aXZlXCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCJcdDxzcGFuIGNsYXNzPVxcXCJjdXN0b20tc2VsZWN0LWxhYmVsXFxcIj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvc3Bhbj5cXG5cdDxzcGFuIGNsYXNzPVxcXCJjdXN0b20tc2VsZWN0LWFycm93XFxcIj48L3NwYW4+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJjdXN0b20tc2VsZWN0LWxpc3RcXFwiPlxcblx0XHQ8dWw+XFxuXHRcdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLml0ZW1zLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdDwvdWw+XFxuXHQ8L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiXX0=
;