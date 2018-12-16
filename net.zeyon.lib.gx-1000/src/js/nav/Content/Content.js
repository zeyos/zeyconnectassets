gx.nav.Content = new Class({
	Extends: gx.nav.Component,

	_theme: {
		contentwrapper: 'contents',
		content:         'content',
	},

	initialize: function(nav, options) {
		this.parent(nav, new Element('div'), options);

		this._ui.root.addClass(this._theme.contentwrapper);
	},

	build: function(content) {
		content = this.buildObject(content);

		if ( content.element != null && typeOf(content.element) == 'function')
			content.element = content.element();

		var root = this.buildRoot(content);
		this.setContent(root, content.element);

		content.element = root;
		return content;
	},

	show: function(ready) {
		ready();
	},

	buildObject: function(content) {
		if ( typeOf(content) == 'string' || typeOf(content) == 'element') {
			content = {
				element: content
			};
		}

		if ( content.show == null )
			content.show = this.show;

		return content;

	},

	buildRoot: function(content) {
		return new Element('div', {
			'class': this._theme.content
		});
	},

	setContent: function(parent, content) {
		parent.adopt(content);
	},

	inject: function(element) {
		this._ui.root.adopt(element);
	}

});