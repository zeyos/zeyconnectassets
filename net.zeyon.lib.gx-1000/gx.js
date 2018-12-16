/**
 * Gx Components Library
 *
 * @authors Peter-Christoph Haider, Hoang Nguyen, Sebastian Glonner, Franz Berwein
 * @copyright Copyright 2011-2013 Zeyon (www.zeyon.net)
 * @version 2.00 (2012-05-16)
 * @package Gx
 */

var gx = {
	Browser: {
		scrollBar: {
			width: undefined
		}
	}
};

// Calculate Browser scroll bar width
window.addEvent('domready', function() {
	var div = new Element('div', {
		'style': 'width: 50px; position:absolute; left: -200px; top: -200px;'
	});
	div.inject(document.body, 'top');
	var d = new Element('div', {
		'html': '&nbsp;'
	});
	div.adopt(d);

    var w1 = d.getStyle('width').toInt();
    div.setStyle('overflow-y', 'scroll');
    gx.Browser.scrollBar.width = (w1 - d.getStyle('width').toInt());
    div.dispose();
});

/**
 * Gx JavaScript Library for MooTools
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */

/**
 * @extends gx
 */
gx.version = '1.000';

/**
 * @extends gx
 */
gx.core = {};

/* ========================== Utility Functions ========================== */

/**
 * @method isFunction
 * @description Returns true if param is a function
 * @param a
 */
function isFunction(a) {
	return typeof a == 'function';
}
/**
 * @method isNull
 * @description Returns true if param is null
 * @param a
 */
function isNull(a) {
	return a == null;
}
/**
 * @method isNumber
 * @description Returns true if param is a finite number
 * @param a
 */
function isNumber(a) {
	return typeof a == 'number' && isFinite(a);
}
/**
 * @method isObject
 * @description Returns true if param is an object or a function
 * @param a
 */
function isObject(a) {
	return (typeof a == 'object' && a) || isFunction(a);
}
/**
 * @method isString
 * @description Returns true if param is a string
 * @param a
 */
function isString(a) {
	return (typeof a === 'string' || (typeof a == 'object' && a instanceof String));
}
/**
 * @method isArray
 * @description Returns true if param is an array
 * @param a
 */
function isArray(a) {
	return (typeof a == 'object' && a instanceof Array);
}
/**
 * @method isDate
 * @description Returns true if param is a date
 * @param a
 */
function isDate(a) {
	return (typeof a == 'object' && a instanceof Date);
}
/**
 * @method isBoolean
 * @description Returns true if param is boolean
 * @param a
 */
function isBoolean(a) {
	return typeof a == 'boolean';
}
/**
 * @method isNode
 * @description Returns true if param is a node
 * @param a
 */
function isNode(a) {
	if ( isObject(a) && a.nodeType )
		return a.nodeType == 1;
	return false;
}

gx.util = new Object();

/**
 * @method gx.util.Console
 * @description Displays message as an alert
 * @param {string} source The source of the message
 * @param {string} message The message text
 */
gx.util.Console = function (source, message) {
	alert(source + ': ' + message);
}

/**
 * @method gx.util.parseError
 * @description Parse catched errors to string.
 * @param {object} e The error object.
 * @param {string} spr (optional) The separator string between the error infos.
 */
gx.util.parseError = function (e) {
	var spr = '\n';
	if ( arguments[1] !== undefined )
		spr = arguments[1];

	var infos = new Array();
	if ( e.fileName != undefined )
		infos.push('File: ' + e.fileName);

	if ( e.lineNumber != undefined )
		infos.push('Line: ' + e.lineNumber);

	if( e.message != undefined )
		infos.push('Message: ' + e.message);

	var txt = '';
	for (var i = 0; i < infos.length; i++) {
		txt += infos[i] + spr;
	}
	return txt;
}

/**
 * @method gx.util.setEleContentByType
 * @description Adopt or set content to type depending on its type.
 * @param {object} ele The element which gets the content.
 * @param {string} content The content. Can be type of element, string, object
 */
gx.util.setElementContentByType = function (ele, content) {
	switch (typeOf(content)) {
		case 'string':
			ele.set('html', content);
			break;
		case 'element':
			ele.empty();
			ele.adopt(content);
			break;
		case 'object':
			ele.empty();
			ele.adopt(__(content));
			break;
	}
	return ele;
},

/**
 * @method objLen
 * @description Returns the length of an object
 * @param {string} obj The object in question
 */
function objLen(obj) {
	try {
		var c = 0;
		for (var i in obj)
	    	c++;
		return c;
	} catch(e) {
		gx.util.Console('gx.util.countObj', e.message);
		throw e;
	}
}

/**
 * @method printf
 * @description Inserts a single or multiple values into a string
 *
 * Sample:
 * var forecast = "On %arg% the wheather is %arg%";
 * alert(gx.util.printf(forecast, ['Sunday', 'sunny']));
 *
 * @param {string} subject Target string, where the values are inserted
 * @param {string|array} values A single value (string) or multiple values inside an array
 */
function printf(subject, values) {
	try {
		if ( typeOf(values) == 'string' || typeOf(values) == 'number' )
			values = [values];
		if ( typeOf(values) == 'array' ) {
			var sections = subject.split("%arg%");
			subject = '';
			var i = 0;
			if ( values != null )
				while (i < values.length) {
					subject = subject + ' ' + sections[i];
					if ( typeOf(sections[i]) == 'string' )
						subject = subject + values[i];
					else if ( typeOf(sections[i]) == 'number' )
						subject = subject + values[i].toString();
					i++;
				}
			while (i < sections.length) {
				subject = subject + sections[i];
				i++;
			}
			return subject;
		} else
			return subject;
	} catch(e) {
		gx.util.Console('gx.util.printf', e.message);
		throw e;
	}
}

function initValue(obj, key, def) {
	return obj[key] == null ? def : obj[key];
}

function parseResult(json) {
	var res = JSON.decode(json);
	var t = $type(res);
	if ( t == 'object' ) {
		if ( res.error != null )
			msg.show('Server error: ' + String(res.error).htmlSpecialChars(), 'error');
		else if ( res.result == null )
			msg.show('Undefined result', 'error');
		else
			return res.result;
	} else {
		msg.show('parseResult: Invalid data type: ' + String(t).htmlSpecialChars(), 'error');
	}

	return null;
}

String.implement({

	htmlSpecialChars: function () {
		return this
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

});

Element.implement({

	getClasses: function (regexp) {
		var classes = (
			this['classList']
			? this.classList
			: this.getProperty('class').split(/\s+/)
		);

		if ( !regexp )
			return classes;

		var result = [];
		for (var i = 0; i < classes.length; i++) {
			if ( classes[i].match(regexp) )
				result.push(classes[i]);
		}
		return result;
	},

	getClass: function (regexp) {
		var classes = this.getClasses(regexp);
		return classes[0];
	},

	removeClasses: function (regexp) {
		var cssClasses = this.getClasses(regexp);
		var count = cssClasses.length;
		for (var i = 0; i < count; i++)
			this.removeClass(cssClasses[i]);
		return this;
	}

});

/**
 * @method gx.core.Parse
 * @description Helper function to parse an element tree
 * @implements gx.ui.Container
 * @param {object} obj The object to parse
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package com
 * @copyright Copyright (c) 2011-2013, Zeyon (www.zeyon.net)
 */

gx.core.Parse = function(obj) {
	switch (typeOf(obj)) {
		case 'object':
			if ( gx && gx.ui && gx.ui.Container &&
				 instanceOf(obj, gx.ui.Container) && typeOf(obj.display) == 'function')
				return obj.display();

			obj.tag = obj.tag == null ? 'div' : obj.tag;
			var elem = new Element(obj.tag);
			for (var prop in obj) {
				switch (prop) {
					case 'styles':
						elem.setStyles(obj.styles);
						break;
					case 'classes':
						if (typeOf(obj.classes) == 'array')
							obj.classes.each(function(className) { elem.addClass(className) });
						else
							elem.addClass(obj.classes)
						break;
					case 'child':
						elem.adopt(gx.core.Parse(obj.child));
						break;
					case 'children':
						var names = [];
						for (var name in obj.children) {
							var child = gx.core.Parse(obj['children'][name]);
							elem.adopt(child);
							elem['_' + name] = (typeOf(child.retrieve) == 'function' && child.retrieve('com')) ? child.retrieve('com') : child;
							names.push(name);
						}
						elem.store('children', names);
						break;
					case 'tag':
						break;
					default:
						if (prop.length > 5 && prop.substring(0, 2) == 'on' && prop.substring(2, 3) == prop.substring(2, 3).toUpperCase())
							elem.addEvent(prop.substring(2).toLowerCase(), obj[prop]);
						else
							elem.set(prop, obj[prop]);
						break;
				}
			}
			return elem;
		case 'string':
			return document.createTextNode(obj);
		case 'element':
			return obj;
	}

	return false;
};

// Add the shortcut function
var __ = gx.core.Parse;

/**
 * @class gx.core.Settings
 * @description Basic class to handle local class settings
 * @implements Events
 * @implements gx.util.printf
 * @options msg
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */
gx.core.Settings = new Class({
	gx: 'gx.core.Settings',
	Implements: Events,
	options: {
		'msg': {}
	},
	_language: null,
	_messages: null,

	/**
	 * @type Boolean
	 */
	_valid: true,

	/**
	 * @method setOption
	 * @description Sets a local option
	 * @param {string} option The option to set
	 * @param {string} value The new value of the option
	 */
	setOption: function(option, value) {
		this.options.set(option, value);
		this.fireEvent('setOption');
	},

	/**
	 * @method setOptions
	 * @description Sets additional local options
	 *
	 * Portions Copyright (c) 2006-2010 Valerio Proietti & the MooTools
	 * production team, MIT-style license.
	 * http://mad4milk.net/, http://mootools.net/.
	 *
	 * @param {object} options The options object to set
	 */
	setOptions: function(options) {
		if (typeOf(options) == 'object')
			Object.append(this.options, options);

		if (this.addEvent) {
			// Code from MooTools
			for (var option in options) {
				if ( (typeOf(options[option]) == 'function') &&
					 (/^on[A-Z]/).test(option) ) {
					this.addEvent(option, options[option]);
					delete options[option];
				}
			}
		}

		this.fireEvent('setOption');
	},

	/**
	 * @method dispatchEvents
	 * @description Makes another object dispatch events to the local object
	 * @param {node} target The target that shall add the event(s)
	 * @param {array} events The events to dispatch
	 */
	dispatchEvents: function(target, events) {
		var root = this;
		events.each(function(event) {
			target.addEvent(event, function() {
				root.fireEvent(event);
			})
		});
	},

	/**
	 * @method gxClass
	 * @description Returns the gx classname
	 * @param {object} gxObj The object in question
	 */
	gxClass: function(gxObj) {
		var type = typeOf(gxObj);
		if (!type)
			return this.gx;
		else if (type == 'object'){
			try {
				return gxObj.gxClass();
			} catch(e) {
				return false;
			}
		} else
			return false;
	},

	initialize: function(options) {
		this.setOptions(options);
		this._messages = this.options.msg;
		this._language = this.options.language;
	},
	/**
	 * @method getMessage
	 * @description Gets a message
	 * @param {string} message The message
	 * @param {array} arguments The printf arguments
	 */
	getMessage: function(message, args) {
		if (this._language != null && this._language != 'en' && this._messages[this._language] != null && this._messages[this._language][message] != null)
			return printf(this._messages[this._language][message], arguments);
		if (this._messages[message] != null)
			return printf(this._messages[message], args);
		return '';
	},

	/**
	 * @method setLanguage
	 * @description Sets the current language
	 * @param {string} language The language to set
	 */
	setLanguage: function(language) {
		this._language = language;
	},

	doDestroy: function () {
		delete this.options;
		delete this._language;
		delete this._messages;
	},

	/**
	 * Do *not* override this method. Override {@link doDestroy()} instead.
	 */
	destroy: function () {
		if ( !this._valid )
			return;

		delete this._valid;

		this.removeEvents();
		this.doDestroy();
	}

});

/**
 * @class gx.ui
 * @extends gx
 */
gx.ui = {};

/**
 * @class gx.ui.Container
 * @description Abstract class for container elements
 * @implements gx.core.Settings
 * @extends gx.core.Parse
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package com
 * @copyright Copyright (c) 2011-2013, Zeyon (www.zeyon.net)
 *
 * @param {string|node} display
 *
 * @option {window} parent The parent window
 */
gx.ui.Container = new Class({
	Extends: gx.core.Settings,
	options: {
		'parent': window
	},
	_coordinates: {
		width: 0,
		height: 0,
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	},
	_ui: {},
	_parent: null,
	_display: {},

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(options);

			this._display.root = this.initDisplay(display);
			this._ui.root = this._display.root;
			this._ui.root.store('com', this); // Store a pointer to the component

			if (typeOf(this.options.parent) == 'element' || typeOf(this.options.parent) == 'window')
				this._parent = this.options.parent;
			if (this.options.styles != null)
				this._ui.root.setStyles(this.options.styles);
			switch (typeOf(this.options.classes)) {
				case 'array':
					this.options.classes.each(function (className) { root._ui.root.addClass(className) });
					break;
				case 'string':
					this._ui.root.addClass(this.options.classes);
					break;
			}

			this.getCoordinates();
			this.fireEvent('build', this);
		} catch(e) { alert('gx.ui.Container->initialize: ' + e.toString()); }
	},

	/**
	 * @method initDisplay
	 * @description Initializes the display element
	 * @param {string|element|object} elem
	 * @param {bool} str Return a text node, if a string is specified
	 */
	initDisplay: function (elem, str) {
		switch (typeOf(elem)) {
			case 'string':
				return str == null ? $(elem) : document.createTextNode(elem);
			case 'number':
				return document.createTextNode(elem.toString());
			case 'element':
				return elem;
			case 'object':
				if (instanceOf(elem, gx.ui.Container) && typeOf(elem.display) == 'function')
					return elem.display();
				else
					return __(elem);
			default:
				return new Element('div');
		}
	},

	/**
	 * @method display
	 * @description Returns a display element
	 * @param {string} elem Display key
	 */
	display: function (elem) {
		this.fireEvent('display');
		return this._ui[ elem ? elem : 'root' ];
	},

	/**
	 * @method toElement
	 * @description Returns the main display element.
	 */
	toElement: function () {
		return this.display();
	},

	/**
	 * @method setCoordinates
	 * @description Sets the coordinates and measurements to the root element and fires the "resize" event
	 * @param {object} options
	 */
	setCoordinates: function (options) {
		var root = this;
		try {
			var coordinates = new Object();
			if (typeOf(options.width) == 'number') coordinates.width = options.width;
			if (typeOf(options.height) == 'number') coordinates.height = options.height;
			if (typeOf(options.top) == 'number') coordinates.top = options.top;
			if (typeOf(options.bottom) == 'number') coordinates.bottom = options.bottom;
			if (typeOf(options.left) == 'number') coordinates.left = options.left;
			if (typeOf(options.right) == 'number') coordinates.right = options.right;
			this._display.root.setStyles(coordinates);
			this.fireEvent('resize');
		} catch(e) { gx.util.Console(root.gx + '->setCoordinates', e.message); }
	},

	/**
	 * @method getCoordinates
	 * @description Calculates the coordinates and measurements of the root element
	 */
	getCoordinates: function () {
		try {
			this._coordinates = this._display.root.getCoordinates();
			this._coordinates.scrollx = this._display.root.getScrollSize().x;
			this._coordinates.scrolly = this._display.root.getScrollSize().y;
			this._coordinates.paddingtop = this._display.root.getStyle('padding-top').toInt();
			this._coordinates.paddingright = this._display.root.getStyle('padding-right').toInt();
			this._coordinates.paddingbottom = this._display.root.getStyle('padding-bottom').toInt();
			this._coordinates.paddingleft = this._display.root.getStyle('padding-left').toInt();
			this._coordinates.bordertop = this._display.root.getStyle('border-top-width').toInt();
			this._coordinates.borderright = this._display.root.getStyle('border-right-width').toInt();
			this._coordinates.borderbottom = this._display.root.getStyle('border-bottom-width').toInt();
			this._coordinates.borderleft = this._display.root.getStyle('border-left-width').toInt();
			this._coordinates.innerwidth = this._coordinates.width - this._coordinates.borderleft - this._coordinates.borderright - this._coordinates.paddingleft - this._coordinates.paddingright;
			this._coordinates.innerheight = this._coordinates.height - this._coordinates.bordertop - this._coordinates.borderbottom - this._coordinates.paddingtop - this._coordinates.paddingbottom;
		} catch(e) {}
	},

	/**
	 * @method set
	 * @description Sets an option to the root element
	 * @param {string} option The option to set
	 * @param {string} value The option's value to set
	 */
	set: function (option, value) {
		try {
			this._ui.root.set(option, value);
		} catch(e) {}
	},

	/**
	 * @method setStyle
	 * @description Sets a style to the root element
	 * @param {string} option The option to set
	 * @param {string} value The option's value to set
	 */
	setStyle: function (option, value) {
		try {
			this._ui.root.setStyle(option, value);
		} catch(e) {}
	},

	doDestroy: function () {
		if ( this._ui.root instanceof Element ) {
			this._ui.root.destroy();
			delete this._ui.root;
		}

		delete this._coordinates;
		delete this._ui;
		delete this._parent;
		delete this._display;

		this.parent();
	}
});

