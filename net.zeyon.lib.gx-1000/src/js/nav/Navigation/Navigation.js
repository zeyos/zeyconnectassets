gx.nav.Navigation = new Class({
	Extends: gx.ui.Container,

	options: {
		useanchor: true,
		anchorquery: 'navtab',

		defaulttab: null,

		tabBuilder:     'Tabs',
		contentBuilder: 'Content',
		switcher:       'Switcher'
	},

	_theme: {
		root: 'navigation'
	},

	tabBuilder: null,
	contentBuilder: null,
	switcher: null,

	tabs: {},
	contents: {},

	tabcon: null,
	contentcont: null,

	current: null,

	initialize: function(display, options) {
		this.parent(display, options);

		this._ui.root.addClass(this._theme.root);

		this.initComponent(this.options, 'tabBuilder');
		this.initComponent(this.options, 'contentBuilder');
		this.initComponent(this.options, 'switcher');

		this.buildContainer();

	},

	buildReady: function() {
		if ( this.options.useanchor )
			this.initAnchor();
		else {
			this.loadDefault();
		}
	},

	initComponent: function(options, component) {
		var clazz, name = options[component];
		if ( typeOf(name) == 'class' )
			clazz = name;
		else
			clazz = gx.nav[name];

		this[component] = new clazz(this, options);
	},

	addTab: function(tab, content) {
		if ( this.tabs[tab] != null )
			alert(tab + ' <- Tab already exists');

		tab = this.tabBuilder.buildObject(tab);

		if ( tab.identifier == null )
			tab.identifier = Object.getLength(this.tabs);

		tab = this.tabBuilder.build(tab);
		this.tabBuilder.inject(tab.element);

		content = this.contentBuilder.build(content, tab);
		this.contentBuilder.inject(content.element);
		this.switcher.initContent(tab, content);

		this.tabs[tab.identifier] = tab;
		this.contents[tab.identifier] = content;
	},

	openTab: function(tab, force) {
		if ( this.current == tab && !force )
			return;

		var ctab, ccontent;
		if ( this.current != null ) {
			ctab = this.tabs[this.current];
			ccontent = this.contents[this.current];
		}

		this.current = tab;

		this.switcher.prepareChange(ctab, this.tabs[tab], ccontent, this.contents[tab], function() {
			if ( ctab != null ) {
				this.switcher.closeCurrent(ctab, ccontent, function() {
					this.closeCurrentDone(this.tabs[tab], this.contents[tab], this.contents[tab].buttons);
				}.bind(this));

			} else {
				this.closeCurrentDone(this.tabs[tab], this.contents[tab], this.contents[tab].buttons);

			}

		}.bind(this));

	},

	closeCurrentDone: function(tab, content, buttons) {
		this.tabBuilder.injectButtons(buttons);
		this.switcher.showTab(tab, content);
	},

	buildContainer: function() {
		this.switcher.initRoot(this._ui.root);
		this._ui.root.adopt([
			this.tabBuilder,
			this.contentBuilder
		]);
	},

	initAnchor: function() {
		var query = new URI().get('fragment').parseQueryString();
		var anchor = query[this.options.anchorquery];

		var tab = this.tabs[anchor];
		if ( tab != null ) {
			this.openTab(anchor);

		} else
			this.loadDefault();

		if ( window['AnchorEventBus'] != null )
			AnchorEventBus.add(this);
	},

	anchorChanged: function(anchor) {
		var query = anchor.parseQueryString();
		anchor = query[this.options.anchorquery];

		var tab = this.tabs[anchor];
		if ( tab != null ) {
			this.openTab(anchor);
		}

	},

	loadDefault: function() {
		if ( this.options.defaulttab != null )
			this.openTab(this.options.defaulttab);

		else
			for ( var i in this.tabs ) {
				if ( this.tabs.hasOwnProperty(i) ) {
					this.openTab(i);
					return;
				}

			}
	},

	ready: function() {
		if ( this.options.useanchor )
			this.initAnchor();
		else
			this.loadDefault();
	},

	getTabBuilder: function() {
		return this.tabBuilder;
	},

	getContentBuilder: function() {
		return this.contentBuilder;
	},

	getSwitcher: function() {
		return this.switcher;
	}
});