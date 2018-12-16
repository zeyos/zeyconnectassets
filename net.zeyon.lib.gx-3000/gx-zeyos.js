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
 * Additional
 * @type {Class}
 */
Request.File = new Class({
    Extends: Request,

    options: {
        emulation: false,
        urlEncoded: false
    },

    initialize: function(options){
        this.xhr = new Browser.Request();
        this.formData = new FormData();
        this.setOptions(options);
        this.headers = this.options.headers;
    },

    addFile: function(elem) {
        this.append(elem.get('name'), elem.files[0]);
        return this;
    },

    append: function(key, value){
        this.formData.append(key, value);
        return this.formData;
    },

    reset: function(){
        this.formData = new FormData();
    },

    send: function(options) {
        if (options == null)
            options = {};

        var url = options.url || this.options.url;

        this.options.isSuccess = this.options.isSuccess || this.isSuccess;
        this.running = true;

        var xhr = this.xhr;
        xhr.open('POST', url, true);
        xhr.onreadystatechange = this.onStateChange.bind(this);

        Object.each(this.headers, function(value, key){
            try{
                xhr.setRequestHeader(key, value);
            }catch(e){
                this.fireEvent('exception', [key, value]);
            }
        }, this);

        this.fireEvent('request');
        xhr.send(this.formData);

        if(!this.options.async) this.onStateChange();
        if(this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
        return this;
    }
});;/**
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
        'listActive': 'on',
        'defaultState': false,
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
			if (gx.util.isArray(this.options.data))
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
				'input': new gx.zeyos.Toggle(null, {
                    'value': item[this.options.listValue],
                    'on'   : item[this.options.listActive] == null ? this.options.defaultState : item[this.options.listActive]
                })
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
			this._bg = this._bg === '' ? ' bg-FA' : '';
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
						if (gx.util.isArray(obj)) {
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
;
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
		if (gx.util.isFunction(callback)) {
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
		} else if (gx.util.isObject(callback)) {
			for (evtType in callback)
				req.addEvent(evtType, callback[evtType]);
		}
		req.send();
	}
});
;/**
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
;/**
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
			this.set(this.options.timestamp == 0 ? new Date() : this.options.timestamp);
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
					width = width || 30;
				case 'm':
					name = name || 'month';
					width = width || 30;
				case 'y':
					name = name || 'year';
					width = width || 50;
				case 'h':
					name = name || 'hour';
					width = width || 30;
				case 'i':
					name = name || 'minute';
					width = width || 30;
				case 's':
					name = name || 'second';
					width = width || 30;
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
			var d;
			if (timestamp instanceof Date) {
				d = timestamp;
			} else {
				timestamp = parseInt(timestamp, 10);
				if (unit == null)
					unit = this.options.unit;
				if (unit == 'seconds')
					timestamp = timestamp * 1000;

				d = new Date(timestamp);
			}

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
;/**
 * @class gx.zeyos.Dialog
 * @description Create a
 * @extends gx.ui.Container
 *
 * @param {html element} display Html element to adopt the panel.
 * @param {object} options
 * @option {int} height
 * @option {stirng} title
 */
gx.zeyos.Dialog = new Class({
	Extends: gx.ui.Container,
	options: {
		'title': '',
		'height': 400
	},
	_frames: {},
	_current: false,
	initialize: function(display, options) {
		if (display == null) {
			display = new Element('div');
			$(document.body).adopt(display);
		}
		this.parent(display, options);

		this._ui.title = new Element('div', {'class': 'bg-F fs-18 br_t-5', 'html': this.options.title});
		this._ui.content = new Element('div', {'styles': {
			height: this.options.height,
			overflow: 'auto'
		}});
		this._ui.footer = new Element('div', {'class': 'mi_t-10'});
		this._ui.root.adopt([
			this._ui.title,
			new Element('hr'),
			this._ui.content,
			this._ui.footer
		]);
	},

	/**
	 * @method setTitle
	 * @description Set the dialog title
	 * @param {string} title
	 */
	setTitle: function(title) {
		if ( gx.util.isString(title) ) {
			this._ui.title.set('html', title);
		} else {
			this._ui.title.empty();
			this._ui.title.adopt(title);
		}
	},

	/**
	 * @method initFooter
	 * @description Initialize the footer
	 * @param {object|element} buttons
	 * @return {element}
	 */
	initFooter: function(buttons) {
		switch (typeOf(buttons)) {
			case 'element':
				return buttons;
				break;
			case 'object':
			case 'array':
				break;
			default:
				return __({'child': {'tag': 'button', 'class': 'fl-r', 'html': _('action.close'), 'onClick': function() {
				ZeyOSApi.hidePop();
			}}});
		}

		var div = new Element('div'),
		    list = [];
		Object.each(buttons, function(p, key) {
			var btn = new Element('button', {'class': 'm_l-5 fl-r', 'html': (p.icon == null ? '' : '<i class="icon-'+p.icon+'"></i> ') + p.label});
			if (p.click != null)
				btn.addEvent('click', p.click);
			if (p.primary)
				btn.addClass('em fb');
			div['_'+key] = btn;
			list.push(btn);
		});
		list.reverse();
		list.push(new Element('div', {'class': 'clr'}));
		div.adopt(list);
		return div;
	},

	/**
	 * @method openFrame
	 * @description Open a specific frame
	 * @param {string} key The frame ID
	 * @return {object} The selected frame (title: string, content: element, footer: object)
	 */
	openFrame: function(key) {
		if (this._current)
			this._current.content.setStyle('display', 'none');

		this._current = this._frames[key];

		this._ui.content.empty();
		this._ui.content.adopt(this._current.content);

		this._ui.footer.empty();
		this._ui.footer.adopt(this._current.footer);

		if (this._current.title != null)
			this.setTitle(this._current.title);

		return this._current;
	},

	/**
	 * @method getFrame
	 * @description Returns a specific frame
	 * @param {string} key The frame ID
	 * @return {object}
	 */
	getFrame: function(key) {
		return this._frames[key];
	},

	/**
	 * @method addFrame
	 * @description Adds a dialog frame
	 * @param {string} key The frame ID
	 * @param {object} options Frame options (title: string, content: element, footer: element)
	 * @param {bool} open Open the frame (if this is the first frame, it will be opened by default)
	 */
	addFrame: function(key, options, open) {
		this._frames[key] = {
			title: options.title == undefined ? null : options.title,
			content: __(options.content),
			footer: this.initFooter(options.footer)
		};

		if ((!this._current && open !== false) || open === true) {
			this.openFrame(key);
		}
	},

	/**
	 * @method addSubmitFrame
	 * @description Add the success frame
	 * @param {string} key The frame ID
	 * @param {element} content The frame content
	 * @param {function} onSubmit Submit action
	 * @param {bool} open Open the frame (if this is the first frame, it will be opened by default)
	 * @return {object} The content object
	 */
	addSubmitFrame: function(key, content, onSubmit, open) {
		this.addFrame(key, {
			title: this.options.title,
			content: __({'children': content}),
			footer: {
				close: {label: _('action.close'), click: function() {
					ZeyOSApi.hidePop();
				}},
				ok: {label: _('action.ok'), primary: true, click: function() {
					onSubmit();
				}}
			}
		}, open);
		return content;
	},

	/**
	 * @method addFormFrame
	 * @description Add a form frame frame
	 * @param {string} key The frame ID
	 * @param {element} form The form content {key: [label, elem], ...}
	 * @param {function} onSubmit Submit action
	 * @param {bool} open Open the frame (if this is the first frame, it will be opened by default)
	 * @return {object} The form object {key: elem, ...}
	 */
	addFormFrame: function(key, form, onSubmit, open) {
		var frm = {},
		    content = [],
		    m = '';

		Object.each(form, function(elem, key) {
			// Add the label
			content.push({'tag': 'p', 'html': elem[0] == null ? '' :elem[0], 'class': m});
			m = 'm_t-M'; // Margin for following elements

			// Add the field
			content.push(elem[1]);
			frm[key] = elem[1];
		});

		this.addSubmitFrame(key, content, onSubmit, open);

		return frm;
	},

	/**
	 * @method addSuccessFrame
	 * @description Add the success frame
	 * @param {string} key The frame ID
	 * @param {string|element} msg The success message
	 * @param {string} link The link to the created element
	 * @param {bool} open Open the frame (if this is the first frame, it will be opened by default)
	 */
	addSuccessFrame: function(key, msg, link, open) {
		this.addFrame(key, {
			title: this.options.title,
			content: __({'styles': {'text-align': 'center'}, 'children': {
				icon: {'styles': {
					'color': '#73b03c',
					'font-size': '96px',
					'text-shadow': '2px 2px #EFEFEF'
				}, 'child': {'tag': 'i', 'class': 'icon-ok'}},
				msg: {'styles': {
					'margin-top': '10px',
					'margin-bottom': '20px',
					'font-size': '14px'
				}, 'child': __(msg)},
				link: link == null ? null : {'tag': 'button', 'class': 'em fb', 'html': '<i class="icon-link-ext"></i> ' + _('action.open'), 'onClick': function() {
					window.open(link);
				}}
			}})
		}, open);
	},

	/**
	 * @method getFormValues
	 * @description Returns the values of a form object
	 * @param {object} form
	 * @return {object}
	 */
	getFormValues: function(form) {
		var res = {};

		Object.each(form, function(field, key) {
			switch (typeOf(field)) {
				case 'element':
					if (field.get('value') != null)
						res[key] = field.get('value');
					break;
				case 'object':
					if (instanceOf(field, gx.ui.Container)) {
						if (typeOf(field.getValue) == 'function')
							res[key] = field.getValue();
						else if (typeOf(field.getValues) == 'function')
							res[key] = field.getValues();
						else if (typeOf(field.getId) == 'function')
							res[key] = field.getId();
						else if (typeOf(field.get) == 'function')
							res[key] = field.get();
					}
					break;
			}
		});

		return res;
	}
});
;/**
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

			this.fireEvent('change', [ null, this.options.emptyCaption, this ]);

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
;/**
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
	}
};
;/**
 * @class gx.zeyos.Groupbox
 * @description Creates a collapsable groupbox
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} title: The title of the groupbox
 * @option {bool} show: Show or collapse the groupbox
 */
gx.zeyos.Groupbox = new Class({
	gx: 'gx.zeyos.Groupbox',
	Extends: gx.ui.Container,
	options: {
		'title': '',
		'open': true
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
			if (this.options.open)
				this._display.bar.addClass('act');
		} catch(e) { gx.util.Console('gx.zeyos.Groupbox->initialize', e.message); }
	},

	/**
	 * @method toggle
	 * @description Toggles the visibility of the groupbox (hide/open)
	 */
	toggle: function() {
		this._display.bar.toggleClass('act');
	},

	/**
	 * @method open
	 * @description Open the groupbox
	 */
	open: function() {
		this._display.bar.addClass('act');
	},

	/**
	 * @method close
	 * @description Close the groupbox
	 */
	close: function() {
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
;/**
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
		if ( gx.util.isString(title) ) {
			this._title.set('html', title);
		} else {
			this._title.empty();
			this._title.adopt(title);
		}
	},

	setContent: function(content) {
		if ( gx.util.isString(content) ) {
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
;/**
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
;/**
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
			if (gx.util.isNode(content)) {
				this._display.content.emptyy();
				this._display.content.adopt(content);
			}
			else if (gx.util.isString(content)) {
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
;/**
 * @method Panel
 */
/**
 * @class gx.zeyos.Panel
 * @description Create simple toggle panel
 * @extends gx.ui.Container
 *
 * @param {html element} display Html element to adopt the panel.
 * @param {string|html element} title Title of the panel.
 * @param {string|html element} content Content of the panel.
 * @param {boolean} open Open panel after creation.
 */
gx.zeyos.Panel = new Class({
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
		if ( gx.util.isString(title) ) {
			this._title.set('html', title);
		} else {
			this._title.empty();
			this._title.adopt(title);
		}
	},

	setContent: function(content) {
		if ( gx.util.isString(content) ) {
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
;/**
 * @class gx.zeyos.Permission
 * @description Creates a ZeyOS-Style permission box
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
gx.zeyos.Permission = new Class({
	gx: 'gx.zeyos.Permission',
	Extends: gx.ui.Container,
	options: {
		'value': true,
		'groups': []
	},
	_fields: {},
	_labels: {},
	_shared: false,
	initialize: function(display, options) {
		var root = this;
		this.parent(display, options);

		var labelFields = {
			'owner'  : ['Owner', 'field.owner'],
			'public' : ['Public', 'field.public'],
			'shared' : ['Shared', 'field.shared'],
			'private': ['Private', 'field.private']
		};

		if (typeof _ === 'function') {
			Object.each(labelFields, function(f, key) {
				this._labels[key] = _(f[1]);
			}.bind(this));
		} else {
			Object.each(labelFields, function(f, key) {
				this._labels[key] = f[0];
			}.bind(this));
		}

		this._display.select = new gx.zeyos.SelectFilter(null, {
			data: this.options.groups,
			allowEmpty: true
		});

		this._display.checkbox = new Element('input', {'type': 'checkbox', 'class': 'm_r-6X'});
		this._display.indicator = new Element('span', {'class': 'fc-B6 fn m_l-10X'});
		this._display.root.adopt([
			__({'tag': 'p', 'child':
				{'tag': 'label', 'children': [
					this._display.checkbox,
					this._labels.owner,
					this._display.indicator
				]}
			}),
			this._display.select
		]);

		this._display.checkbox.addEvent('click', function(event) {
			if (!this._display.checkbox.checked) {
				this.set(false);
			} else {
				this.set(true);
			}
		}.bind(this));

		this.set(this.options.value);
	},

	/**
	 * @method set
	 * @description Sets the timestamp according to the given unit
	 * @param {false|true|int} permission Sets the permission (FALSE: private, TRUE: public, INT: Group ID)
	 */
	set: function(permission) {
		if (permission === false || permission === 'private') {
			// Private
			this._display.select._display.textbox.set('placeholder', '(' + this._labels.private + ')');
			this._display.indicator.set('html', '(' + this._labels.private + ')');
			this._display.select.set();
			this._display.select.disable();
			this._display.checkbox.checked = false;
			this._shared = false;
		} else {
			this._display.select._display.textbox.set('placeholder', '(' + this._labels.public + ')');
			this._display.indicator.set('html', '(' + this._labels.shared + ')');
			this._display.checkbox.checked = true;
			this._display.select.enable();
			this._display.select.reset();
			this._shared = true;
			if (permission !== true && permission !== 'public') {
				this._display.select.setId(permission);
			}
		}
	},

	/**
	 * @method get
	 * @description Returns the current selection
	 * @return
	 */
	get: function() {
		if (this._shared) {
			var group = this._display.select.getId();
			return group == null ? 'public' : group;
		}

		return 'private';
	}
});
;/**
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
;/**
 * @class gx.zeyos.Request
 * @description Utility class to send REST requests
 * @extends gx.core.Settings
 *
 * @option {string} service
 * @option {string} accesskey
 *
 * @event error (Message, Response, Header)
 * @event failure
 * @event exception
 * @event success
 *
 * @sample Msgbox Try the different messagebox types with custom text.
 */
gx.zeyos.Request = new Class({
	Extends: gx.core.Settings,
	options: {
		'service': false,
		'accesskey': false
	},
	_files: [],
	initialize: function (options) {
		this.parent(options);

		if (typeOf(options.showError) == 'function') {
			this.showError = options.showError;
		}
		
		this.baseUrl = '../remotecall/'+this.options.service+(this.options.accesskey ? ':'+this.options.accesskey : '')+'/';
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
		var reqOptions = {
			'url': this.baseUrl + path,
			'method': method,
			'data': data,
			'onRequest': function() {
				this.fireEvent('request');
			}.bind(this),
			'onComplete': function() {
				this.fireEvent('complete');
			}.bind(this),
			'onFailure': function(xhr) {
                this.fireEvent('failure', xhr);
				if (xhr.responseText !== '') {
					var json = xhr.responseText;
					res = JSON.decode(json);
					if (typeOf(res) == 'object') {
						if (res.error != null)
							this.fireEvent('error', 'Error: '+res.error);
						else
                            this.fireEvent('error', 'Server error (' + xhr.status + ') ' + json);
					}
				}
			}.bind(this),
            'onException': function(headerName, json) {
                this.fireEvent('exception', [json, headerName]);
                res = JSON.decode(json);
                if (typeOf(res) == 'object') {
                    if (res.error != null) {
                        this.fireEvent('error', 'Error: ' + res.error);
                    } else if (res.result == null) {
                        this.fireEvent('error', 'Invalid response (no result): '+json);
                    } else {
                        callback(res.result, headerName);
                    }
                } else {
                    this.fireEvent('error', 'Invalid response: ' + json);
                }
            }.bind(this),
			'onSuccess': function(json) {
				this.fireEvent('success', json);
                res = JSON.decode(json);
                if (typeOf(res) == 'object') {
                    if (res.error != null) {
                        this.fireEvent('error', 'Error: ' + res.error);
                    } else if (res.result == null) {
                        this.fireEvent('error', 'Invalid response (no result): '+json);
                    } else {
                        callback(res.result, '200 OK');
                    }
                } else {
                    this.fireEvent('error', 'Invalid response: ' + json);
                }
			}.bind(this)
		};
		var req;
		if (this._files[0] != null) {
			req = new Request.File(reqOptions);
			this._files.each(function(elem) {
				req.addFile(elem);
			});
		} else {
			req = new Request(reqOptions);
		}
		req.send();
		this._files = [];
	},
	
	/**
	 * @method showError
	 * @description Displays an error message
	 * @param {string} err
	 */
	showError: function(err) {
		// ZeyOSApi.showMsgRuntimeError(err);
		alert(err);
	},
	
	/**
	 * @method openLink
	 * @description Opens a link in new window
	 * @param {string} path The REST path (e.g. "list/") - please mind the exact name of your resource (e.g. mind trailing slashes)
	 */
	openLink: function(path) {
		window.open(this.baseUrl + path, '_blank');
	},
	
	/**
	 * @method upload
	 * @description Performs a POST request with file upload
	 * @param {string} path The REST path (e.g. "list/") - please mind the exact name of your resource (e.g. mind trailing slashes)
	 * @param {object|string} data The request data
	 * @param {array} files Array of file elements to upload
	 * @param {function} callback The callback function
	 */
	upload: function(path, data, files, callback) {
		this._files = files;
		this.send(path, data, callback, 'POST');
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


;/**
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
;/**
 * @class gx.zeyos.Select
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL
 * @extends gx.ui.Container
 *
 * @param  {element|string}  display         The display element
 * @param  {object}          options
 *
 * @option {string}          height          Default: auto
 * @option {string}          selectionPrefix An optional prefix displayed in front of the selected value
 * @option {string}          icon            The glyphikon icon (default: chevron-down)
 * @option (string)          resetable       If set, add an additional list option to reset the selection (e.g. "Select all")
 * @option {string}          textboxClass    Additional textbox class
 * @option {array}           data            Default data
 * @option {string|function} elementIndex    The ID format (default key is "ID"; specify function to overwrite)
 * @option {string|function} elementLabel    Element label or alternative list format (Default returns a:"elem.name")
 * @option {string|function} elementSelect   The label for selected elements or alternative format function
 * @option {object}          elementDefault  Represents a default element, e.g. for "empty" selections
 * @option {string|int}      value           Specifies the default/preset value or simple lists
 *
 * @event show     When the selection list is shown
 * @event hide     When the selection list is hidden
 * @event select   When an element is selected
 * @event noselect When no element is selected
 *
 */
gx.zeyos.Select = new Class({
	gx: 'gx.zeyos.Select',
	Extends: gx.ui.Container,
	options: {
		'height'         : 'auto',
		'allowEmpty'     : false,
		'selectionLabel' : false,
		'icon'           : 'chevron-down',
		'resetable'      : false,
		'textboxClass'   : false,
		'data'           : null,
		'elementIndex'   : 'ID',
		'elementLabel'   : 'name',
		'elementSelect'  : 'name',
		'elementDefault' : null,
		'value'          : null,
		/* Messages */
		'msg'            : {
			'noSelection': 'No Selection'
		}
	},
	_closed    : true,
	_selected  : null,
	_currentElem: null,
	_running   : false,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			this._display.root.addClass('gx-zeyos-select');
			this._display.fieldset = new Element('fieldset', {
				'class' : 'sel',
				'name'  : 'view',
				'styles': {'max-width': + root.options.width}
			});
			if (this.options.fieldsetClass)
				this._display.fieldset.addClass(this.options.fieldsetClass);

			this._display.textbox = new Element('input', {
				'type'       : 'text',
				'class'      : 'form-control',
				'placeholder': '('+this.getMessage('noSelection')+')'
			});
			if (this.options.textboxClass)
				this._display.textbox.addClass(this.options.textboxClass);

			this._display.dropdown = new Element('section', {
				'styles': {
					'max-height': this.options.height
				}
			});

			this._display.root.adopt(
				this._display.fieldset.adopt([
					this._display.textbox,
					this._display.dropdown
				])
			);

			// Initialize keyboard controls
			this.fxScoll = new Fx.Scroll(this._display.dropdown, {
				offset: {
					y: -100
				}
			});
			this._display.textbox.addEvents({
				'click': function () {
					this.show();
				}.bind(this),
				'focus': function () {
					this.show();
				}.bind(this),
				'blur': function () {
					this.hide.delay(300, root);
				}.bind(this),
				'keypress': function (event) {
					if ( event.key == 'tab' )
						return;
					if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();
						return;
					}
					if ( this.search == null )
						event.preventDefault(); // Do nothing for simple select boxes
				}.bind(this),
				'keydown': function (event) {
					if ( event.key == 'tab' )
						return;
					if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();
						return;
					}
					if ( this.search == null )
						event.preventDefault(); // Do nothing for simple select boxes
				}.bind(this),
				'keyup': function (event) {
					if ( event.key == 'tab' )
						return;

					if ( event.key == 'esc' ) {
						this.hide();
					} else if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();

						this.show();

						var li;
						if (this._currentElem == null) {
							if(event.key == 'down')
								li = this._display.dropdown.getFirst(':not(.hidden)');
							else
								li = this._display.dropdown.getLast(':not(.hidden)');
						} else {
							if(event.key == 'down') {
								li = this._currentElem.getNext(':not(.hidden)');
								if (li == null && this._currentElem == this._display.dropdown.getLast(':not(.hidden)'))
									li = this._display.dropdown.getFirst(':not(.hidden)');
							} else {
								li = this._currentElem.getPrevious(':not(.hidden)');
								if (li == null && this._currentElem == this._display.dropdown.getFirst(':not(.hidden)'))
									li = this._display.dropdown.getLast(':not(.hidden)');
							}
						}

						if (li != null) {
							if (this._currentElem != null)
								this._currentElem.removeClass('act');
							this._currentElem = li;
							this._currentElem.addClass('act');
							this.fxScoll.toElement(this._currentElem);
						}

						return;
					} else if ( event.key == 'enter' ) {
						if (this._currentElem != null) {
							this._currentElem.fireEvent('click');
						}

						return;
					}

					if ( this.search != null ) {
						this.show();
						this.search();
					} else
						event.preventDefault(); // Do nothing for simple select boxes
				}.bind(this)
			});

			if (gx.util.isFunction(this.options.elementIndex))
				this.getId = this.options.elementIndex.bind(this);

			if (gx.util.isFunction(this.options.elementLabel))
				this.getLink = this.options.elementLabel.bind(this);

			if (gx.util.isFunction(this.options.elementSelect))
				this.showSelection = this.options.elementSelect.bind(this);

			if (gx.util.isArray(this.options.data))
				this.setData(this.options.data);

			if (this.options.value != null && gx.util.isString(this.options.elementIndex)) {
				this.options.data.each(function(entry) {
					if (entry[this.options.elementIndex] == this.options.value)
						this.set(entry, true);
				}.bind(this));
			}
		} catch(e) {
			e.message = 'gx.zeyos.Select: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method set
	 * @description Sets the selected element
	 * @param {object} selection The element to select
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	set: function (selection, noEvents) {
		this._selected = selection;
		return this.update(noEvents !== false);
	},

	/**
	 * Updates the selection by ID
	 * @param {string|int} id
	 */
	setId: function(id) {
		var data,
		    list = this.getRows();
		for (var i = 0 ; i < list.length ; i++) {
			data = list[i].retrieve('data');
			if ( this.getId(data) == id ) {
				this.set(data);
				return;
			}
		}
	},

	/**
	 * @method update
	 * @description Updates the select box according to its state of selection
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	update: function (noEvents) {
		if (noEvents == null || !noEvents)
			this.fireEvent(this._selected == null ? 'noselect' : 'select', this._selected);

		this.showSelection(this._selected);
		this.hide();

		return this;
	},

	showSelection: function() {
		this._display.textbox.set('value', this._selected == null ? '' : this._selected[this.options.elementSelect]);
	},

	/**
	 * @method getID
	 * @description Returns the ID of the selected element
	 */
	getId: function (elem) {
		if (elem != null)
			return elem[this.options.elementIndex];

		if (this._selected != null)
			return this._selected[this.options.elementIndex];

		return null;
	},

	/**
	 * Returns the element's link
	 *
	 * @param  {object} elem
	 * @return {element}
	 */
	getLink: function(elem) {
		return new Element('div', {
			'class': 'sel_item',
			'html': elem[this.options.elementLabel]
		});
	},

	/**
	 * @method getRows
	 * @description Returns the list rows
	 * @return {array}
	 */
	getRows: function() {
		return this._display.dropdown.getElements('>div');
	},

	/**
	 * @method setData
	 * @description Builds a list of links from the provided array
	 * @param {array} list The provided array
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	setData: function (list) {
		var root = this;
		try {
			this._display.dropdown.empty();
			this._currentElem = null;

			if (this.options.resetable) {
				this._display.dropdown.adopt(__({'class': 'sel_item reset', 'html': this.options.resetable, 'onClick': function() {
					this.set();
				}.bind(this)}));
			}

			var addCLink = function (link, el) {
				link.addEvent('click', function () {
					root.set(el);
				});
			};

			if ( this.options.elementDefault != null )
				list = [this.options.elementDefault].append(list);

			var len = list.length;

			for ( i = 0 ; i < len ; i++ ) {
				if (list[i] == null)
					continue;

				var row = this.getLink(list[i]);
				if ( this._selected != null && this.getId(list[i]) == this.getId(this._selected) )
					row.addClass('act');

				row.store('data', list[i]);
				row.store('key', i);
				this._display.dropdown.adopt(row);
				addCLink(row, list[i]);
			}
		} catch(e) {
			e.message = 'gx.zeyos.Select: ' + e.message;
			throw e;
		}

		return this;
	},

	/**
	 * @method show
	 * @description Shows the select box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	show: function () {
		if ( this._display.textbox.disabled )
			return this;

		this._display.fieldset.addClass('act');
		this._display.textbox.focus();

		this.fireEvent('show');
		return this;
	},

	/**
	 * @method hide
	 * @description Hides the select box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	hide: function () {
		if (!this.isOpen())
			return this;

		this._display.fieldset.removeClass('act');
		this.clearCursor();

		this.fireEvent('hide');
		return this.update();
	},

	/**
	 * @method isOpen
	 * @description Returns if the list box is open
	 * @return {bool}
	 */
	isOpen: function() {
		return this._display.fieldset.hasClass('act');
	},

	/**
	 * @method getValue
	 * @description Alias for getID
	 */
	getValue: function () {
		return this.getId();
	},

	/**
	 * @method getSelected
	 * @description Returns the selected element
	 */
	getSelected: function () {
		return this._selected;
	},

	/**
	 * @method clearCursor
	 * @description Removes the current list selection
	 */
	clearCursor: function() {
		if (this._currentElem == null)
			return;

		this._currentElem.removeClass('act');
		this._currentElem = null;
	},

	/**
	 * @method reset
	 * @description Resets the selection
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	reset: function (noEvents) {
		return this.set(null, noEvents);
	},

	/**
	 * @method enable
	 * @description Enables the text box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	enable: function () {
		this._display.textbox.erase('disabled');
		return this;
	},

	/**
	 * @method disable
	 * @description Disables the text box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.zeyos.Select
	 */
	disable: function () {
		this._display.textbox.set('disabled', true);
		return this;
	}
});

/**
 * @class gx.zeyos.SelectPrio
 * @description Creates a priority select box
 * @extends gx.zeyos.Select
 */
gx.zeyos.SelectPrio = new Class({
	gx: 'gx.zeyos.SelectPrio',
	Extends: gx.zeyos.Select,
	options: {
		elementIndex: 'value',
		data: [
			{'value': 0, 'color': '#008000', 'symbol': '■□□□□', 'label': 'lowest'},
			{'value': 1, 'color': '#ffc000', 'symbol': '■■□□□', 'label': 'low'},
			{'value': 2, 'color': '#ff8000', 'symbol': '■■■□□', 'label': 'medium'},
			{'value': 3, 'color': '#ff4000', 'symbol': '■■■■□', 'label': 'high'},
			{'value': 4, 'color': '#c00000', 'symbol': '■■■■■', 'label': 'highest'}
		],
		value: 0
	},
	_labels: {},
	initialize: function (display, options) {
		var root = this;
		try {
			var labelFields = {
				'lowest' : ['Lowest', 'priority.lowest'],
				'low'    : ['Low', 'priority.low'],
				'medium' : ['Medium', 'priority.medium'],
				'high'   : ['High', 'priority.high'],
				'highest': ['Highest', 'priority.highest']
			};
			if (typeof _ === 'function') {
				Object.each(labelFields, function(f, key) {
					this._labels[key] = _(f[1]);
				}.bind(this));
			} else {
				Object.each(labelFields, function(f, key) {
					this._labels[key] = f[0];
				}.bind(this));
			}

			this.parent(display, options);
		} catch(e) {
			e.message = 'gx.zeyos.Select: ' + e.message;
			throw e;
		}
	},

	showSelection: function() {
		this._display.textbox.set('value', this._selected == null ? '' : this._selected.symbol + ' | ' + this._labels[this._selected.label]);
	},

	getLink: function(elem) {
		return new Element('div', {
			'class' : 'sel_item',
			'html'  : elem.symbol + ' | ' + this._labels[elem.label],
			'styles': {'color': elem.color}
		});
	}
});

/**
 * @class gx.zeyos.SelectFilter
 * @description Creates a filterable search list
 * @extends gx.zeyos.Select
 *
 * @param  {element|string}  display         The display element
 * @param  {object}          options
 *
 * @option {string}          height          Default: 200px
 * @option {string}          selectionPrefix An optional prefix displayed in front of the selected value
 * @option {string}          icon            The glyphikon icon (default: chevron-down)
 * @option (string)          resetable       If set, add an additional list option to reset the selection (e.g. "Select all")
 * @option {string}          textboxClass    Additional textbox class
 * @option {array}           data            Default data
 * @option {string|function} elementIndex    The ID format (default key is "ID"; specify function to overwrite)
 * @option {string|function} elementLabel    Element label or alternative list format (Default returns a:"elem.name")
 * @option {string|function} elementSelect   The label for selected elements or alternative format function
 * @option {object}          elementDefault  Represents a default element, e.g. for "empty" selections
 * @option {string|int}      value           Specifies the default/preset value or simple lists
 * @option {array}           searchfields    List of searchable object fields inside
 *
 */
gx.zeyos.SelectFilter = new Class({
	gx: 'gx.zeyos.SelectFilter',
	Extends: gx.zeyos.Select,
	options: {
		'height'      : '200px',
		'searchfields': ['name']
	},
	_lastSearch: null,

	initialize: function (display, options) {
		var root = this;
		try {
			this.addEvent('show', function() {
				this.search();
			}.bind(this));
			this.parent(display, options);
		} catch(e) {
			e.message = 'gx.zeyos.SelectFilter: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method search
	 * @description Initiates a search request
	 * @returns Returns this instance (for method chaining).
	 */
	search: function () {
		try {
			var query = this._display.textbox.get('value');
			if (this._lastSearch == query)
				return;

			this.clearCursor();
			this._lastSearch = query;
			this._searchQuery(query);

		} catch(e) {
			e.message = 'gx.zeyos.SelectFilter: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method search
	 * @description Performs a search
	 * @returns Returns this instance (for method chaining).
	 */
	_searchQuery: function (query) {
		try {
			this._display.dropdown.getElements('>div').each(function(li) {
				var field,
				    data = li.retrieve('data', {});

				for (var i = 0 ; i < this.options.searchfields.length ; i++) {
					field = this.options.searchfields[i];
					if (query == '') {
						li.removeClass('hidden');
						return;
					}
					switch (typeOf(data[field])) {
						case 'number':
							data[field] = data[field].toString();
						case 'string':
							if (data[field].test(query, 'i')) {
								li.removeClass('hidden');
								return;
							}
					}
				}
				li.addClass('hidden');
			}.bind(this));
		} catch(e) {
			e.message = 'gx.zeyos.SelectFilter: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method showLoader
	 * @description Show the loader icon
	 * @return gx.zeyos.SelectFilter
	 */
	showLoader: function() {
		// this._display.icon.set('class', 'glyphicon glyphicon-refresh');
		return this;
	},

	/**
	 * @method hideLoader
	 * @description Hide the loader icon and restore the default icon
	 * @return gx.zeyos.SelectFilter
	 */
	hideLoader: function() {
		// this._display.icon.set('class', 'glyphicon glyphicon-'+this.options.icon);
	}
});

/**
 * @class gx.zeyos.SelectDyn
 * @description Creates a dynamic select box with searchable conent
 * @extends gx.zeyos.Select
 *
 * @param  {element|string}  display         The display element
 * @param  {object}          options
 *
 * @option {string}          height          Default: 200px
 * @option {string}          selectionPrefix An optional prefix displayed in front of the selected value
 * @option {string}          icon            The glyphikon icon (default: chevron-down)
 * @option (string)          resetable       If set, add an additional list option to reset the selection (e.g. "Select all")
 * @option {string}          textboxClass    Additional textbox class
 * @option {array}           data            Default data
 * @option {string|function} elementIndex    The ID format (default key is "ID"; specify function to overwrite)
 * @option {string|function} elementLabel    Element label or alternative list format (Default returns a:"elem.name")
 * @option {string|function} elementSelect   The label for selected elements or alternative format function
 * @option {object}          elementDefault  Represents a default element, e.g. for "empty" selections
 * @option {string|int}      value           Specifies the default/preset value or simple lists
 * @option {string}          url             The request URL
 * @option {string}          method          The request method (default: GET)
 * @option {string|function} queryParam      The query paramter or a function that returns the request data object (e.g. {search: QUERY, entity: ...})
 * @option {object}          requestData     Default request data
 *
 * @event show     When the selection list is shown
 * @event hide     When the selection list is hidden
 * @event select   When an element is selected
 * @event noselect When no element is selected
 *
 */
gx.zeyos.SelectDyn = new Class({
	gx: 'gx.zeyos.SelectDyn',
	Extends: gx.zeyos.SelectFilter,
	options: {
		'url': './',
		'method': 'GET',
		'queryParam': 'query',
		'parseDefault': false,
		'requestData': {}
	},
	_requestChain:[],
	_firstLoad: false,

	initialize: function (display, options) {
		var root = this;
		try {
			if (options.onRequestSuccess == null)
				this.options.parseDefault = true;


			this.addEvent('show', function() {
				if (this._firstLoad)
					return;

				this.search();
				this._firstLoad = true;
			}.bind(this));

			this.parent(display, options);

			if (gx.util.isFunction(this.options.queryParam))
				this.getRequetData = this.options.queryParam.bind(this);

			if (this.options.parseDefault) {
				this.addEvent('requestSuccess', function(json) {
					var r = gx.util.parseResult(json);
					this.setData(gx.util.isArray(r) ? r : []);
				}.bind(this))
			}
		} catch(e) {
			e.message = 'gx.zeyos.SelectDyn: ' + e.message;
			throw e;
		}
	},

	getRequetData: function(query, data) {
		data[this.options.queryParam] = query;
		return data;
	},

	_searchQuery: function(query) {
		var r = new Request({
			'method'   : this.options.method,
			'url'      : this.options.url,
			'data'     : this.getRequetData(query, Object.clone(this.options.requestData)),
			'onRequest': function() {
				this.showLoader();
			}.bind(this),
			'onComplete': function() {
				this.hideLoader();
				var next = this._requestChain.pop();
				if (next != null && next != r) {
					this._requestChain = []; // Reset the chain, only execute the next request
					next.send();
				}
			}.bind(this),
			'onSuccess': function (json) {
				this.fireEvent('requestSuccess', json);
			}.bind(this),
			'onFailure': function () {
				this.fireEvent('requestFailure');
			}.bind(this)
		});
		this._requestChain.push(r);

		if (this._requestChain.length == 1)
			r.send();
	}
});

;/**
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
			if (gx.util.isArray(frames)) {
				frames.each(function(item) {
					root.addTab(item.name, item.title, item.content);
				});
			}

			if (gx.util.isFunction(this.options.onChange))
				this.addEvent('change', this.options.onChange);

			if (gx.util.isString(this.options.show))
				this.openTab(this.options.show);
			else if(gx.util.isNumber(this.options.show)) {
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
			switch (typeOf(content)) {
				case 'string':
					content = new Element('div', {'html': content});
					break;
				case 'textnode':
					content = (new Element('div')).adopt(content);
					break;
				case 'element':
					break;
				default:
					return false;
			}

			if (gx.util.isString(name) && gx.util.isString(title) && gx.util.isNode(content)) {
				if (!gx.util.isNode(this._tabs[name])) {
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
			if (gx.util.isNode(this._tabs[name])) {
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
			if (gx.util.isNode(this._tabs[name])) {
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
;/**
 * @class gx.bootstrap.Table
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL.
 * @extends gx.ui.Table
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
    gx     : 'gx.bootstrap.Table',
    Extends: gx.ui.Table,

    _theme: {
        asc          : 'asc',
        desc         : 'desc',
        unfiltered   : '',
        th           : 'th',
        filter       : 'filter',
        table_body   : 'tbl',
        table_head   : 'tbl',
        table_head_tr: 'tbl_head',
        table_body_tr: 'tbl_row',
        oddRow       : 'bg',
        colCheck     : 'tbl_chk'
    }
});
;/**
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
;/**
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
;/**
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
		if (display == null)
			display = new Element('fieldset');
		this.parent(display, options);

		var root = this;
		if (this._display.root.get('tag') == 'fieldset') {
			this._display.fieldset = this._display.root;
		} else {
			this._display.fieldset = new Element('fieldset', {'class': 'm_r-10'}).inject(this._display.root, 'top');
		}

		this._display.fieldset.addClass('tgl');
		this._display.fieldset.addEvent('click', function() {
			root.toggle();
		});

		if ( this.options.on )
			this._display.fieldset.addClass('act');
	},

	getState: function() {
		if ( this._display.fieldset.hasClass('act') )
			return true;
		else
			return false;
	},

	getValue: function() {
		if ( this._display.fieldset.hasClass('act') )
			return this.options.value;
		else
			return false;
	},

	toggle: function() {
		if ( this._display.fieldset.hasClass('act') )
			this.setUnchecked();
		else
			this.setChecked();
	},

	setChecked: function() {
		this._display.fieldset.addClass('act');
		this.fireEvent('check');
	},

	setUnchecked: function() {
		this._display.fieldset.removeClass('act');
		this.fireEvent('uncheck');
	}
});