/**
 * @extends gx.core
 */
gx.zeyos = {};

// Calculate Browser scroll bar width
window.addEvent('domready', function() {
	var html = $$('html');
	var lang = html.get('lang');

	if ( lang == null || lang == '') {
		html.set('lang', 'ltr-en')
	}
});

/**
 * @class gx.zeyos.Checklist
 * @description Creates a checklist control and loads the contents from a remote URL.
 * @extends gx.ui.Container
 * @implements gx.util.Console, gx.zeyos.Factory
 *
 * @option {int} height Component height
 * @option {bool} search Add a search field to the box
 * @option {string} method Request method
 * @option {string} url Request URL
 * @option {object} requestData Additional request data
 * @option {string} listValue The key name for element values
 * @option {function} listFormat Formatting function for the list output
 *
 * @event request
 * @event complete
 * @event failure
 *
 * @sample Checklist Simple checkboxes list example
 */
gx.zeyos.Checklist = new Class({
	gx: 'gx.zeyos.Checklist',
	Extends: gx.ui.Container,
	options: {
		'height': '110px',
		'search': true,
		'method': 'GET',
		'data': false,
		'url': false,
		'requestData': {},
		'listValue': 'ID',
		'listFormat': function(elem) {
			return elem.label;
		}
	},
	_elems: [],
	_bg: '',
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this._display.frame = new Element('div', {'styles': {
				'height': root.options.height,
				'overflow': 'auto'
			}});
			this._display.root.adopt(this._display.frame);
			if (this.options.search) {
				this._display.search = {
					'box': new Element('div', {'class': 'bg p2'}),
					'txt': new Element('input', {'type': 'text', 'class': 'dyn fullw'})
				};
				this._display.search.box.inject(this._display.root, 'top');
				this._display.search.box.adopt(this._display.search.txt);
				this._display.search.txt.addEvent('keyup', function() {
					root.search(root._display.search.txt.value);
				});
			}
			this._display.table = new Element('table', {'style': 'width: 100%'});
			this._display.frame.adopt(this._display.table);

			if (this.options.url)
				this.load(this.options.url, this.options.requestData);
			if (isArray(this.options.data))
				this.buildList(this.options.data);
		} catch(e) { gx.util.Console('gx.zeyos.Checklist->initialize', e.message); }
	},

	/**
	 * @method buildList
	 * @description Creates the item table
	 *
	 * @param {array} list: List of objects {ID, label}
	 */
	buildList: function(list) {
		try {
			this._display.table.empty();
			list.each(function(item) {
				this.addItem(item);
			}, this);
		} catch(e) { gx.util.Console('gx.zeyos.Checklist->buildList', e.message); }
	},

	/**
	 * @method addItem
	 * @description Adds a new item row to the list
	 *
	 * @param {array} item Item row to add. Array that will be parsed through options.listFormat()
	 */
	addItem: function(item) {
		try {
			var elem = {
				'value': this.options.listFormat(item),
				'input': new gx.zeyos.Toggle(null, item[this.options.listValue])
			}

			elem.row = new Element('tr', {'class': 'em'+this._bg});
			var td1 = new Element('td', {'class': 'b_b-1', 'style': 'padding: 3px 13px 3px 3px; width: 50px;'});
			td1.adopt(elem.input.toElement());
			elem.row.adopt(td1);
			var td2 = new Element('td', {'class': 'b_b-1', 'html': elem.value});
			td2.addEvent('click', function() {
				elem.input.toggle();
			});
			elem.row.adopt(td2);
			this._display.table.adopt(elem.row);
			this._elems.push(elem);
			this._bg = this._bg == '' ? ' bg-FA' : '';
		} catch(e) { gx.util.Console('gx.zeyos.Checklist->addItem', e.message); }
	},

	/**
	 * @method search
	 * @description Evaluates a regular expression search query and displays the appropriate row
	 *
	 * @param {string} query The search query (regular expression)
	 */
	search: function(query) {
		try {
			var reg = new RegExp(query);
			this._elems.each(function(elem) {
				if (elem.value.search(reg) != -1)
					elem.row.setStyle('display', 'table-row');
				else
					elem.row.setStyle('display', 'none');
			}, this);
		} catch(e) { gx.util.Console('gx.zeyos.Checklist->search', e.message); }
	},

	/**
	 * @method reset
	 * @description Unchecks all checkboxes
	 */
	reset: function() {
		try {
			this._elems.each(function(elem) {
				elem.input.setUnchecked();
			});
		} catch(e) { gx.util.Console('gx.zeyos.Checklist->reset', e.message); }
	},

	/**
	 * @method getValues
	 * @description Returns an array of all the checked boxes' values
	 */
	getValues: function() {
		try {
			var values = [];
			this._elems.each(function(elem) {
				if (elem.input.getState())
					values.push(elem.input.getValue());
			});
			return values;
		} catch(e) {
			gx.util.Console('gx.zeyos.Checklist->getValues', e.message);
			throw e;
		}
	},

	/**
	 * @method load
	 * @description Sends a request to the specified URL
	 *
	 * @param {string} url The URL to send the request to
	 * @param {object} data The request data
	 */
	load: function(url, data) {
		var root = this;
		try {
			this._elems = [];
			this._bg = '';
			this._display.table.empty();

			if (url == null) url = root.options.url;
			if (data == null) data = root.options.requestData;

			var req = new Request({
				'method': root.options.method,
				'url': url,
				'data': data,
				'onComplete': function() {
					root._display.frame.removeClass('loader');
				},
				'onSuccess': function(res) {
					try {
						var obj = JSON.decode(res);
						if (isArray(obj)) {
							root.buildList(obj);
						} else {
							gx.util.Console('gx.zeyos.Checklist->search', 'Invalid server answer: ' + res);
						}
					} catch(e) {
						gx.util.Console('gx.zeyos.Checklist->search', e.message);
					}
				},
				'onRequest': function() {
					root._display.frame.addClass('loader');
				}
			});
			req.send();
		} catch(e) { gx.util.Console('gx.zeyos.Checklist->search', e.message); }
	}
});

/**
 * @class gx.ui.Blend
 * @description Puts a blend over a defined container
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 *
 * @param {string|node} display
 * @param {object} options
 *
 * @option {string} color The color of the blend mask
 * @option {string} freezeColor The freeze color of the blend mask
 * @option {float} opacity Target opacity of the mask
 * @option {string} transition MooTools Fx.Transition function
 * @option {int} duration Blend effect duration in milliseconds
 * @option {bool} loader Show a loader bar
 * @option {bool} open Open on initialization
 * @option {int} z-index The z index of the blend
 *
 * @event show When the blend is being displayed
 * @event hide When the blend is being hided
 * @event complete When either show/hide is completed
 *
 * @sample Blend Displaying and hiding a div element using gx.ui.Blend
 */
gx.ui.Blend = new Class({

	gx: 'gx.ui.Blend',
	Extends: gx.ui.Container,
	options: {
		'color': '#FFF',
		'freezeColor': '#333',
		'opacity': '0.8',
		'transition': 'quad:in',
		'duration': '300',
		'loader': true,
		'open': false,
		'z-index': 100
	},
	_isOpen: false,
	_isFrozen: false,
	_inAction: false,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			if (this._display.root == document.body) {
				var position = 'fixed';
				var correction = 100;
			} else {
				var position = 'absolute';
				var correction = 0;
			}
			this._display.blend = new Element('div', {'styles': {
				'background-color': root.options.color,
				'opacity': '0',
				'display': 'none',
				'z-index': root.options['z-index'],
				'position': position,
				'top': root._coordinates.top,
				'left': root._coordinates.left,
				'width': root._coordinates.width + correction,
				'height': root._coordinates.height + correction
			}});
			if (this.options.loader)
				this._display.blend.set('class', 'gxUiBlendLoader');

			this._display.blend.inject(this._display.root);

			if (this.options.open) {
				this._isOpen = true;
				this._display.blend.setStyles({
					'opacity': root.options.opacity,
					'display': 'block'
				});
			}
			this._parent.addEvent('resize', function() {
				root.getCoordinates();
				root._display.blend.setStyles(root._coordinates);
			});
			this._display.blend.addEvent('click', function(event) { root.fireEvent('click', [ event ]); });
			this._display.blend.addEvent('dblclick', function(event) { root.fireEvent('dblclick', [ event ]); });
		} catch(e) { gx.util.Console('gx.ui.Blend->initialize', e.message); }
	},

	/**
	 * @method start
	 * @description Executes the open/close action
	 * @param {bool} doOpen Show the blend
	 */
	start: function(doOpen) {
		var root = this;
		try {
			if( this._inAction === true ) {
				var tween = this._display.blend.get('tween');
				tween.cancel();
				this._inAction = false;
				this.start(doOpen);
				return;
			}
			this._inAction = true;
			if (this._isOpen != doOpen && !this._isFrozen) {
				if (doOpen)
					this._display.blend.setStyle('display', 'block');
				var tween = new Fx.Tween(this._display.blend, {
					property: 'opacity',
					duration: root.options.duration,
					transition: root.options.transition,
					onComplete: function() {
						if (doOpen)
							root.fireEvent('show');
						else {
							root._display.blend.setStyle('display', 'none');
							root.fireEvent('hide');
						}
						root._isOpen = doOpen;
						root.fireEvent('complete');
						this._inAction = false;
					}
				});
				this._display.blend.store('tween', tween);
				tween.start( doOpen ? this.options.opacity : 0 );
			}
		} catch(e) { gx.util.Console(root.gx + '->start', e.message); }
	},
	/**
	 * @method lock
	 * @description Freezes/Unfreezes the blend
	 * @param {bool} doFreeze Freeze the blend
	 */
	lock: function(doFreeze) {
		var root = this;
		try {
			if (this._isFrozen != doFreeze) {
				var morph = new Fx.Morph(this._display.blend, {
					duration: root.options.duration,
					transition: root.options.transition,
					onStart: function() {
						if (doFreeze)
							root._display.blend.erase('class');
					},
					onComplete: function() {
						root._isOpen = doFreeze;
						root._isFrozen = doFreeze;
						if (doFreeze)
							root.fireEvent('freeze');
						else {
							root._display.blend.setStyle('display', 'none');
							root.fireEvent('unfreeze');
							if (root.options.loader)
								root._display.blend.set('class', 'gxUiBlendLoader');
						}
					}
				});
				if (doFreeze)
					this._display.blend.setStyle('display', 'block');
				morph.start({
					'background-color': doFreeze ? root.options.freezeColor : root.options.color,
					'opacity': doFreeze ? root.options.opacity : 0
				});
			}
		} catch(e) { gx.util.Console(root.gx + '->lock', e.message); }
	},

	/**
	 * @method freeze
	 * @description Freezes the blend
	 */
	freeze: function() {
		this.lock(1);
	},

	/**
	 * @method unfreeze
	 * @description Unfreezes the blend
	 */
	unfreeze: function() {
		this.lock(0);
	},

	/**
	 * @method show
	 * @description Shows the blend
	 */
	show: function() {
		this.start(1);
	},

	/**
	 * @method hide
	 * @description Hides the blend
	 */
	hide: function() {
		this.start(0);
	},

	/**
	 * @method toggle
	 * @description Toggles between hiding and showing the blend
	 */
	toggle: function() {
		this.start(!this._isOpen);
	}

});

