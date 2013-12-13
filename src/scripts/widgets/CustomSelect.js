
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
