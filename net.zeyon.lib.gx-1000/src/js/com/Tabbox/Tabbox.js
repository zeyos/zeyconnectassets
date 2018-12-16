/**
 * @class gx.com.Tabbox
 * @description Creates a tabbed box
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {node} display: The target node
 *
 * @option {array} frames: The array containing the frames. [{name: STRING, title: STRING, content: NODE/HTML}]
 * @option {int} height: The height of the content area
 * @option {int} show: The first tab to show
 * @option {function} onChange: Called when the tab is changed
 *
 * @event change When the tab is changed
 */
gx.com.Tabbox = new Class({
	gx: 'gx.com.Tabbox',
	Extends: gx.ui.Container,
	options: {
		'frames': [],
		'height': false,
		'show': 1,
		'onChange': false
	},
	class_active: 'active',
	_tabs: [],
	_frames: [],
	_active: false,
	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			this.build();

			var frames = this.options.frames;
			if ( isArray(frames) ) {
				frames.each(function (item) {
					root.addTab(item.name, item.title, item.content);
				});
			}

			if ( isFunction(this.options.onChange) )
				this.addEvent('change', this.options.onChange);

			if ( isString(this.options.show) )
				this.openTab(this.options.show);
			else if(isNumber(this.options.show)) {
				var index = this.getIndexName(this.options.show);
				if ( index )
					this.openTab(index);
			}
		} catch(e) { gx.util.Console('gx.com.Tabbox->initialize', e.message); }
	},

	/**
	 * @method build
	 * @description Builds the HTML frame (my vary for derived classes)
	 * @return {element}
	 */
	build: function () {
		try {

			this._display = Object.merge({}, this._display, {
				'tabfull': new Element('td', {'class': 'fullw'}),
				'tablist': new Element('tr'),
				'table': new Element('table', {'class': 'tab'}),
				'content': new Element('div', {'styles': {'overflow': 'auto'}})
			});

			if ( root.options.height )
				this._display.content.setStyle('height', this.options.height);
			this._display.tablist.adopt(new Element('td'));
			this._display.tablist.adopt(this._display.tabfull);
			this._display.table.adopt(this._display.tablist);
			this._display.root.adopt(this._display.table);
			this._display.root.adopt(this._display.content);

		} catch(e) { gx.util.Console('gx.com.Tabbox->build', e.message); }
	},

	/**
	 * @method buildTab
	 * @description Builds the HTML element for a single tab
	 * @param {string} name
	 * @param {string} title
	 * @return {element}
	 */
	buildTab: function (name, title) {
		var root = this;

		var link = new Element('a', {'html': title.replace(/ /g, '&nbsp;')});
		var tab = new Element('th');
		tab.adopt(link);
		tab.inject(this._display.tabfull, 'before');
		link.addEvent('click', function () {
			root.openTab(name);
		});

		return tab;
	},

	/**
	 * @method buildContent
	 * @description Builds the HTML element for the content section
	 * @param {element} content
	 * @return {element}
	 */
	buildContent: function (content) {
		this._display.content.adopt(content);
		return content;
	},

	/**
	 * @method setHeight
	 * @description Sets the height of the tabbed box
	 * @param {int} height The height to set
	 */
	setHeight: function (height) {
		this._display.content.setStyle('height', height);
	},

	/**
	 * @method addTab
	 * @description Adds a tab
	 * @param {string} name The name of the tab
	 * @param {string} title The title of the tab
	 * @param {string|node} content The content of the tab
	 */
	addTab: function (name, title, content) {
		var root = this;
		try {
			if ( isString(content) )
				content = new Element('div', {'html': content});

			if ( isString(name) && isString(title) && isNode(content) ) {
				if ( !isNode(this._tabs[name]) ) {
					var tab = root.buildTab(name, title);
					content = root.buildContent(content);
					content.setStyle('display', 'none');
					this._frames[name] = content;
					this._tabs[name] = tab;

					return true;
				}
			}
			return false;
		} catch(e) {
			gx.util.Console('gx.com.Tabbox->addTab', e.message);
			throw e;
		}
	},

	/**
	 * @method getTabName
	 * @description Yields the current tab's name.
	 * @returns The name of the currently active tab.
	 * @type {String}
	 */
	getTabName: function () {
		return this._active;
	},

	/**
	 * @method closeTab
	 * @description Closes the tab with the given name
	 * @param {string} name The name of the tab
	 */
	closeTab: function (name) {
		try {
			if ( isNode(this._tabs[name]) ) {
				this._tabs[name].removeClass(this.class_active);
				this._frames[name].setStyle('display', 'none');
				this._active = false;
			}
		} catch(e) { gx.util.Console('gx.com.Tabbox->closeTab', e.message); }
	},

	/**
	 * @method openTab
	 * @description Opens the tab with the given name
	 * @param {string} name The name of the tab
	 */
	openTab: function (name, options) {
		try {
			if ( !isNode(this._tabs[name]) )
				return this;

			if ( this._active )
				this.closeTab(this._active);

			this._active = name;
			this._tabs[name].addClass(this.class_active);
			this._frames[name].setStyle('display', 'block');
			this.fireEvent('change', [name, options]);

		} catch(e) {
			gx.util.Console('gx.com.Tabbox->openTab', e.message);
		}

		return this;
	},

	reopen: function () {
		return this.openTab(this._active);
	},

	/**
	 * @method hideTab
	 * @description Hides a tab
	 * @param {String} name The name of the tab to hide.
	 */
	hideTab: function (name) {
		if ( isNode(this._tabs[name]) )
			this._tabs[name].hide();

		return this;
	},

	/**
	 * @method revealTab
	 * @description Reveals (unhides) a tab
	 * @param {String} name The name of the tab to unhide.
	 */
	revealTab: function (name) {
		if ( isNode(this._tabs[name]) )
			this._tabs[name].show();

		return this;
	},

	/**
	 * @method getIndexName
	 * @description Returns the name of the tab at the given index
	 * @param {int} index The index
	 */
	getIndexName: function (index) {
		// !!! TODO: This code will probably not work as expected on Chrome and
		// maybe Safari because properties of an object do not have any
		// particular order.
		var i = 0;
		for (name in this._tabs) {
			i++;
			if ( i == index )
				return name;
		}
		return false;
	}
});