/**
 * @class gx.ui.Hud
 * @description Creates a "Head-Up Display" to display elements (e.g. popups or forms) above other elements
 * @extends gx.ui.Container
 * @implements gx.ui.Blend
 * @implements gx.util.Console
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 *
 * @param {string|node} display
 * @param {object} options
 *
 * @option {string} background
 * @option {float} opacity
 * @option {string} transition The MooTools Fx.Transition function
 * @option {int} duration The duration of the blend effect
 * @option {bool} open Open on initialization
 * @option {bool} blend
 * @option {string} x
 * @option {string} y
 *
 * @event click When the HUD blend is clicked
 * @event dblclick When the HUD blend is double-clicked
 *
 * @sample Hud Displaying a element above another one inside a HUD
 */
gx.ui.Hud = new Class({
	gx: 'gx.ui.Hud',
	Extends: gx.ui.Container,
	options: {
		'background': '#333',
		'opacity': '0.8',
		'transition': 'quad:in',
		'duration': '300',
		'open': true,
		'blend': true,
		'x': 'center',
		'y': 'center'
	},
	_isOpen: false,
	_children: {},
	_active: [],
	_position: {},
	initialize: function(display, options) {
		var root = this;
		try {
			if (display == null)
				display = document.body;
			this.parent(display, options);
			this._display.hud = new Element('div', {'styles': {'position': 'relative','background':'red'}});
			this._blend = new gx.ui.Blend(display, {
				'opacity': root.options.opacity,
				'transition': root.options.transition,
				'loader': false,
				'open': false
			});
			display.adopt(this._display.hud);

			// Forward some events from the blend
			this._blend.addEvent('click', function(event) { root.fireEvent('click', [ event ]); });
			this._blend.addEvent('dblclick', function(event) { root.fireEvent('dblclick', [ event ]); });

			if (this.options.open) {
				this._isOpen = true;
				this._display.hud.setStyles({
					'opacity': 1,
					'display': 'block'
				});
			}

			this._parent.addEvent('resize', function() {
				root.getCoordinates();
				var coordinates = Object.clone(root._coordinates);
				delete coordinates.height;
				root._display.hud.setStyles(coordinates);
			}.bind(this));
		} catch(e) { gx.util.Console('gx.ui.Hud->initialize', e.message); }
	},

	/**
	 * @method setPosition
	 * @description Sets the position of a element within the HUD (mind z-index in intersections)
	 * @param {node} elem The HTML element to be positioned
	 * @param {string} x The position along the x axis (left, right, center)
	 * @param {string} y The position along the y axis (top, bottom, center)
	 */
	setPosition: function(elem, x, y) {
		var root = this;
		try {
			if (x == null) x = this.options.x;
			if (y == null) y = this.options.y;
			this.getCoordinates();
			var coordinates = elem.getCoordinates();
			if (x == 'left')
				elem.setStyle('left', 0);
			else if (x == 'right')
				elem.setStyle('left', this._coordinates.width - coordinates.width);
			else
				elem.setStyle('left', (this._coordinates.width - coordinates.width)/2);
			if (y == 'top')
				elem.setStyle('top', 0);
			else if (y == 'bottom')
				elem.setStyle('top', this._coordinates.height - coordinates.height);
			else
				elem.setStyle('top', (this._coordinates.height - coordinates.height)/2);

		} catch(e) { gx.util.Console('gx.ui.Hud->setPosition: ', e.message); }
	},

	/**
	 * @method add
	 * @description Adds a HTML element as child of the HUD
	 * @param {string} name Name of the child element
	 * @param {node} elem The HTML element to be added
	 * @param {string} position Object defining the element's position, e.g. {x: 'center', y: 'top}
	 * @param {bool} fixed Add the position as fixed rather than absolute
	 */
	add: function(name, elem, position, fixed) {
		var root = this;
		if (position == null) position = {};
		if (position.x == null) position.x = this.options.x;
		if (position.y == null) position.y = this.options.y;
		if (fixed == true)
			var pos = 'fixed';
		else
			var pos = 'absolute';
		this._children[name] = elem;
		this._position[name] = position;
		elem.inject(this._display.hud);
		elem.setStyles({'opacity': 0, 'visibility': 'hidden', 'position': pos});
		this._parent.addEvent('resize', function() {
			root.setPosition(elem, position.x, position.y);
		});
		this.setPosition(elem, position.x, position.y);
	},

	/**
	 * @method show
	 * @description Shows a child element
	 * @param {string} name Name of the child element
	 * @param {bool} hideOther Hides all other open elements
	 * @param {bool} withBlend Opens the HUD with a blend
	 */
	show: function(name, withBlend, hideOthers) {
		if (withBlend == true) this.showBlend();
		if (hideOthers != null && hideOthers == true) {
			for (child in this._children) {
				if (child == name) {
					this._children[child].fade('in');
					this._active.push(child);
				} else {
					this._children[child].fade('out');
					this._active.erase(child);
				}
			}
		} else if (this._children[name] != null) {
			this._children[name].fade('in');
			this._active.push(name);
		}
		if (this._children[name] != null)
			this.setPosition(this._children[name], this._position[name].x, this._position[name].y);
	},

	/**
	 * @method hide
	 * @description Hides a specified child or (if not specified) all children. If all children are closed, the HUD will be closed
	 * @param {string|null} name Name of the child element (if none specified, all children will be hidden)
	 */
	hide: function(name) {
		if (name != null)
			this._children[name].fade('out');
		else
			for (child in this._children)
				this.hide(child);
		if (this._active.length < 1)
			alert(JSON.encode(this._active));
		this.hideBlend();
	},

	/**
	 * @method showBlend
	 * @description Shows the blend
	 */
	showBlend: function() {
		this._blend.freeze();
	},

	/**
	 * @method hideBlend
	 * @description Hides the blend
	 */
	hideBlend: function() {
		this._blend.unfreeze();
	}
});

gx.com = {};

/**
 * @class gx.com.Statusbar
 * @description Component for displaying a message box or statusbar.
 * @extends gx.ui.Container
 * @implements gx.util.Console
 * 
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 * 
 * @param {string|node} display
 *
 * @option {string} message The message to display
 * @option {float} progress The progress to start from
 */
gx.com.Statusbar = new Class(
	{
	gx: 'gx.com.Statusbar',
	Extends: gx.ui.Container,
	options: {
		'message': null,
		'progress': 0
	},
	isOpen: true,
	_progress: 0,
	
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this._progress = this.options.progress;
			this.build();
			this.addEvent('resize', function() { root.getBarWidth(); });
		} catch(e) { gx.util.Console('gx.com.Statusbar->initialize: ', e.message); }
	},
	
	
	/**
	 * @method build
	 * @description Builds the component
	 */
	build: function() {
		var root = this;
		try {
			Object.append(this._display, {
				'frame': new Element('div', {'class': 'gxStatusbarFrame'}),
				'bar': new Element('div', {'class': 'gxStatusbarBar'}),
				'label': new Element('div', {'class': 'gxStatusbarLabel'})
			});
			this._display.root.adopt(this._display.frame);
			this._display.frame.adopt(this._display.bar);
			this._display.frame.adopt(this._display.label);
			this.getBarWidth();
			this.setProgress(root.options.progress, root.options.message, false);
		} catch(e) { gx.util.Console(root.gx + '->build', e.message); }
	},
	
	/**
	 * @method getBarWidth
	 * @description Gets the available width for the statusbar
	 */
	getBarWidth: function() {
		this._barWidth = this._display.frame.getSize().x - this._display.frame.getStyle('padding-left').toInt() - this._display.frame.getStyle('padding-right').toInt() - this._display.frame.getStyle('border-left-width').toInt() - this._display.frame.getStyle('border-right-width').toInt();
	},
	/**
	 * @method setMessage
	 * @description Sets a status message
	 * @param {string} msg The message (text) to set
	 */
	setMessage: function(msg) {
		if (msg == null)
			this._display.label.setStyle('display', 'none');
		else {
			this._display.label.setStyle('display', 'block');
			this._display.label.set('text', msg);
		}
	},
	/**
	 * @method incProgress
	 * @description Increase the progress
	 * @param {float} prog The percentage to increase
	 * @param {string} msg The new status message
	 */
	incProgress: function(prog, msg) {
		var target = this._progress;
		if (typeOf(prog) == 'number')
			target = target + prog;
		if (target > 1)
			target = 1;
		this.setProgress(target, msg);
	},
	/**
	 * @method setProgress
	 * @description Sets the current progess of the statusbar
	 * @param {float} prog The target progress
	 * @param {string} msg The new status message
	 * @param {bool} useTween Animate the bar
	 */
	setProgress: function(prog, msg, useTween) {
		if (typeOf(prog) == 'number') {
			this._progress = prog;
			var width = this._barWidth * this._progress;
			if ( useTween ) {
				tween = new Fx.Tween(this._display.bar);
				tween.start('width', width);
			} else
				this._display.bar.setStyle('width', width);
			if (msg != null)
				this.setMessage(msg);
		}
	}
});

/**
 * @class gx.com.Message
 * @description Displays a message box or status bar.
 * @extends gx.ui.Hud
 * @implements gx.com.Statusbar
 * @erquires Fx.Morph
 * @sample Message An example demonstrating message boxes and status bars.
 *
 * @param {string|node} display
 *
 * @option {int} messageWidth The width of the message
 * @option {float} opacity The opacity of the message
 * @option {int} duration The duration the message will stay
 * @option {bool} blend Apply a blend effect
 * @option {bool} fixed Set the message fixed
 * @option {string} x The x-value of the message's position
 * @option {string} y The y-value of the message's position
 */
gx.com.Message = new Class({
	Extends: gx.ui.Hud,
	options: {
		'messageWidth': 300,
		'opacity': 0.9,
		'duration': 3000,
		'blend': false,
		'fixed': true,
		'z-index': 120,
		'x': 'center',
		'y': 'top'
	},
	initialize: function(display, options) {
		var root = this;
		this.parent(display, options);
		this._messages = new Array();
		this._display.windows = new Element('div', {'class': 'gxMessage', 'styles': {
			'width': root.options.messageWidth,
			'position': 'absolute',
			'z-index': root.options['z-index']
		}});
		this.add('messages', this._display.windows, {'x': root.options.x, 'y': root.options.y}, root.options.fixed);
		this.show('messages');
	},

	/**
	 * @method addMessage
	 * @description Adds a Message
	 * @param {string} msg The message text
	 * @param {string} iconClass The icon class
	 * @param {bool} closable User can close the message
	 * @param {bool} blend Apply a blend effect
	 * @param {bool} autoclose Message will close automatically
	 */
	addMessage: function(msg, iconClass, closable, blend, autoclose) {
		var root = this;
		var elem = new Element('div', {'class': 'gxMessageBox', 'styles': {
			'position': 'absolute',
			'width': root.options.messageWidth,
			'opacity': 0,
			'visibility': 'hidden'
		}});
		if (typeOf(msg) != 'element') {
			msg = new Element('div', {'class': 'gxMessageInner', 'text': msg});
			if (iconClass == null) iconClass = 'info';
			msg.addClass(iconClass);
		}
		elem.adopt(msg);

		if (closable != false)
			elem.addEvent('click', function() {
				root.closeMessage(elem);
			});
		this._display.windows.adopt(elem);
		var dim = elem.getSize();
		elem.setStyles({
			'height': 0,
			'position': 'static',
			'visibility': 'visible',
			'overflow': 'hidden'
		});
		var tween = new Fx.Morph(elem, {'duration': 'short'})
		if (blend == true) this.showBlend();
		tween.start({
			'opacity': root.options.opacity,
			'height': dim.y
		});
		this._messages.push(elem);
		if (root.options.duration > 0 && autoclose !== false)
			root.closeMessage.delay(root.options.duration, this, elem);
		return elem;
	},

	/**
	 * @method closeMessage
	 * @description Closes a message box
	 * @param {node} elem The message's element
	 */
	closeMessage: function(elem) {
		var root = this;
		var tween = new Fx.Morph(elem, {
			onComplete: function() {
				root._messages.erase(elem);
				elem.destroy();
				if (root._messages.length < 1)
					root.hideBlend();
			}
		})
		tween.start({
			'opacity': 0,
			'height': 0
		});
	},

	/**
	 * @method clear
	 * @description Removes all open message boxes
	 */
	clear: function() {
		var root = this;
		this._messages.each(function(elem) {
			root.closeMessage(elem);
		});
		this._messages = [];
		this.hideBlend();
	},

	/**
	 * @method showStatus
	 * @description Shows a status bar
	 * @param {float} progress The progress made
	 * @param {string} message The message to display
	 * @param {bool} blend Apply a blend effect
	 */
	showStatus: function(progress, message, blend) {
		if (this._display.status == null) {
			var stat = new Element('div', {'class': 'gxMessageStatus'});
			this._display.status = this.addMessage(stat, null, false, blend, false)
			this._statusbar = new gx.com.Statusbar(stat, {
				'message': message,
				'progress': progress
			});
		} else
			this.incProgress(progress, message);
	},

	/**
	 * @method hideStatus
	 * @description Hides the status bar
	 */
	hideStatus: function() {
		var root = this;
		if (this._display.status != null) {
			this.closeMessage(this._display.status);
			this._display.status = null;
			this._statusbar = null;
		}
	},

	/**
	 * @method incProgress
	 * @description Increases the progress of the status bar
	 * @param {float} progress The amount by which to increase the progress
	 * @param {string} message The message to display
	 */
	incProgress: function(progress, message) {
		if (this._statusbar != null)
			this._statusbar.incProgress(progress, message);
	},

	/**
	 * @method setProgress
	 * @description Sets the progress of the status bar
	 * @param {float} progress The progress to set
	 * @param {string} message The message to display
	 * @param {object} tween The tween
	 */
	setProgress: function(progress, message, tween) {
		if (this._statusbar != null)
			this._statusbar.setProgress(progress, message, tween);
	}
});


/**
 * @class gx.zeyos.Client
 * @description Component for performing HTTP requests while displaying a status bar as well as status messages.
 * @extends gx.core.Settings
 * @implements gx.com.Message
 * @event request
 * @event complete
 * @event failure
 * @option url The request URL
 */
