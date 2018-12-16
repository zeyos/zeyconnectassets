var misc = {};

/**
 * @class misc.Select
 * @description Creates a select box (combobox)
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {string} width The width of the panel + 'px'
 * @option {array} options The options for the selectbox. An array of values or key-value pairs
 * @option {string} label The label of the selectbox
 */
misc.Select = new Class({ 

	Extends: gx.ui.Container,

	options: {
		'width'         	: '180px',
		'options'			: false,
		'key'				: 'key',
		'value'				: 'value',
		'label'				: false,
		'icon'				: false,
		'searchable'		: true,
		'bgcolor'			: false,
		'default'			: false,
		'adaptOptionsWidth'	: true,
		'msgNoOptions'		: false,
		'quickreset'		: false,
		'printValue'		: function(item) { return item[this.value]; },
		'printTitle'		: false,
		'symbol'			: '&#9660;',
		'placeholder'		: '',
		'id'				: false,
		'hasOptionsBelow'	: true,
		'onSelect'			: function() {},
		'onFilter'			: function() { return []; }
	},

	opened: false,
	selectedKey: false,
	selectedValue: false,
	selectedItem: null,

	onClick: function () {
		var select = this.select;
		if (select == null)
			return;
		if (select.opened)
			select.closeOptions();
		else {
			select.reload();
			select.openOptions();
		}
	},

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);
			
			this._display.root = new Element('div', {'class': 'combobox'}).setStyle('width', this.options.width).inject(this._display.root)
				.addEvent('select', function() {
					root.selectOption(this.get('data-key'), this.get('data-value'));
				});
			
			if (this.options.id)
				this._display.root.set('id', this.options.id);

			var width = this.options.width;
			if (this.options.width && this.options.width.indexOf('px', this.length - 2) !== -1)		// endsWith
				width = this.options.width.substring(0, this.options.width.length - 2);

			// selected item box
			this._display.selector = new Element('input', {
				'type'			: 'text', 
				'placeholder'	: this.options.placeholder
			}).setStyles({
				'width'			: 'inherit'
			}).addEvent('keyup', function(event) {
				root.fireEvent('keyup', event);
				root.resetSelection();
				var text = root._display.selector.value;
				if (!root.opened)
					root.openOptions();
				if (root.options.onFilter)
					root.options.onFilter(text);
			}).addEvent('keypress', function(event) {				
				if (event.key == 'tab') {
					root.closeOptions();
					return;
				}
			}).addEvent('focus', function() {
				root.reload();
			}).addEvent('click', function() {
				if (!root.opened)
					root.openOptions();
			});
			
			if (!this.options.searchable) {
				this._display.selector.set('readonly', 'readonly');
				this._display.selector.addEvent('focus', function() {
					this.blur();
				});
			}
			
			this._display.selector.select = this;

			// symbol
			this._display.symbol = new Element('div', {'html': this.options.symbol}).addClass('symbol');			
			this._display.symbol.select = this;
			this._display.symbol.addEvent('click', this.onClick);

			// x
			if (this.options.quickreset) {
				this._display.quickreset = new Element('div', {'html': '&#x2716;'}).addClass('quickreset');
				this._display.quickreset.select = this;
				this._display.quickreset.addEvent('click', function() {
					root.reset();
					if (root.options.onSelect)
						root.options.onSelect();
					root.reload();
				});
				this._display.selector.setStyle('padding-right', '45px');
			}
			
			// icon and label
			if (this.options.label) {
				var iconMarkup = ( this.options.icon ? '<i class="glyphicon glyphicon-'+this.options.icon+'"></i>' : '' );
				this._display.label = new Element('div');
				this._display.label.set('html', iconMarkup+( this.options.label ? ' '+this.options.label : '' ))				
				this._display.label.addClass('add-on');
				this._display.root.adopt(this._display.label);
				
				this._display.symbol.setStyle('top', '1px');
				this._display.selector.addClass('labeled');
			}
			else
				this._display.selector.addClass('unlabeled');
			
			this._display.root.adopt(this._display.symbol);

			if (this.options.quickreset)
				this._display.root.adopt(this._display.quickreset);
			
			this._display.root.adopt(this._display.selector);

			// options
			this._display.optionsbox = new Element('div', {'class': 'options' + (this.options.hasOptionsBelow ? '' : ' inverted')});
			
			$(document.body).addEvent('click', function(e) {
				if(root.opened && !e.target || !$(e.target).getParents().contains(root._display.root)) {
					root.closeOptions();
				}
			});
			
			if (this.options.adaptOptionsWidth)
				this._display.optionsbox.setStyle('width', 'inherit');
			
			// build
			if (this.options.options && typeOf(this.options.options) == 'array' && this.options.options.length > 0) {
				this.buildOptions();
			}
			this._display.root.adopt(this._display.optionsbox);

			this.closeOptions();

		} catch(e) {
			gx.util.Console('misc.Select->initialize', JSON.encode(e) );
		}
	},
	
	reload: function () {
		if ((this._display.selector.value.trim() == '' 
			|| this._display.selector.value == this.options['default'][this.options.value])
			&& this.options.onFilter)
			this.options.onFilter('');
		return this;
	},
	
	getItems: function () {
		return this.options.options;
	},
	
	setItems: function (opt) {
		this.options.options = opt;
		this.buildOptions();
		return this;
	},
	
	resetItems: function () {
		this.options.options = false;
		this._display.optionsbox.empty();
		return this;
	},
	
	buildOptions: function () {
		this._display.optionsbox.empty();
		this.resetSelection();
		
		// add default
		if (this.options['default']) {
			var oDefault = {};
			oDefault[this.options.key] = '__default';
			oDefault[this.options.value] = this.options['default'][this.options.value];
			this.options.options = [oDefault].append(this.options.options);
		}
		
		// add options
		var tableOptions = new Element('table');
		var emptyOptions = true;
		for (var i = 0; i < this.options.options.length; i++) {
			var item = this.options.options[i];
			var trOpt = new Element('tr');
			trOpt.select = this;
			trOpt.addEvent('click', function() {
				var c = this.getChildren();
				var tdVal = (c.length > 1) ? c[1] : c[0];
				var key = tdVal.getProperty('key');
				var value = tdVal.getProperty('value');
				var icon = tdVal.getProperty('icon');
				var select = this.select;
				if (key == '__default') {
					select.resetWithoutItems();
					if (select.options.onSelect)
						select.options.onSelect();
				} else {
					select.selectOption(key, value);
					select.selectedItem = {};
					select.selectedItem[select.options.key] = key;
					select.selectedItem[select.options.value] = value;
					select.selectedItem['icon'] = icon;
				}
				select.closeOptions();
				//select.options.onSelect();
			});
			if (item.hasOwnProperty(this.options.key) && item.hasOwnProperty(this.options.value)) {
				var tdValue = new Element('td', {
					'key': item[this.options.key],
					'value': item[this.options.value],
				});
				if (item.hasOwnProperty('style'))
					tdValue.setProperty('style', item.style);
				if (item.hasOwnProperty('class'))
					trOpt.addClass(item['class']);
				if (item.hasOwnProperty('icon') || this.options.icon) {
					var icon = item[this.options.key] == '__default' ? '' : item.icon ? item.icon : this.options.icon ? this.options.icon : '';
					var img = new Element('img', {'src': icon }).setStyles({
						'float': 'left'
					});
					tdValue.adopt(img);
				}
				var value = this.options.printValue(item);
				var title = typeof this.options.printTitle == 'function' ? this.options.printTitle(item) : value;
				tdValue.adopt(new Element('div', {'html': value, 'title': title }));
				trOpt.adopt(tdValue);
			} else
				continue;
			tableOptions.adopt(trOpt);
			emptyOptions = false;
		}
		if (emptyOptions) {
			if (this.options.msgNoOptions)
				this._display.optionsbox.setProperty('html', this.options.msgNoOptions);
			else
				this._display.optionsbox.setProperty('html', '');
		}

		this._display.optionsbox.adopt(tableOptions);

		this._display.root.select = this;
		
		return this;
	},

	/**
	 * @method openOptions
	 * @description Opens the options box
	 * @returns Returns this instance (for method chaining).
	 * @type misc.Select
	 */
	openOptions: function () {
		if (this._display.selector.get('disabled') == false)
		{
			this._display.optionsbox.setStyle('display', 'block');
			this.opened = true;
		}
		return this;
	},

	/**
	 * @method close
	 * @description Closes the options box
	 * @returns Returns this instance (for method chaining).
	 * @type misc.Select
	 */
	closeOptions: function () {
		this._display.optionsbox.setStyle('display', 'none');
		this.opened = false;
		return this;
	},

	/**
	 * @method selectOption
	 * @description Selects the value
	 * @returns Returns this instance (for method chaining).
	 * @type misc.Select
	 */
	selectOption: function(key, value, fireEvent) {
		if (fireEvent == undefined)
			fireEvent = true;
		this._display.selector.setProperty('value', value);
		this.selectedItem = {};
		this.selectedItem[this.options.key] = key;
		this.selectedItem[this.options.value] = value;
		this._display.root.set('data-key', key).set('data-value', value);
		if (fireEvent && this.options.onSelect)
			this.options.onSelect();
		return this;
	},

	getSelectedKey: function() {
		return (this.selectedItem != null) 
			? (this.selectedItem == this.options['default'] ? '' : this.selectedItem[this.options.key]) 
			: false;
	},

	getSelectedValue: function() {
		return (this.selectedItem != null) ? this.selectedItem.value : false;
	},
	
	getSelected: function() {
		return this.selectedItem;
	},
	
	getText: function() {
		return this._display.selector.get('value');
	},
	
	resetSelection: function() {		
		this.selectedKey = false;
		this.selectedValue = false;
		this.selectedItem = null;
		
		return this;
	},
	
	reset: function() {
		this.resetWithoutItems()
			.resetItems();
		
		return this;
	},
	
	resetText: function() {
		this._display.selector.setProperty('value', '');
		
		return this;
	},
	
	resetWithoutItems: function() {
		this.resetSelection()
			.resetText()
			.enable();
		
		return this;
	},
	
	disable: function() {
		this._display.selector.set('disabled', true);
		return this;
	},
	
	enable: function() {
		this._display.selector.set('disabled', false);
		return this;
	},
	
	focus: function() {
		this._display.selector.focus();
		if (!this.opened)
			this.openOptions();
		return this;
	},
	
	setPlaceholder(p) {
		this._display.selector.set('placeholder', p);
		return this;
	},
	
	setSelectedKey: function(key) {
		if (!key)
			return this;
		for (var i=0; i<this.options.options.length; i++)
			if (this.options.options[i][this.options.key] == key) {
				this.selectOption(key, this.options.options[i][this.options.value]);
				break;
			}
		return this;
	}

});