gx.zeyos.Client = new Class({
	// gx.core.Settings
	options: {
		'url': './remotecall.php'
	},
	
	post: function(path, data, callback, resulttype) {
		this.request(data, 'POST', callback, resulttype, path);
	},
	
	get: function(path, data, callback, resulttype) {
		this.request(data, 'GET', callback, resulttype, path);
	},
	
	/**
	 * @method request
	 * @description Performs a request and displays the status
	 * @param {object} data The request data
	 * @param {string} method The HTTP method
	 * @param {function|object} callback The callback function or object
	 * @param {string} resulttype The result type
	 * @param {string} path
	 */
	request: function(data, method, callback, resulttype, path) {
		var root = this;
		var req = new Request({
			'url': root.options.url + (path == null ? '' : path),
			'method': (method == null ? 'GET' : method),
			'data': data,
			'onRequest': function() {
				// root._msg.showStatus(0.7, 'Requesting...');
			},
			'onComplete': function() {
				// root._msg.hideStatus();
			},
			'onFailure': function() {
				ZeyOSApi.showMsgRuntimeError('Connection error! Could not retrieve data from server!');
			}
		});
		if (isFunction(callback)) {
			req.addEvent('complete', function(res) {
				if (resulttype != null) {
					res = JSON.decode(res);
					var t = typeOf(res);
					if (t != resulttype) {
						if (t == 'object' && res.message != null)
							ZeyOSApi.showMsgRuntimeErrore('Server error: ' + res.message);
						else
							ZeyOSApi.showMsgRuntimeError('Invalid server response! Server returned "' + t + '", "' + resulttype + '" expected!');
						res = false;
					}
				}
				callback.run([res], root);
			})
		} else if (isObject(callback)) {
			for (evtType in callback)
				req.addEvent(evtType, callback[evtType]);
		}
		req.send();
	}
});
/**
 * @class gx.zeyos.DatePicker
 * @description Creates a datepicker to select a single month
 * @extends gx.ui.Container
 * @implements DatePicker
 *
 * @param {element|string} display The display element
 *
 * @option {date} date The start date
 *
 * @event select When the month is changed
 */
gx.zeyos.DatePicker = new Class({

	gx: 'gx.zeyos.DatePicker',

	Extends: gx.ui.Container,

	options: {
		'date'          : false,
		'format'        : '%a %d.%m.%Y %H:%M',
		'return_format' : '%s',
		'width'         : '130px',
		'positionOffset': {x: 0, y: 0},
		
		'timePicker'    : true,
		'picker'        : {},
		'readOnly'      : false
	},

	_date: false,

	_picker: undefined,

	/**
	 * Holds functions bound to this instance's scope.
	 */
	bound: {},

	initialize: function (display, options) {
		try {
			this.parent(display, options);

			this._display.input = new Element('input', {
				'type'  : 'text',
				'class' : 'span2',
				'styles': {
					'width': this.options.width
				}
			});

			this._display.root.adopt(
				new Element('fieldset', {
					'class': 'datepicker_zeyos_fieldset'
				}).adopt(this._display.input)
			);

			this.bound.dateSelect = this.dateSelectHandler.bind(this);

			if ( typeOf(this.options.date) != 'date' )
				this.options.date = new Date();

			this.createPicker();
			this.set(this.options.date);

		} catch(e) {
			gx.util.Console('gx.bootstrap.DatePicker->initialize', gx.util.parseError(e) );
		}
	},

	createPicker: function () {
		var oldPicker = this._picker;

		this._picker = new Picker.Date(this._display.input, Object.merge({
			'positionOffset': this.options.positionOffset,
			'pickerClass'   : 'datepicker_zeyos',
			'format'        : this.options.format,
			'scanAlwaysGoUp': false,
			'draggable'     : false,
			'timePicker'    : this.options.timePicker,
			'toggle'        : this._display.btnSelect
		}, this.options.picker))
			.addEvent('select', this.bound.dateSelect);

		if ( this.options.readOnly ) {
			this._display.input.setProperty('readonly', 'readonly');
			this._picker.detach();
		} else {
			this._display.input.erase('readonly');
		}

		if ( oldPicker )
			oldPicker.destroy();

		return this;
	},

	dateSelectHandler: function (date) {
		this._date = date;
		this.fireEvent('select', date);
	},

	/**
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.DatePicker
	 */
	setReadOnly: function (readOnly) {
		this.options.readOnly = !!readOnly;
		this.createPicker();
		return this;
	},

	/**
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.DatePicker
	 */
	setFormat: function (format, enableTimePicker) {
		this.options.format     = format;
		this.options.timePicker = enableTimePicker;

		this.createPicker();

		if ( typeOf(this._date) === 'date' )
			this.set(this._date);

		return this;
	},

	/**
	 * @method set
	 * @description Sets the date
	 * @param {date} date
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.DatePicker
	 */
	set: function (date) {
		if ( date != null )
			this._picker.select(typeOf(date) == 'date' ? date : Date.parse(date));
		return this;
	},

	/**
	 * @method get
	 * @description Gets the current date object
	 * @return {date}
	 */
	get: function (format) {
		if ( format != null )
			return this._date.format(format);
		else if ( this.options.return_format != null )
			return this._date.format(this.options.return_format);
		else
			return this._date;
	},

	/**
	 * @method getSeconds
	 * @description Gets the current UNIX timestamp
	 * @return {int}
	 */
	getSeconds: function () {
		return this._date.getTime() / 1000;
	}

});

/**
 * @class gx.zeyos.Datebox
 * @description Creates a box for times, separating hours and minutes
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {float} timestamp The initial time of the element
 * @option {string} unit The default input unit (milliseconds, seconds)
 * @option {array} format The format of the date box (d: day, m: month, y: year)
 * @option {array} month The month ("Jan.", ...)
 *
 * @event update
 *
 * @sample Datebox Simple datebox example.
 */
gx.zeyos.Datebox = new Class({
	gx: 'gx.zeyos.Datebox',
	Extends: gx.ui.Container,
	options: {
		'timestamp': 0,
		'unit': 'milliseconds',
		'format': ['d', '.', 'M', '.', 'y', '&nbsp;', 'h', ':', 'i'],
		'month': ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.']
	},
	_fields: {},
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this.build();
		} catch(e) { gx.util.Console('gx.zeyos.Datebox->initialize', e.message); }
	},

	/**
	 * @method buildField
	 * @description Creates a field according to the date format
	 * @param {string} field The part of the date format string (e.g. 'd' for 'day')
	 */
	buildField: function(field) {
		var root = this;
		try {
			var elem, width, name = false;
			switch (field) {
				case 'd':
					name = name || 'day';
					width = width || 25;
				case 'm':
					name = name || 'month';
					width = width || 25;
				case 'y':
					name = name || 'year';
					width = width || 45;
				case 'h':
					name = name || 'hour';
					width = width || 25;
				case 'i':
					name = name || 'minute';
					width = width || 25;
				case 's':
					name = name || 'second';
					width = width || 25;
					elem = new Element('input', {'type': 'text', 'styles': {'width': width + 'px', 'text-align': 'center'}});
					break;
				case 'M':
					name = 'month';
					elem = new Element('select');
					this.options.month.each(function(month, index) {
						elem.adopt(new Element('option', {'value': root.addZero(index+1), 'html': month}));
					});
					break;
				default:
					return field;
			}

			this._fields[name] = elem;
			return elem;
		} catch(e) {
			gx.util.Console('gx.zeyos.Datebox->buildField', e.message);
			throw e;
		}
	},

	/**
	 * @method build
	 * @description Adds the built fields
	 */
	build: function() {
		var root = this;
		try {
			var format = this.options.format;
			var first = true;
			format.each(function(field) {
				var elem = this.buildField(field)
				if (typeOf(elem) == 'element') {
					this._display.root.adopt(elem);
					
					elem.addEvent(elem.get('tag') == 'select' ? 'change' : 'blur', function() {
						root.update();
					});
				} else {
					this._display.root.adopt(new Element('span', {'html': elem, 'styles': {'padding': '0 2px'}}));
				}
			}, this);
		} catch(e) { gx.util.Console('gx.zeyos.Datebox->build', e.message); }
	},

	/**
	 * @method update
	 * @description Updates the time and fires event 'update'
	 */
	update: function() {
		var t = this.get();
		this.set(t);
		this.fireEvent('update', t);
	},

	/**
	 * @method addZero
	 * @description Adds a zero in front of the number if it is smaller than 10
	 * @param {int} num The number in question
	 */
	addZero: function(num) {
		return (num < 10) ? '0' + num : num;
	},

	/**
	 * @method parseField
	 * @description Parses the given value by preventing NaN (returns 0 if NaN, value otherwise)
	 * @param {int} value The value to parse
	 */
	parseField: function(value) {
		value = parseInt(value, 10);
		return isNaN(value) ? 0 : value;
	},

	/**
	 * @method set
	 * @description Sets the timestamp according to the given unit
	 * @param {int} timestamp The timestamp
	 * @param {string} unit The unit
	 */
	set: function(timestamp, unit) {
		try {
			timestamp = parseInt(timestamp, 10);
			if (unit == null)
				unit = this.options.unit;
			if (unit == 'seconds')
				timestamp = timestamp * 1000;

			var d = new Date(timestamp);

			if (this._fields.day)
				this._fields.day.set('value', this.addZero(d.getDate()));
			if (this._fields.month)
				this._fields.month.set('value', this.addZero(d.getMonth()+1));
			if (this._fields.year)
				this._fields.year.set('value', this.addZero(d.getFullYear()));
			if (this._fields.hour)
				this._fields.hour.set('value', this.addZero(d.getHours()));
			if (this._fields.minute)
				this._fields.minute.set('value', this.addZero(d.getMinutes()));
			if (this._fields.second)
				this._fields.second.set('value', this.addZero(d.getSeconds()));
		} catch(e) { gx.util.Console('gx.zeyos.Datebox->set', e.message); }
	},

	/**
	 * @method get
	 * @description Gets the time according to the given unit
	 * @param {string} unit The unit
	 */
	get: function(unit) {
		try {
			if (unit == null)
				unit = this.options.unit;

			var d = new Date(
				this._fields.year ? this.parseField(this._fields.year.get('value')) : 1970,
				this._fields.month ? this.parseField(this._fields.month.get('value'))-1 : 0,
				this._fields.day ? this.parseField(this._fields.day.get('value')) : 1,
				this._fields.hour ? this.parseField(this._fields.hour.get('value')) : 0,
				this._fields.minute ? this.parseField(this._fields.minute.get('value')) : 0,
				this._fields.second ? this.parseField(this._fields.second.get('value')) : 0
			);

			if (unit == 'seconds')
				return d.getTime() / 1000;

			return d.getTime();
		} catch(e) {
			gx.util.Console('gx.zeyos.Datebox->get', e.message);
			throw e;
		}
	},

	/**
	 * @method enable
	 * @description Enables the date field
	 */
	enable: function() {
		if (this._fields.day)
			this._fields.day.erase('disabled');
		if (this._fields.month)
			this._fields.month.erase('disabled');
		if (this._fields.year)
			this._fields.year.erase('disabled');
	},

	/**
	 * @method disable
	 * @description Disables the date field
	 */
	disable: function() {
		if (this._fields.day)
			this._fields.day.set('disabled', true);
		if (this._fields.month)
			this._fields.month.set('disabled', true);
		if (this._fields.year)
			this._fields.year.set('disabled', true);
	}
});

/**
 * @class gx.zeyos.Factory
 * @description Use to easily create ZeyOS html elements.
 *
 * @extends gx.ui.Container
 */
gx.zeyos.Factory = {
	gx: 'gx.zeyos.Factory',

	/**
	 * icons: {
	 *	   'list'
	 *	   'plus'
	 *	   'clock'
	 *	   'range'
	 *	   'reload'
	 *	   'clear'
	 *	   'settings'
	 *	   'eye'
	 *	   'trash'
	 *	   'fields'
	 *	   'search'
	 *	   'lock'
	 *	   'checked'
	 * }
	 *
	 * @method Icon
	 * @description Get icon sign from icon name. Used for buttons.
	 * @param {string} ico Icon name.
	 */
	Icon: function(ico) {
		if ( ico == 'list' )
			ico = 'l';
		else if ( ico == 'plus' )
			ico = '⊕';
		else if ( ico == 'clock' )
			ico = '⌚';
		else if ( ico == 'range' )
			ico = 's';
		else if ( ico == 'reload' )
			ico = '⟲';
		else if ( ico == 'clear' )
			ico = 'd';
		else if ( ico == 'settings' )
			ico = 'e';
		else if ( ico == 'eye' )
			ico = 'E';
		else if ( ico == 'trash' )
			ico = 'T';
		else if ( ico == 'fields' )
			ico = 'g';
		else if ( ico == 'search' )
			ico = 'z';
		else if ( ico == 'lock' )
			ico = 'L';
		else if ( ico == 'checked' )
			ico = '✔';
		else if ( ico == 'question' )
			ico = '?';
		else
			alert('unsupported icon');

		return ico;
	},

	/**
	 * types: {
	 *    ''     = gray
	 *    'em'   = gray
	 *    'grey' = gray
	 *    'gray' = gray
	 *
	 *    'dark' = dark
	 * }
	 *
	 * ico @see gx.zeyos.Factory.Icon()
	 *
	 * @method Button
	 * @description Return button element.
	 * @param {string} ico Icon name.
	 */
	Button: function(text, type, ico, options) {
		if ( options == undefined )
			options = {};

		if ( type == null )
			type = '';
		else if ( type == 'dark' )
			type = 'em';
		else if ( type == 'gray' || type == 'grey' )
			type = '';

		if ( ico != undefined )
			ico = gx.zeyos.Factory.Icon(ico);
		else
			ico = '';

		var button = new Element('button', Object.merge({
			'type': 'button',
			'value': text,
			'class': type,
			'html': text
		}, options));

		if ( text == null || text == '' )
			button.set('data-ico', ico);
		else
			button.set('data-ico-a', ico);

		return button;
	},

	/**
	 * @method ButtonsGroup
	 * @description Create group of buttons
	 * @param {array} buttons Array of buttons to group.
	 */
	ButtonsGroup: function(buttons) {
		return new Element('div', {
			'class': 'grp'
		}).adopt(buttons);
	},

	/**
	 * @method Panel
	 * @description Create simple toggle panel
	 * @param {html element} display Html element to adopt the panel.
	 * @param {string|html element} title Title of the panel.
	 * @param {string|html element} content Content of the panel.
	 * @param {boolean} open Open panel after creation.
	 */
	Panel: new Class({
		Extends: gx.ui.Container,
		initialize: function(display, title, content, open) {
			var root = this;
			this._title = new Element('h1').addEvent('click', function(){
				root.toggle();
			});
			this._content = new Element('div', {
				'class': 'b-25 bg-W d-b'
			});
			this._section = new Element('section', {
				'class': 'bg-E br_b-5 bsd-3 p-7'
			});

			this.parent(display);
			this.toElement().set({'class': 'm_l-10 m_r-10 m_t-10'}).adopt([
				this._title,
				this._section.adopt([
					this._content
				])
			]);

			if ( title != null )
				this.setTitle(title);

			if ( content != null )
				this.setContent(content);

			if ( open == undefined || open != false )
				this.open();
		},

		setTitle: function(title) {
			if ( isString(title) ) {
				this._title.set('html', title);
			} else {
				this._title.empty();
				this._title.adopt(title);
			}
		},

		setContent: function(content) {
			if ( isString(content) ) {
				this._content.set('html', content);
			} else {
				this._content.empty();
				this._content.adopt(content);
			}
		},

		open: function() {
			this._title.addClass('act');
			this._section.show();
		},

		close: function() {
			this._title.removeClass('act');
			this._section.hide();
		},

		toggle: function() {
			if ( this._title.hasClass('act') )
				this.close();
			else
				this.open();
		}
	})
};

/**
 * @class gx.zeyos.Dropdown
 * @description Create ZeyOS drop down menu.
 * @extends gx.core.Settings
 * @implements gx.zeyos.Factory
 * @implements gx.ui.Blend
 *
 * @param {html element} display Html element to adopt the panel.
 * @param {object} Options
 * @option {string} label The name of the field.
 * @option {object} items Html element to adopt the panel.
 * @option {boolean} resettable Add item to reset dropdown -> Set no value.
 * @option {string} resetprefix Prefix string for the reset item name = resetprefix + name.
 * @option {boolean} compact Create more compact dropdown. Hide label and tick img.
 *
 * @sample Dropdown Simple Dropdown example.
 */
(function() {
	var drpRegistry = [];
	window.addEvent('click', function(event) {
		for ( var i in drpRegistry ) {
			if ( !drpRegistry.hasOwnProperty(i) )
				continue;
			var drp = drpRegistry[i],
				close = true;
			var check = event.target;
			for ( var e = 0; e < 4; e++ ) {
				if ( check == undefined )
					break;

				if ( check == drp._display.frame ) {
					close = false;
					break;
				}
				check = check.getParent();
			}
			if ( close )
				drp.close();
		}
	});

	gx.zeyos.Dropdown = new Class({
		gx: 'gx.zeyos.Dropdown',

		Extends: gx.ui.Container,

		options: {
			width: null,
			resettable: false,
			emptyCaption: null,
			label: false,
			compact: false,
			upside: false
		},

		_selected: null,
		_items: {},
		_resetItem: null,

		initialize: function(display, options) {
			this.parent(display, options);

			var root = this;

			this._display.frame = new Element('div', {
				'class': 'drp'
			});
			this._display.button = new Element('button', {'type': 'button', 'html': this.options.label ? this.options.label : ''}).addEvent('click', function(event) {
				event.preventDefault();
				root.toggle();
			});

			if ( options.compact )
				this._display.frame.addClass('compact');

			this._display.section = new Element('section');
			this._display.root.adopt([
				this._display.frame.adopt([
					this._display.button,
					this._display.section
				])
			]);

			if ( this.options.items != undefined ) {
				this.setItems(this.options.items);
				if ( this._resetItem )
					this._resetItem.addClass('act');
			}

			if ( this.options.width != null ) {
				this._display.button.setStyles({
					'width': this.options.width,
					'overflow': 'hidden',
					'text-overflow': 'ellipsis'
				});
			}

			drpRegistry.push(this);
		},

		setItems: function(items) {
			this._items = {};
			var root = this;
			this._display.section.empty();

			if ( this.options.resettable ) {
				this._resetItem = new Element('fieldset', {
					'class': 'drp_item',
					'html': '<span style="font-style:italic;">' + (
						this.options.emptyCaption
						? this.options.emptyCaption
						: 'Empty'
					) + '</span>',
					'data-value': ''
				});
				this._resetItem.addEvent('click', function(event) {
					root.reset();
					event.stop();
				});
				this._display.section.adopt(this._resetItem);
			}

			var addLink = function(link, value, text) {
				link.addEvent('click', function(event){
					root.selectItem(value, text);
					event.stop();
				});
			}

			var text, html, clickfunc;
			for ( var value in items ) {
				if ( !items.hasOwnProperty(value) )
					continue;

				if (typeof items[value] == 'object') {
					text      = items[value].text;
					html      = items[value].html;
					clickfunc = items[value].onClick == null ? false : items[value].onClick
				} else {
					text      = items[value];
					html      = items[value];
					clickfunc = false;
				}

				var element = __({
					'tag'        : 'fieldset',
					'class'      : 'drp_item',
					'child'      : html,
					'data-value' : value
				});

				this._items[value] = element;

				if (!clickfunc)
					addLink(element, value, text);
				else
					element.addEvent('click', clickfunc);

				this._display.section.adopt(element);
			}

			return this;
		},

		selectItem: function(value, text) {
			if ( this._selected )
				this._selected.removeClass('act');
			if ( this._resetItem )
				this._resetItem.removeClass('act');

			this._display.frame.set('data-value', value);
			this._display.button.empty();
			if ( !this.options.compact && this.options.label)
				this._display.button.adopt(new Element('b', {'html': this.options.label + ': '}));

			// this._display.button.adopt(document.createTextNode(text));
			this._display.button.set('html', this._display.button.get('html') + text);
			this._display.button.set('title', text);

			this._selected = this._items[value];
			if ( this._selected )
				this._selected.addClass('act');

			if ( !this.options.compact )
				this._display.button.set('data-ico-b', gx.zeyos.Factory.Icon('checked'));

			this.close();

			this.fireEvent('change', [ value, text, this ]);

			return this;
		},

		reset: function() {
			if ( this._selected ) {
				this._selected.removeClass('act');
				this._selected = null;
			}
			if ( this._resetItem )
				this._resetItem.addClass('act');

			this._display.button.empty();
			this._display.button.set('html', this.options.label);
			this._display.button.erase('data-ico-b');
			this._display.button.erase('title');
			this.close();

			this.fireEvent('change', [ null, this ]);

			return this;
		},

		getSelected: function() {
			return {
				'value': this._selected.get('data-value'),
				'label': this._selected.get('text')
			}
		},

		getValue: function() {
			if ( !this._selected )
				return '';

			return this._selected.get('data-value');
		},

		show: function() {
			this._display.frame.addClass('act');
			if (this.options.upside) {
				this._display.section.setStyle('top', (this._display.section.getSize().y + 1) * -1);
			}
			return this;
		},

		close: function(){
			this._display.frame.removeClass('act');
			return this;
		},

		toggle: function() {
			if ( this._display.frame.hasClass('act') )
				return this.close();
			else
				return this.show();
		}
	});
})();

/**
 * @class gx.zeyos.Groupbox
 * @description Creates a collapsable groupbox
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} title: The title of the groupbox
 * @option {bool} show: Show or collapse the groupbox
 *
 * @sample Groupbox Simple groupbox example.
 */
gx.zeyos.Groupbox = new Class({
	gx: 'gx.zeyos.Groupbox',
	Extends: gx.ui.Container,
	options: {
		'title': '',
		'show': true
	},
	_isOpen: true,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(new Element('div', {'class': 'm_l-10 m_r-10'}), options);
			this._display.body = display;
			this._display.root.inject(this._display.body, 'before');
			this._display.inner = new Element('div', {'class': 'bg-F br_b-5 bsd-2 fs-11 tsd_b-W8'});
			this._display.bar = new Element('h1', {'html': root.options.title});
			this._display.root.adopt([this._display.bar, this._display.inner.adopt(this._display.body)])

			this._display.bar.addEvent('click', function() {
				this.toggle();
			}.bind(this));
			if (this.options.show)
				this._display.bar.addClass('act');
		} catch(e) { gx.util.Console('gx.zeyos.Groupbox->initialize', e.message); }
	},

	/**
	 * @method toggle
	 * @description Toggles the visibility of the groupbox (hide/show)
	 */
	toggle: function() {
		this._display.bar.toggleClass('act');
	},

	/**
	 * @method show
	 * @description Shows the groupbox
	 */
	show: function() {
		this._display.bar.addClass('act');
	},

	/**
	 * @method hide
	 * @description Hides the groupbox
	 */
	hide: function() {
		this._display.bar.removeClass('act');
	},

	/**
	 * @method isOpen
	 * @return {Boolean}
	 */
	isOpen: function() {
		return this._display.bar.hasClass('act');
	}
});

/**
 * @method MasterData
 * @description Create master data panel
 *
 * @extends gx.ui.Container
 *
 * @param {html element} display Html element to adopt the master data panel.
 * @param {string|html element} title Title of the panel.
 * @param {string|html element} content Content of the panel.
 * @param {array} buttons Array of html elements.
 */
gx.zeyos.MasterPanel = new Class({
	gx: 'gx.zeyos.MasterPanel',
	Extends: gx.ui.Container,

	initialize: function(display, title, content, buttons) {
		this._title = new Element('h2');
		this._content = new Element('div', {
			'class': 'bg-W b_l-25 b_r-25 of-h'
		});
		this._buttons = new Element('div', {
			'class': ' fb mi_b-7 p_t-7'
		});

		this.parent(display);

		this.toElement().adopt([
			// head
			new Element('div', {
				'class': 'fix_t'
			}).adopt(
				new Element('section', {
					'class': 'm_l-10 m_r-10'
				}).adopt([

					this._title,
					new Element('div', {
						'class': 'bg-E p_l-7 p_r-7 p_t-7'
					}).adopt(
						new Element('div', {
							'class': 'bg-W b_b-25'
						})
					)

				])
			),

			// content
			new Element('div', {
			'class': 'bg-E m_l-10 m_r-10 p_l-7 p_r-7'
			}).adopt(
				this._content
			),

			//footer
			new Element('div', {
			'class': 'fix_b'
			}).adopt(
				new Element('div', {
					'class': 'm_l-10 m_r-10'
				}).adopt(
					new Element('div', {
						'class': 'bg-E br_b-5 bsd-3',
					}).adopt([

						new Element('div', {
							'class': 'bg-W b_t-25 m_l-7 m_r-7'
						}),
						this._buttons
					])
				)
			),
		]);

		if ( title != null )
			this.setTitle(title);

		if ( content != null )
			this.setContent(content);

		if ( buttons != null )
			this.setButtons(buttons);
	},

	setTitle: function(title) {
		if ( isString(title) ) {
			this._title.set('html', title);
		} else {
			this._title.empty();
			this._title.adopt(title);
		}
	},

	setContent: function(content) {
		if ( isString(content) ) {
			this._content.set('html', content);
		} else {
			this._content.empty();
			this._content.adopt(content);
		}
	},

	setButtons: function(buttons) {
		this._buttons.empty();
		this._buttons.adopt(buttons);
	}
});

/**
 * @class gx.zeyos.MonthPicker
 * @description Creates a datepicker to select a single month
 * @extends gx.zeyos.DatePicker
 * @implements DatePicker
 *
 * @param {element|string} display The display element
 *
 * @option {date} date The start date
 *
 * @event select When the month is changed
 */
gx.zeyos.MonthPicker = new Class({

	gx: 'gx.zeyos.MonthPicker',

	Extends: gx.zeyos.DatePicker,

	options: {
		format: '%B'
	},
	
	initialize: function (display, options) {
		try {
			if ( options == null )
				options = {};
				
			if ( options.picker == null )
				options.picker = {};
				
			options.picker.pickOnly = 'months';
			this.parent(display, options);

		} catch(e) {
			gx.util.Console('gx.zeyos.MonthPicker->initialize', gx.util.parseError(e) );
		}
	}

});

/**
 * @class gx.zeyos.Msgbox
 * @description Displays a message box.
 * @extends gx.core.Settings
 * @implements gx.core.Parse
 *
 * @option {int} top The top margin
 * @option {bool} closable The message box closes if it is clicked
 * @option {string|Element} content The content of the message box
 *
 * @sample Msgbox Try the different messagebox types with custom text.
 */
gx.zeyos.Msgbox = new Class({
	gx: 'gx.zeyos.Msgbox',
	Extends: gx.core.Settings,
	options: {
		'closable': true,
		'content': false
	},
	initialize: function(options) {
		var root = this;
		try {
			this.parent(options);
			this._display = {'frame': new Element('div', {
				'class': 'msg',
				'valign': 'center',
				'styles': {
					'left': '50%'
				}
			})};
			this._display.content = new Element('p');
			this._display.img = new Element('div');

			this._display.frame.adopt(this._display.img);
			this._display.frame.adopt(this._display.content);

			if (this.options.closable) {
				this._display.frame.addEvent('click', function() {
					root.hide();
				});
			}

			if (this.options.content)
				this.setContent(this.options.content);

			$(document.body).adopt(this._display.frame);
		} catch(e) { gx.util.Console('gx.zeyos.Msgbox->initialize', e.message); }
	},

	/**
	 * @method setContent
	 * @description Sets the content of the message box
	 * @param {string} content
	 */
	setContent: function(content) {
		try {
			this._display.content.empty();
			if (isNode(content)) {
				this._display.content.emptyy();
				this._display.content.adopt(content);
			}
			else if (isString(content)) {
				this._display.content.set('html', content);
			}
		} catch(e) { gx.util.Console('gx.zeyos.Msgbox->setContent', e.message); }
	},

	/**
	 * @method show
	 * @description Shows the message box
	 * @param {string} msg The message text to display
	 * @param {string} msg_class The class of the message
	 */
	show: function(msg, msg_class) {
		try {
			if (msg != null) {
				if (msg_class == null)
					msg_class = 'info';

				this._display.img.set('class', 's_msg_32_' + msg_class);

				this.setContent(msg);
			}
			this._display.frame.setStyle('margin-left', this._display.frame.getStyle('width').toInt() / -2);
			this._display.frame.addClass('act');
		} catch(e) { gx.util.Console('gx.zeyos.Msgbox->show', e.message); }
	},

	/**
	 * @method hide
	 * @description Hides the message box
	 */
	hide: function() {
		this._display.frame.removeClass('act');
	}
});

/**
 * @class gx.ui.Popup
 * @description Displays a message box or status bar.
 * @extends gx.ui.Blend
 * @implements gx.util.Console
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 *
 * @param {string|node} display
 * 
 * @option {string} color The color of the blend mask
 * @option {string} freezeColor The freeze color
 * @option {int} z-index The 'z' index
 * @option {float} opacity The opacity of the popup
 * @option {string} position The position modifier
 * @option {string} transition MooTools Fx.Transition function
 * @option {string} duration Blend effect duration
 * @option {bool} loader Show a loader bar
 * @option {bool} open Open on initialization
 * @option {object} content The content of the popup
 * @option {string} x The x coordinate of the popup
 * @option {string} y The y coordinate of the popup
 * 
 * @sample Popup A sample popup window
 */
gx.ui.Popup = new Class({
	gx: 'gx.ui.Popup',
	Extends: gx.ui.Blend,
	options: {
		'color': '#FFF',
		'freezeColor': '#FFF',
		'z-index': 110,
		'opacity': '0.95',
		'position': 'fixed',
		'transition': 'quad:in',
		'duration': '300',
		'loader': false,
		'open': false,
		'content': null,
		'x': 'center',
		'y': 'center'
	},
	isOpen: true,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this.build();
			if (this.options.content)
				this.addContent(this.options.content);
			this._parent.addEvent('resize', function() {
				root.setPosition();
			});
		} catch(e) { gx.util.Console('gx.ui.Popup->initialize: ', e.message); }
	},
	
	/**
	 * @method build
	 * @description Builds the popup
	 */
	build: function() {
		var root = this;
		try {
			this._display.content = new Element('div', {'styles': {
				'position': this.options.position,
				'display': 'none',
				'z-index': this.options['z-index'],
				'opacity': 0
			}});
			this._display.content.inject(this._display.root);
		} catch(e) { gx.util.Console('gx.ui.Popup->build: ', e.message); }
	},
	
	/**
	 * @method addContent
	 * @description Adds a node to the popup
	 * @param {node} elem The node to add
	 */
	addContent: function(elem) {
		var root = this;
		try {
			elem = this.initDisplay(elem);
			this._display.content.adopt(elem);
			this.setPosition();
		} catch(e) { gx.util.Console('gx.ui.Popup->addContent: ', e.message); }
	},
	
	/**
	 * @method setPosition
	 * @description Sets the popup position
	 * @param {string} x Horizontal position (left, right, center)
	 * @param {string} y Vertical position (top, bottom, center)
	 */
	setPosition: function(x, y) {
		var root = this;
		try {
			if (x == null) x = this.options.x;
			if (y == null) y = this.options.y;
			this.getCoordinates();
			var coordinates = this._display.content.getCoordinates();
			
			if (x == 'left')
				this._display.content.setStyle('left', 0);
			else if (x == 'right')
				this._display.content.setStyle('left', this._coordinates.width - coordinates.width);
			else
				this._display.content.setStyle('left', (this._coordinates.width - coordinates.width)/2);
			if (y == 'top')
				this._display.content.setStyle('top', 0);
			else if (y == 'bottom')
				this._display.content.setStyle('top', this._coordinates.height - coordinates.height);
			else
				this._display.content.setStyle('top', (this._coordinates.height - coordinates.height)/2);
		} catch(e) { gx.util.Console('gx.ui.Popup->setPosition: ', e.message); }
	},
	
	/**
	 * @method show
	 * @description Shows the popup
	 */
	show: function() {
		var root = this;
		try {

			var morph = new Fx.Morph(this._display.content, {
				'onStart': function() {
					root._display.content.setStyle('display', 'block');
				}
			});
			this.lock(1);
			morph.start({
				'opacity': 1
			});
			this.setPosition();
			this.fireEvent('show');
		} catch(e) { gx.util.Console('gx.ui.Popup->show: ', e.message); }
	},
	
	/**
	 * @method hide
	 * @description Hides the popup
	 */
	hide: function() {
		var root = this;
		try {
			var morph = new Fx.Morph(this._display.content, {
				'onComplete': function() {
					root._display.content.setStyle('display', 'none');
				}
			});
			this.lock(0);
			morph.start({
				'opacity': 0
			});
			this.fireEvent('hide');
		} catch(e) { gx.util.Console('gx.ui.Popup->hide: ', e.message); }
	}
});

/**
 * @class gx.zeyos.Popup
 * @description Creates a popup window
 * @extends gx.core.Settings
 * @implements gx.core.Parse
 * @implements gx.ui.Popup
 * @implements gx.util.Console
 *
 * @option {int} width The width of the popup
 * @option {bool} closable The popup closes if modal is clicked
 * @option {string|Element} content The content of the popup
 *
 * @event show
 * @event hide
 *
 * @sample Popup A sample popup window
 */
gx.zeyos.Popup = new Class({
	gx: 'gx.zeyos.Popup',
	Extends: gx.core.Settings,
	options: {
		'width': 600,
		'closable': true,
		'overlayDismiss': true,
		'content': false
	},
	initialize: function(options) {
		var root = this;
		try {
			this.parent(options)
			this._display = {
				/*
				'popup': new Element('div', {
					'id': 'pop',
				}),
				*/
				'aside': new Element('aside'),
				'content': new Element('section')
			};

			if (this.options.closable) {
				this._display.aside.adopt(
					new Element('div', {
						'class': 'img_close',
						'title': 'Close'
					})
						.addEvent('click', function() {
							root.hide();
						})
				);
			}

			this._display.aside.adopt(this._display.content);

			this._popup = new gx.ui.Popup($(document.body), {
				'color': '#000',
				'freezeColor': '#000',
				'opacity': '0.40',
				'content': root._display.aside
			});
			this._popup._display.content.addClass('pop');
			if ( this.options.closable && this.options.overlayDismiss ) {
				this._popup.addEvent('click', function() {
					root.hide();
				});
			}
			//root._display.aside.inject(root._display.popup, 'after');

			if (this.options.content)
				this.setContent(this.options.content);

		} catch(e) { gx.util.Console('gx.zeyos.Popup->initialize', e.message); }
	},

	/**
	 * @method show
	 * @description Shows the popup
	 * @param {object} opt Additional options for the event handler
	 */
	show: function(opt) {
		this.fireEvent('show', opt);
		this._popup.show();
		this._popup._display.content.addClass('act');
		return this.setPosition();
	},

	/**
	 * @method hide
	 * @description Hides the popup
	 * @param {object} opt Additional options for the event handler
	 */
	hide: function(opt) {
		this.fireEvent('hide', opt);
		this._popup.hide();
		this._popup._display.content.removeClass('act');
		return this;
	},

	/**
	 * @method setContent
	 * @description Sets the content of the popup
	 * @param {string} content The content to set
	 */
	setContent: function(content) {
		try {
			this._display.content.empty();
			switch (typeOf(content)) {
				case 'element':
				case 'elements':
				case 'textnode':
					this._display.content.adopt(content);
					break;
				case 'object':
					this._display.content.adopt(__(content));
					break;
				case 'string':
				case 'number':
					this._display.content.set('html', content);
					break;
			}
		} catch(e) { gx.util.Console('gx.zeyos.Popup->initialize', e.message); }

		return this;
	},
	
	setPosition: function(x, y) {
		var root = this;
		try {
			if (x == null) x = this.options.x;
			if (y == null) y = this.options.y;
			var windowSize = window.getSize();
			var coordinates = this._display.content.getCoordinates();
			
			if (x == 'left')
				this._popup._display.content.setStyle('left', 5);
			else if (x == 'right')
				this._popup._display.content.setStyle('left', windowSize.x - coordinates.width - 35);
			else 
				this._popup._display.content.setStyle('left', (windowSize.x - coordinates.width)/2);

			if (y == 'top')
				this._popup._display.content.setStyle('top', 15);
			else if (y == 'bottom')
				this._popup._display.content.setStyle('top', windowSize.y - coordinates.height - 25);
			else
				this._popup._display.content.setStyle('top', (windowSize.y - coordinates.height)/2);
				
		} catch(e) { gx.util.Console('gx.zeyos.Popup->setPosition: ', e.message); }

		return this;
	}

});

/**
 * @class gx.zeyos.Request
 * @description Utility class to send REST requests
 * @extends gx.core.Settings
 *
 * @option {string} service
 * @option {string} accesskey
 *
 * @sample Msgbox Try the different messagebox types with custom text.
 */
gx.zeyos.Request = new Class({
	Extends: gx.core.Settings,
	options: {
		'service': false,
		'accesskey': false
	},
	initialize: function (options) {
		this.parent(options);
	},
	/**
	 * @method setService
	 * @description Sets the ZeyOS REST service
	 * @param {string} service The service name
	 * @param {string} accesskey The access key
	 */
	setService: function(service, accesskey) {
		this.options.service = service;
		this.options.accesskey = accesskey == null ? accesskey : false;
	},
	/**
	 * @method send
	 * @description Performs a HTTP request
	 * @param {string} path The REST path (e.g. "list/") - please mind the exact name of your resource (e.g. mind trailing slashes)
	 * @param {object|string} data The request data
	 * @param {function} callback The callback function
	 * @param {string} method
	 */
	send: function(path, data, callback, method) {
		var req = new Request({
			'url': '../remotecall/'+this.options.service+(this.options.accesskey ? ':'+this.options.accesskey : '')+'/'+path,
			'method': method,
			'data': data,
			'onRequest': function() {
				this.fireEvent('request');
			}.bind(this),
			'onComplete': function() {
				this.fireEvent('complete');
			}.bind(this),
			'onSuccess': function(json) {
				this.fireEvent('success');
				res = JSON.decode(json);
				if (typeOf(res) == 'object') {
					if (res.error != null)
						ZeyOSApi.showMsgRuntimeError('Error: '+res.error);
					else if (res.result == null)
						ZeyOSApi.showMsgRuntimeError('Invalid response (no result): '+json);
					else
						callback(res.result);
				} else {
					ZeyOSApi.showMsgRuntimeError('Invalid response: '+json);
				}
			}.bind(this)
		});
		req.send();
	},
	/**
	 * @method post
	 * @description Performs a POST request
	 * @param {string} path The REST path (e.g. "list/") - please mind the exact name of your resource (e.g. mind trailing slashes)
	 * @param {object|string} data The request data
	 * @param {function} callback The callback function
	 */
	'post': function(path, data, callback) {
		this.send(path, data, callback, 'POST');
	},
	/**
	 * @method get
	 * @description Performs a GET request
	 * @param {string} path The REST path (e.g. "list/") - please mind the exact name of your resource (e.g. mind trailing slashes)
	 * @param {object|string} data The request data
	 * @param {function} callback The callback function
	 */
	'get': function(path, data, callback) {
		this.send(path, data, callback, 'GET');
	},
	/**
	 * @method put
	 * @description Performs a PUT request
	 * @param {string} path The REST path (e.g. "list/") - please mind the exact name of your resource (e.g. mind trailing slashes)
	 * @param {object|string} data The request data
	 * @param {function} callback The callback function
	 */
	'put': function(path, data, callback) {
		this.send(path, data, callback, 'PUT');
	},
	/**
	 * @method delete
	 * @description Performs a DELETE request
	 * @param {string} path The REST path (e.g. "list/") - please mind the exact name of your resource (e.g. mind trailing slashes)
	 * @param {object|string} data The request data
	 * @param {function} callback The callback function
	 */
	'delete': function(path, data, callback) {
		this.send(path, data, callback, 'PUT');
	}
});

/**
 * @class gx.zeyos.Search
 * @description Creates a search box
 * @extends gx.ui.Container
 *
 */
gx.zeyos.Search = new Class({

	Extends: gx.ui.Container,

	Implements: [ Events ],

	initialize: function () {
		var root = this;

		var container = new Element('div', { 'class': 'att' });
		this.parent(container);

		this._ui.searchBox = new Element('input', {
			'placeholder': 'Search',
			'x-webkit-speech': '',
			'value': ''
		})
			.addEvents({
				'input': function (event) {
					root.fireEvent('input', [ root, this, event ]);
				},
				'keypress': function (event) {
					root.fireEvent('keypress', [ root, this, event ]);
				}
			});

		this._ui.button = gx.zeyos.Factory.Button('', '', 'search')
			.addEvent('click', function (event) {
				root.fireEvent('click', [ root, this, event ]);
			});

		container.adopt(
			this._ui.searchBox,
			this._ui.button
		);
	},

	get: function () {
		return this._ui.searchBox.value;
	}

});

/**
 * @class gx.zeyos.Select
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {string} method Request method
 * @option {string} url Request URL
 * @option {string} height The height of the select box + 'px', default is '100px'
 * @option {string} width The width of the select box + 'px', default is '150px'
 * @option {object} requestData Additional request data
 * @option {string} requestParam Parameter for the request, default is 'search'
 * @option {string} listValue The key name for element values
 * @option {function} listFormat Formatting function for the list output
 * @option {function} formatID Formatting function for the list output
 * @option {function} decodeResponse Calls JSON.decode
 *
 * @event request When the list is requested
 * @event select When an element is selected
 * @event noselect When no element is selected
 *
 * @sample Select Simple search in select box example.
 */
gx.zeyos.Select = new Class({
	gx: 'gx.zeyos.Select',
	Extends: gx.ui.Container,
	options: {
		'method': 'GET',
		'url': 'index.php',
		'height': '150px',
		'width': '300px',
		'requestData': {},
		'requestParam': 'search',
		'default': '*',
		'searchFilter': undefined,
		'localOptions': null,
		'itemImage': function (elem) {
			return (
				elem.img != null
				? '<img src="'+ elem.img +'"/>'
				: '<img src=""/>'
			)
		},
		'listFormat': function(elem) {
			return elem.name;
		},
		'formatID': function(elem) {
			return elem.ID;
		},
		'decodeResponse': function(json) {
			return JSON.decode(json);
		},
		/* Messages */
		'msg': {
			'de': {
				'noSelection': '(Keine Auswahl)'
			},
			'noSelection': '(No Selection)'
		},
		/* Events */
		'onRequest': false, 	// When the list is requested
		'onSelect': false, 		// When an element is selected
		'onNoSelect': false		// When no element is selected
	},
	_running: false,
	_closed: true,
	_lastSearch: false,
	_selected: null,
	_selectedItem: null,
	_search: '',
	$items: [],
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);

			this._display.root.addClass('searchbox');
			this._display.fieldset = new Element('fieldset', {
				'class': 'sel',
				'name': 'view',
				'style': 'max-width:' + root.options.width,
				'data-text': 'test',
				'data-value': 'test'
			});
			this._display.textbox = new Element('input', {
				'placeholder': root.options.msg.noSelection
			});

			this._display.listbox = new Element('section', {
				'style': 'min-height:' + this.options.height
				/*
				'class': 'listbox list',
				'styles': {
					'height': this.options.height,
					'width': this.options.width
				}
				*/
			});
			this._display.fieldset.adopt(this._display.textbox);
			this._display.fieldset.adopt(this._display.listbox);
			this._display.root.adopt(this._display.fieldset);

			this._display.textbox.addEvent('click', function() {
				root.show();
			});
			this._display.textbox.addEvent('keyup', function() {
				root.search();
			});
			this._display.textbox.addEvent('blur', function() {
				root.hide.delay(500, root);
			});

			if (isFunction(this.options.onRequest))
				this.addEvent('request', this.options.onRequest);
			if (isFunction(this.options.onSelect))
				this.addEvent('select', this.options.onSelect);
			if (isFunction(this.options.onNoSelect))
				this.addEvent('noselect', this.options.onNoSelect);

			this._display.textbox.set('value');
		} catch(e) {
			gx.util.Console('gx.zeyos.Select->initialize', gx.util.parseError(e) );
		}
	},

	/**
	 * @method search
	 * @description Initiates a search request
	 * @param {string} search The search string
	 */
	search: function(search) {
		var root = this;
		try {
			if (search == null)
				search = this._display.textbox.get('value').trim();
			if (search == '' || search == null)
				search = this.options['default'];
				
			// search === this._lastSearch strict comparison is necessary.
			// Because on focus select: '' != false => results in false -> no search will be executed
			// only '' !== false => results in true
			if ( search === this._lastSearch ) {

			} else if ( this.options.localOptions ) {
				this._lastSearch = search;
				this.buildList(
					this.options.searchFilter
					? this.options.searchFilter.apply(this, [this.options.localOptions, this._lastSearch])
					: this.options.localOptions
				);

			} else if ( this._running !== true ) {
				this.fireEvent('request');
				this._running = true;
				this._lastSearch = search;
				var data = this.options.requestData;
				data[this.options.requestParam] = search;

				req = new Request({
					'method': root.options.method,
					'url': root.options.url,
					'data': data,
					'onSuccess': function(json) {
						root.evalResponse(json);
					},
					'onFailure': function() {
						alert('Request failed');
					}
				});
				req.send();
			}
		} catch(e) { gx.util.Console('gx.zeyos.Select->search', e.message); }
	},

	/**
	 * @method evalResponse
	 * @description Evaluates the response: Decodes the JSON, calls buildList with the result and then calls search
	 * @param {string} json The JSON response to evaluate
	 */
	evalResponse: function(json) {
		try {
			var obj = this.options.decodeResponse(json);
			if (typeOf(obj) == 'array')
				this.buildList(
					this.options.searchFilter
					? this.options.searchFilter.apply(this, [obj, this._lastSearch])
					: obj
				);
			else
				gx.util.Console('gx.zeyos.Select->evalResponse.', 'Invalid object type. Array expected.');
		} catch(e) { gx.util.Console('gx.zeyos.Select->evalResponse', gx.util.parseError(e)); }
		this._running = false;
		this.search();
	},

	/**
	 * @method buildList
	 * @description Builds a list of links from the provided array
	 * @param {array} list The provided array
	 */
	buildList: function(list) {
		var root = this;
		try {
			this._display.listbox.empty();
			var len = list.length;
			var addCLink = function(link, el) {
				link.addEvent('click', function() {
					root.set(el, link);
				});
			};
			
			this.$items = [];
			
			for (i = 0 ; i < len ; i++) {
				var active = '';
				if ( this._selected != null && this.options.formatID(list[i]) == this.options.formatID(this._selected))
					active = ' act';

				var link = new Element('div', {
					'class': 'sel_item ico' + active,
					'html': this.options.itemImage(list[i]),
					'data-text': this.options.listFormat(list[i]),
					'data-value': this.options.formatID(list[i])
				});

				this.$items.push(link);
				
				this._display.listbox.adopt(link);
				addCLink(link, list[i]);
			}
		} catch(e) { gx.util.Console('gx.zeyos.Select->buildList', e.message); }
	},

	/**
	 * @method show
	 * @description Shows the select box
	 */
	show: function() {
		//this._display.listbox.setStyle('display', 'block');
		this._display.fieldset.addClass('act');
		this._display.textbox.set('value', this._search);
		this._display.textbox.focus();
		this._closed = false;
		this.search();
	},

	/**
	 * @method hide
	 * @description Hides the select box
	 */
	hide: function() {
		if (!this._closed) {
			this._closed = true;
			//this._display.listbox.setStyle('display', 'none');
			this._display.fieldset.removeClass('act');
			this._search = this._display.textbox.get('value');
			this.update();
		}
	},

	/**
	 * @method update
	 * @description Updates the select box according to its state of selection
	 */
	update: function() {
		if (this._selected == null) {
			this.fireEvent('noselect');
			this._display.textbox.set('value', '');
		} else {
			this.fireEvent('select', this._selected);
			this._display.textbox.set('value', this.options.listFormat(this._selected));
		}
	},

	/**
	 * @method setRequestData
	 * @param {object} The default request data
	 */
	setRequestData: function(data) {
		this.options.requestData = data;
	},

	/**
	 * @method set
	 * @description Sets the selected element
	 * @param {object} selection The element to select
	 */
	set: function(selection, link) {
		if ( this._selectedItem )
			this._selectedItem.removeClass('act');

		link.addClass('act');
		this._selected = selection;
		this._selectedItem = link;
		if (!this._closed)
			this.hide();
		else
			this.update();
	},

	/**
	 * @method select
	 * @param {mixed} id The ID of the element to select
	 */
	select: function (id) {
		for (var i = 0; i < this.options.localOptions.length; i++) {
			if ( this.options.formatID(this.options.localOptions[i]) === id ) {
				this.set(this.options.localOptions[i], this.$items[i]);
				return;
			}
		}
	},

	/**
	 * @method getID
	 * @description Returns the ID of the selected element
	 */
	getID: function() {
		return this.options.formatID(this._selected);
	},

	/**
	 * @method getSelected
	 * @description Returns the selected element
	 */
	getSelected: function() {
		return this._selected;
	},

	/**
	 * @method reset
	 * @description Resets the selection
	 */
	reset: function() {
		this._display.listbox.empty();
		this._selected = null;
		this._lastSearch = false;
		this.update();
	},

	/**
	 * @method enable
	 * @description Enables the text box
	 */
	enable: function() {
		this._display.textbox.erase('disabled');
	},

	/**
	 * @method disable
	 * @description Disables the text box
	 */
	disable: function() {
		this._display.textbox.set('disabled', true);
	}
});

/**
 * @class gx.zeyos.Tabbox
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
 *  *
 * @event change When the tab is changed
 *
 * @sample Tabbox Simple tabboxes example.
 */
gx.zeyos.Tabbox = new Class({
	gx: 'gx.zeyos.Tabbox',
	Extends: gx.ui.Container,
	options: {
		'frames': [],
		'height': false,
		'show': 1,
		'onChange': false,
		'lang': 'ltr'
	},
	_tabs: [],
	_frames: [],
	_active: '',
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this._display = Object.merge({}, this._display, {
				'div': new Element('div', {'class': 'tab'}),
				'content': new Element('div', {'styles': {'overflow': 'auto'}})
			});
			if (root.options.height)
				this._display.content.setStyle('height', root.options.height);

			this._display.root.adopt(this._display.div);
			this._display.root.adopt(this._display.content);

			var frames = this.options.frames;
			if (isArray(frames)) {
				frames.each(function(item) {
					root.addTab(item.name, item.title, item.content);
				});
			}

			if (isFunction(this.options.onChange))
				this.addEvent('change', this.options.onChange);

			if (isString(this.options.show))
				this.openTab(this.options.show);
			else if(isNumber(this.options.show)) {
				var index = this.getIndexName(this.options.show);
				if (index)
					this.openTab(index);
			}
		} catch(e) { gx.util.Console('gx.zeyos.Tabbox->initialize', e.message); }
	},

	/**
	 * @method setHeight
	 * @description Sets the height of the tabbed box
	 * @param {int} height The height to set
	 */
	setHeight: function(height) {
		this._display.content.setStyle('height', height);
	},

	/**
	 * @method addTab
	 * @description Adds a tab
	 * @param {string} name The name of the tab
	 * @param {string} title The title of the tab
	 * @param {string|node} content The content of the tab
	 */
	addTab: function(name, title, content) {
		var root = this;
		try {
			if (isString(content))
				content = new Element('div', {'html': content});

			if (isString(name) && isString(title) && isNode(content)) {
				if (!isNode(this._tabs[name])) {
					var link = new Element('fieldset', {'class': 'tab_item', 'html': title.replace(/ /g, '&nbsp;')});
					content.setStyle('display', 'none');
					this._frames[name] = content;
					this._tabs[name] = link;
					this._display.div.adopt(link);
					this._display.content.adopt(content);
					link.addEvent('click', function() {
						root.openTab(name);
					});
					return true;
				}
			}
			return false;
		} catch(e) {
			gx.util.Console('gx.zeyos.Tabbox->addTab', e.message);
			throw e;
		}
	},

	/**
	 * @method closeTab
	 * @description Closes the tab with the given name
	 * @param {string} name The name of the tab
	 */
	closeTab: function(name) {
		try {
			if (isNode(this._tabs[name])) {
				this._tabs[name].removeClass('act');
				this._frames[name].setStyle('display', 'none');
				this._active = false;
			}
		} catch(e) { gx.util.Console('gx.zeyos.Tabbox->closeTab', e.message); }
	},

	/**
	 * @method openTab
	 * @description Opens the tab with the given name
	 * @param {string} name The name of the tab
	 */
	openTab: function(name) {
		try {
			if (isNode(this._tabs[name])) {
				if (this._active)
					this.closeTab(this._active);
				this._active = name;
				this._tabs[name].addClass('act');
				this._frames[name].setStyle('display', 'block');
				this.fireEvent('change', name);
			}
		} catch(e) { gx.util.Console('gx.zeyos.Tabbox->openTab', e.message); }
	},

	/**
	 * @method getIndexName
	 * @description Returns the name of the tab at the given index
	 * @param {int} index The index
	 */
	getIndexName: function(index) {
		var i = 0;
		for (name in this._tabs) {
			i++;
			if (i == index)
				return name;
		}
		return false;
	}
});

/**
 * @class gx.zeyos.Table
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL.
 * @extends gx.ui.Container
 * @implements gx.util.Console
 * @sample Table
 *
 * @event click
 * @event dblclick
 * @event filter
 * @event rowAdd
 * @event addData
 * @event setData
 * @event complete
 * @event beforeRowAdd
 * @event afterRowAdd
 *
 * @option {array} cols The table column structure
 * @option {function} structure Formatting row data into columns (returns an array)
 * @option {array} data The list data
 * @option {bool} onClick when a row is clicked
 * @option {bool} onFilter when a filter is set
 * @option {bool} onRowAdd when a row is added
 * @option {bool} onStart when the table is being rendered
 * @option {bool} onComplete when the table is rendered completely
 */
gx.zeyos.Table = new Class({
	gx: 'gx.zeyos.Table',
	Extends: gx.ui.Container,
	options: {
		'cols': [
			{'label': 'Column 1', 'id': 'col1', 'width': '20px', 'filter': 'asc'},
			{'label': 'Column 2', 'id': 'col2'}
		],
		'structure': function(row, index) {
			return [
				row.col1,
				{'label': row.col2, 'className': row.col2class}
			]
		},
		'data': []
	},
	_cols: [],
	_filter: false,
	_colspan: 0,
	_scrollBarCol: false,

	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			//this.addEvent('complete', this.adoptSizeToHead.bind(this));

			this._display.table = new Element('table', {'class': 'tbl'});
			this._display.thead = new Element('thead');
			this._display.theadRow = new Element('tr', {'class': 'tbl_head'});

			//this._display.tableDiv = new Element('div', {'class': 'bg-W b_l-25 b_r-25 of-h', 'style': 'overflow-y:scroll;'});
			//this._display.table = new Element('table', {'class': 'tbl'});
			this._display.tbody = new Element('tbody');

			this._display.thead.adopt(this._display.theadRow);
			this._display.table.adopt(this._display.thead);
			this._display.root.adopt(this._display.table);

			this._display.table.adopt(this._display.tbody);
			//this._display.tableDiv.adopt(this._display.table);
			//this._display.root.adopt(this._display.table);

			this.buildCols(this.options.cols);
			this.setData(this.options.data);

			//window.addEvent('resize', this.adoptSizeToHead.bind(this));
		} catch(e) { gx.util.Console('gx.zeyos.Table->initialize', e.message); }
	},

	/**
	 * @method buildCols
	 * @description Builds the columns
	 * @param {array} cols An array of columns
	 */
	buildCols: function(cols) {
		var root = this;
		try {
			cols.each(function(col) {
				col.th = new Element('th');
				switch (typeOf(col.label)) {
					case 'object' :
						col.th.adopt(__(col.label));
						break;
					case 'element':
						col.th.adopt(col.label);
						break;
					default:
						col.th.set('html', col.label);
						break;
				}

				if (col.filter != null || col.filterable != false) {
					col.th.set('data-sort', '-' + col.id );
					col.indicator = col.th;
					col.th.addEvent('click', function() {
						root.setSort(col);
					});
				}

				if ( col['text-align'] != null )
					col.th.setStyle('text-align', col['text-align']);

				if (col.width != null)
					col.th.setStyle('width', col.width);
				if (col.filter != null)
					root.setSort(col, col.filter, 1);

				root._display.theadRow.adopt(col.th);
				root._cols.push(col);
			});
			this._colspan = cols.length;
			// Add one more col to header which automatically scale with of scroll bar width
			// Set default width 16px in case no data will be add at first
			// Erase when data will be add to get automatically scaled.
			//this._scrollBarCol = new Element('th', {'class': ''});
			root._display.theadRow.adopt(this._scrollBarCol);
		} catch(e) { gx.util.Console('gx.zeyos.Table->buildCols', e.message); }

		return this;
	},

	/**
	 * @method setSort
	 * @description Sorts the table according to the specified column and mode
	 * @param {object} col The column that is decisive for the sorting
	 * @param {string} mode The sorting order: 'asc' or 'desc'
	 * @param noEvent
	 */
	setSort: function(col, mode, noEvent) {
		if ( !this._filter )
			this._filter = {};

		if ( mode == null ) {
			if ( col.th.get('data-sort').indexOf('-') > -1 ) {
				mode = 'asc';
				var prefix = '';
			} else {
				mode = 'desc';
				var prefix = '-';
			}
		}

		if ( mode == 'asc' ) {
			this._filter.mode = 'desc';
			var opPrefix = '-';
		} else {
			this._filter.mode = 'asc';
			var opPrefix = '';
		}

		for ( var i = 0; i < this._cols.length; i++ ) {
			var currentCol = this._cols[i];
			currentCol.th.removeClass('act');
			currentCol.th.set('data-sort', opPrefix + currentCol.id);
		}

		col.th.set('data-sort', prefix + col.id);
		col.th.addClass('act');

		this._filter.indicator = col.th;
		this._filter.id        = col.id;

		if (noEvent == null)
			this.fireEvent('filter', col);

		return this;
	},

	/**
	 * @method getFilter
	 * @description Returns the filter object {mode: 'asc'|'desc', id: COLID}
	 */
	getFilter: function() {
		return this._filter;
	},

	/**
	 * @method setData
	 * @description Sets the list data. Calls empty() and then addData(data)
	 * @param {array} data The list data to set
	 */
	setData: function(data) {
		this.empty();
		this.fireEvent('setData', data)
		return this.addData(data);
	},

	/**
	 * @method addData
	 * @description Adds the specified data to the table
	 * @param {array} data The data to add
	 */
	addData: function(data) {
		var root = this;
		var odd = false;
		try {
			if ( !isArray(data) )
				return this;

			this.fireEvent('addData', data)
			data.each(function(row, index) {
				if ( !isObject(row) )
					return;

				var cols = root.options.structure(row, index);
				var rowProperties = {};

				if ( (typeof(cols) === 'object') && cols.row ) {
					if ( cols.properties )
						Object.merge(rowProperties, cols.properties);
					cols = cols.row;
				}

				if ( !isArray(cols) )
					return;

				root.fireEvent('beforeRowAdd', [row, index] );

				row.tr = new Element('tr', rowProperties)
					.addClass('tbl_row');

				var clickable = (row.clickable == null || row.clickable != false || (root.options.cols[index] != null && root.options.cols[index].clickable != false));

				if (odd)
					row.tr.addClass('bg');
				odd = !odd;

				cols.each(function(col, index) {
					clickable = clickable ? !(root.options.cols[index] != null && root.options.cols[index].clickable == false) : true;
					var td = new Element('td');
					var width = width = root.options.cols[index].width;
					if ( width )
						td.setStyle('width', width);

					switch ( typeOf(col) ) {
						case 'object' :
							col = Object.clone(col);

							var labelType = typeOf(col.label);
							if ( (labelType === 'element') || (labelType === 'textnode') )
								td.adopt(col.label);
							else
								td.set('html', col.label);

							clickable = ( (col.clickable == null) || (col.clickable != false) );
							if ( col.className != null )
								td.addClass(col.className);

							delete col.label;
							delete col.clickable;
							delete col.className;

							td.set(col);

							break;

						case 'element':
						case 'textnode':
							td.adopt(col);
							break;
						default:
							td.set('html', col);
							break;
					}

					if ( root._cols[index]['text-align'] != null )
						td.setStyle('text-align', root._cols[index]['text-align']);

					if (clickable) {
						td.addEvent('click', function(event) {
							root.fireEvent('click', [ row, event, index ] );
						});
						td.addEvent('dblclick', function(event) {
							root.fireEvent('dblclick', [ row, event, index ] );
						});
					}
					row.tr.adopt(td);
				});
				root._display.tbody.adopt(row.tr);
				root.fireEvent('rowAdd', [row, index] );
				root.fireEvent('afterRowAdd', [row, index] );
			});
			//if( data.length > 0 ) this._scrollBarCol.erase('style');
			this.fireEvent('complete', data);
		} catch(e) { gx.util.Console('gx.zeyos.Table->addData', e.message); }

		return this;
	},

	/**
	 * @method empty
	 * @description Clears the table body
	 */
	empty: function() {
		this._display.tbody.empty();
		return this;
	},

	/**
	 * @method adoptSizeToHead
	 * @description Sets the cell widths of the header with the width of the cell in the first row
	 */
	adoptSizeToHead: function () {
		var row = this._display.tbody.getElement('tr');
		if ( row == null )
			return this;

		var once = false;
		row.getElements('td').each( function (ele) {
			var size = ele.getSize();
			this._cols[ele.cellIndex].th.setStyle('width', size.x + 'px');
		}.bind(this));

		return this;
	}
});

/**
 * @class gx.zeyos.Timebox
 * @description Creates a box for times, separating hours, minutes and seconds
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {float} time The initial time of the element
 * @option {string} unit The default input unit (seconds, minutes, hours)
 * @option {bool} seconds Also display the seconds (default is hours:minutes)
 * @option {bool} prefix The box will support negative numbers
 * @option {bool} readonly
 *
 * @event change
 * @event disabled
 *
 * @sample Timebox Simple timebox example.
 */
gx.zeyos.Timebox = new Class({
	gx: 'gx.zeyos.Timebox',
	Extends: gx.ui.Container,
	options: {
		'time': 0,
		'unit': 'minutes',
		'seconds': true,
		'prefix': false,
		'readonly': false
	},
	_prefix: true,
	_disabled: false,
	_styles: {
		'negative': {
			'background': '#FBE3E4',
			'color': '#8a1f11',
			'border-color': '#FBC2C4'
		},
		'positive': {
			'background': '#E6EFC2',
			'color': '#264409',
			'border-color': '#C6D880'
		}
	},
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this.build();
		} catch(e) { gx.util.Console('gx.zeyos.Timebox->initialize', e.message); }
	},

	/**
	 * @method build
	 * @description Builds the timebox
	 */
	build: function() {
		var root = this;
		try {
			if (this.options.prefix) {
				this._display.prefix = new Element('div', {'html': '+', 'styles': Object.merge({}, this._styles.positive, {
					'height': '18px',
					'width': '18px',
					'text-align': 'center',
					'cursor': 'pointer',
					'font-weight': 'bold',
					'font-size': '12px',
					'padding': '1px',
					'margin-right': '3px',
					'border-width': '1px',
					'border-style': 'solid',
					'float': 'left'
				})});
				this._display.root.adopt(this._display.prefix);
				if (!this.options.readonly) {
					this._display.prefix.addEvent('click', function() {
						if (!root._disabled)
							root.setPrefix(!root._prefix);
					});
				}
			}
			this._display.hours = new Element('input', {'type': 'text', 'styles': {'width': '25px', 'text-align': 'center'}});
			this._display.root.adopt(this._display.hours);
			this._display.hours.addEvent('change', function() {
				root.update();
			});
			this._display.minutes = new Element('input', {'type': 'text', 'styles': {'width': '25px', 'text-align': 'center'}});
			this._display.root.adopt(new Element('span', {'html': ':'}));
			this._display.root.adopt(this._display.minutes);
			this._display.minutes.addEvent('change', function() {
				root.update();
			});
			if (this.options.readonly) {
				this._display.hours.set('disabled', 'disabled');
				this._display.minutes.set('disabled', 'disabled');
			}
			if (this.options.seconds) {
				this._display.seconds = new Element('input', {'type': 'text', 'styles': {'width': '25px', 'text-align': 'center'}});
				this._display.root.adopt(new Element('span', {'html': ':'}));
				this._display.root.adopt(this._display.seconds);
				this._display.seconds.addEvent('change', function() {
					root.update();
				});
				if (this.options.readonly)
					this._display.seconds.set('disabled', 'disabled');
			}
		} catch(e) { gx.util.Console('gx.zeyos.Timebox->build', e.message); }
	},

	/**
	 * @method setPrefix
	 * @description Sets the prefix
	 * @param {element} prefix The prefix
	 */
	setPrefix: function(prefix) {
		try {
			if (this._display.prefix) {
				this._prefix = prefix;
				if (this._prefix) {
					this._display.prefix.setStyles(this._styles.positive);
					this._display.prefix.set('html', '+');
				} else {
					this._display.prefix.setStyles(this._styles.negative);
					this._display.prefix.set('html', '-');
				}
			}
		} catch(e) { gx.util.Console('gx.zeyos.Timebox->setPrefix', e.message); }
	},

	/**
	 * @method addZero
	 * @description Adds a zero in front of the number if it is smaller than 10
	 * @param {int} num The number in question
	 */
	addZero: function(num) {
		return (num < 10) ? '0' + num : num;
	},

	/**
	 * @method update
	 * @description Updates the time
	 */
	update: function() {
		this.set(this.get());
	},

	/**
	 * @method splitTime
	 * @description Splits the time according to the given unit and returns an array of the time values and the prefix
	 * @param {int} time The time in seconds
	 * @param {string} unit The unit (seconds, minutes, hours)
	 */
	splitTime: function(time, unit) {
		try {
			if (unit == null)
				unit = this.options.unit;

			var prefix = (time >= 0);
			if (!prefix)
				time = -time;

			if (unit == 'minutes')
				time = time * 60;
			else if (unit == 'hours')
				time = time * 3600;

			time = Math.round(time);

			var seconds = 0;
			var minutes = Math.round(time / 60);
			if (this.options.seconds) {
				seconds = time % 60;
				minutes = Math.floor(time / 60);
			}
			var hours = Math.floor(minutes / 60);
			minutes = minutes % 60;
			return {'hours': hours, 'minutes': this.addZero(minutes), 'seconds': this.addZero(seconds), 'prefix': prefix};
		} catch(e) {
			gx.util.Console('gx.zeyos.Timebox->splitTime', e.message);
			throw e;
		}
	},

	/**
	 * @method getNum
	 * @description Returns the value of the given element
	 * @param {element} elem The element
	 */
	getNum: function(elem) {
		var value = parseInt(elem.get('value'), 10);
		if (isNaN(value))
			return 0;
		if (value < 0) {
			this.setPrefix(false);
			value = -value;
		}
		return value;
	},

	/**
	 * @method set
	 * @description Sets the time according to the given unit
	 * @param {int} time The time to set
	 * @param {string} unit The unit (seconds, minutes, hours)
	 */
	set: function(time, unit) {
		var root = this;
		try {
			if (time == null)
				time = 0;
			if (unit == null)
				unit = this.options.unit;
			time = this.splitTime(parseFloat(time), unit);
			if (!time.prefix && !this.options.prefix) {
				this._display.hours.set('value', 0);
				this._display.minutes.set('value', 0);
				if (this._display.seconds)
					this._display.seconds.set('value', 0);
			} else {
				this.setPrefix(time.prefix);
				this._display.hours.set('value', time.hours);
				this._display.minutes.set('value', time.minutes);
				if (this._display.seconds)
					this._display.seconds.set('value', time.seconds);
			}
		} catch(e) { gx.util.Console('gx.zeyos.Timebox->set', e.message); }
	},

	/**
	 * @method get
	 * @description Gets the time according to the given unit and with the given precision
	 * @param {string} unit The unit (seconds, minutes, hours)
	 * @param {int} precision The precision to apply (default is 0)
	 */
	get: function(unit, precision) {
		try {
			if (precision == null)
				precision = 0;
			if (unit == null)
				unit = this.options.unit;

			var hours = this.getNum(this._display.hours);
			var minutes = this.getNum(this._display.minutes);
			var seconds = 0;
			if (this._display.seconds)
				seconds = this.getNum(this._display.seconds);

			var time = (this._prefix ? 1 : -1) * (hours * 3600 + minutes * 60 + seconds);

			switch(unit) {
				case 'hours':
					return Math.round(((time / 3600) * Math.pow(10, precision))) / Math.pow(10, precision);
				case 'minutes':
					return Math.round(((time / 60) * Math.pow(10, precision))) / Math.pow(10, precision);
				default:
					return Math.round((time * Math.pow(10, precision))) / Math.pow(10, precision);
			}
		} catch(e) {
			gx.util.Console('gx.zeyos.Timebox->get', e.message);
			throw e;
		}
	},

	/**
	 * @method enable
	 * @description Enables the timebox
	 */
	enable: function() {
		this._disabled = false;
		this._display.hours.erase('disabled');
		this._display.minutes.erase('disabled');
		if (this._display.seconds)
			this._display.seconds.erase('disabled');
	},

	/**
	 * @method disable
	 * @description Disables the timebox
	 */
	disable: function() {
		this._disabled = true;
		this._display.hours.set('disabled', true);
		this._display.minutes.set('disabled', true);
		if (this._display.seconds)
			this._display.seconds.set('disabled', true);
	}
});

/**
 * @class gx.zeyos.TimePicker
 * @description Creates a datepicker to select time
 * @extends gx.zeyos.DatePicker
 * @implements DatePicker
 *
 * @param {element|string} display The display element
 *
 * @option {date} date The start date
 *
 * @event select When the month is changed
 */
gx.zeyos.TimePicker = new Class({

	gx: 'gx.zeyos.TimePicker',

	Extends: gx.zeyos.DatePicker,

	options: {
		format: '%H:%M'
	},
	
	initialize: function (display, options) {
		try {
			if ( options == null )
				options = {};
				
			if ( options.picker == null )
				options.picker = {};
				
			options.picker.pickOnly = 'time';
			this.parent(display, options);

		} catch(e) {
			gx.util.Console('gx.zeyos.TimePicker->initialize', gx.util.parseError(e) );
		}
	}

});

/**
 * @class gx.zeyos.Toggle
 * @description Creates a switch component
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {mixed} value
 * @option {boolean} on The initial switch state (default: off)
 *
 * @event check
 * @event uncheck
 */
gx.zeyos.Toggle = new Class({
	Extends: gx.ui.Container,

	options: {
		'value': true,
		'on': false
	},

	initialize: function(display, options) {
		this.parent(display, options);

		var root = this;
		this._display.root.addClass('tgl');
		this._display.root.addEvent('click', function() {
			root.toggle();
		});

		if ( this.options.on )
			this._display.root.addClass('act');
	},

	getState: function() {
		if ( this._display.root.hasClass('act') )
			return true;
		else
			return false;
	},

	getValue: function() {
		if ( this._display.root.hasClass('act') )
			return this.options.value;
		else
			return false;
	},

	toggle: function() {
		if ( this._display.root.hasClass('act') )
			this.setUnchecked();
		else
			this.setChecked();
	},

	setChecked: function() {
		this._display.root.addClass('act');
		this.fireEvent('check');
	},

	setUnchecked: function() {
		this._display.root.removeClass('act');
		this.fireEvent('uncheck');
	}
});
