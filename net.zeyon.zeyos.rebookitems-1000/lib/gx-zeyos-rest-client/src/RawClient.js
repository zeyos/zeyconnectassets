(function (NS) {
	var Api, HttpClient, HttpRequest;

	/**
	 * This is a example implementation. You most likely want to overwrite this.
	 *
	 */
	NS.handleRequestResult = function(res, message, expectedResult, suppressAlert) {
    var showAlert = false;

    if ( res instanceof HttpRequest.Failure ) {
      // Will be handled by bound events in GUI class.
      return false;

    } else if ( res.error ) {
      showAlert = res.error;

    } else if ( expectedResult !== undefined ) {
      var validResult = true;
      if ( typeof expectedResult === 'function' )
        validResult = expectedResult(res.result);
      else if ( res.result !== expectedResult )
        validResult = false;

      if ( validResult === false ) {
        showAlert = 'Received invalid result: ' + res.result;
      }
    }

    if ( showAlert !== false ) {
      if ( suppressAlert === true )
        return false;

      alert(message + '\n' + showAlert);
      return false;
    }

    return true;
  };





	/**
	 * Api class abstracting http requests from the system environment.
	 */
	Api = NS.RawClient = new Class({
		Implements: [Events, Options],

		options: {
			proxy: false
		},

		proxyUrlPrefix: '../proxy/index.php',
		httpClient: null,
		initialize: function (options) {
			this.setOptions(options);

			this.httpClient = new HttpClient();
			this.initRawRequest(this.options.proxy);
		},

		/**
		 * Set listener for all requests events.
		 *
		 * @public
		 *
		 * @param {object} listener
		 */
		setListener: function(listener) {
			this.httpClient.setListener(listener);
		},

		/**
		 * Do request a task/resource of the zeylib api of a platform.
		 * Populating the request with authentification data.
		 *
		 * @public
		 *
		 * @param  {string} requestType Http method.
		 * @param  {string} url
		 * @param  {object} data
		 * @param  {array} file
		 * @return {Promise}
		 */
		request: function (options) {
			return this.rawRequest.call(this, options);
		},

		rawRequestXHR: function (options) {
			var result = new RequestPromiseWrapper(this.httpClient, options);

			if ( options.returnRequestObj === true )
				return result;

			return result.send();
		},

		rawRequestProxy: function (options) {
			options.url = this.proxyUrlPrefix + '?DELEGATE_URL=' + encodeURIComponent(options.url);
			return this.rawRequestXHR(options);
		},

		/**
		 * Initialize the request function which will be used for requests in
		 * dependence of the system environment.
		 *
		 * @private
		 *
		 */
		initRawRequest: function (proxy) {
			if ( !proxy ) {
				this.rawRequest = this.rawRequestXHR.bind(this);
			} else {
				if ( typeof proxy === 'string' )
					this.proxyUrlPrefix = proxy;

				this.rawRequest = this.rawRequestProxy.bind(this);
			}
		},

	});






	/**
	 * Mootools like Request object allowing to listen for additional events
	 * like "onerror" and "onabort".
	 */
	HttpRequest = NS.HttpRequest = new Class({
		Implements: [Events, Options],

		options: {
			// onRequest: function(){},
			// onLoadstart: function(event, xhr){},
			// onProgress: function(event, xhr){},
			// onComplete: function(){},
			// onCancel: function(){},
			// onSuccess: function(responseText, responseXML){},
			// onFailure: function(xhr){},
			url: '',
			data: '',
			file: null, // NOTE this prevents option "json" and forces content-type "multipart/form-data"
			defaultHeaders: {
				'X-Requested-With': 'XMLHttpRequest',
				'Accept': 'application/json, text/html, */*'
			},
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			urlEncoded: true,
			async: true,
			method: 'post',
			timeout: 0,
			isSuccess: null,
			json: false,
			parseResponse: function(text, xml, httpRequest) {
				var json = JSON.parse(text);

				if ( typeof json !== 'object' )
					throw new Error('Response is not of type object');

				if ( json.result === undefined && json.error === undefined )
					throw new Error('Response neither contains "result" nor "error" key.');

				return json;
			}
		},

		running: false,
		parsedResponseText: null,
		initialize: function (options) {
			this.setOptions(options);
			this.options.method = this.options.method.toLowerCase();

			this.boundIsSuccess = this.isSuccess.bind(this);
		},

		/**
		 * Support for one file only! If you want to upload more file simultaniously,
		 * start more requests.
		 */
		send: function(file, filePostName) {
			var url = this.options.url;
			var data = this.options.data;
			var method = this.options.method;
			var contentType = this.options.contentType;

			if ( file ) {
				contentType = false; // Do not set content type header
				// this will be done from the browser automatically
				// with correct multipart boundary string etc.
				var tData = data;
				data = new FormData();
				var name;
				for ( name in tData ) {
					if ( !tData.hasOwnProperty(name) )
						continue;

					data.append(name, tData[name]);
				}

				data.append(filePostName, file);

			} else if ( this.options.json === true ) {
				data = JSON.stringify(data);

				contentType = 'application/json; charset=utf-8';
			} else if (data && this.options.urlEncoded && typeof data === 'object') {
				data = Object.toQueryString(data);
			}

			var xhr = this.xhr = new Browser.Request(); //new XMLHttpRequest();

			// Append data to url on "get" and "delete"
			if ( data && (method == 'get' || method == 'delete') ) {
				url += (
					url.indexOf('?') > -1 ?
					'&' :
					'?'
				) + data;

				data = null;
			}

			xhr.onabort = this.processAbort.bind(this);
			xhr.onerror = this.processError.bind(this);
			xhr.onloadstart = this.processLoadstart.bind(this);
			xhr.onprogress = this.processProgress.bind(this);
			xhr.ontimeout = this.processTimeout.bind(this);

			if ( this.options.async )
				xhr.onreadystatechange = this.onStateChange.bind(this);

			this.running = true;
			this.fireEvent('request');
			xhr.open(method, url, this.options.async);

			// IE wants this to be set AFTER xhr.open. Mozilla suggests that it is
			// invalid to set this property on synchron calls.
			if ( xhr !== undefined && this.options.async )
				xhr.timeout = this.options.timeout;

			var headers = Object.merge({}, this.options.defaultHeaders, this.options.headers);
			if ( (method == 'post' || method == 'put') && contentType )
				headers['Content-Type'] = contentType;

			this.setHeaders(headers);

			xhr.send(data);

			if ( !this.options.async )
				this.onStateChange();

			return this;
		},

		onStateChange: function (event) {
			var xhr = this.xhr;
			if ( xhr.readyState !== 4 ) {
				this.processProgress(event);
				return;
			}

			var isSuccess = (
				typeof this.options.isSuccess === 'function' ?
				this.options.isSuccess.bind(this) :
				this.boundIsSuccess
			);

			try {
				var howToProcess = isSuccess();
				if ( howToProcess === true ) {
					this.processSuccess(event);
				}
				else if ( howToProcess === false ) {
					this.processFailure(event);
				}
				// else
				// Will be handled by the appropriate event.
			} catch (err) {
					this.processError(event, err);

			}
		},

		isSuccess: function(){
			var xhr = this.xhr;
			var status = xhr.status;
			if ( status === 0 ) {
				// We did not receive any response from server because something
				// prevented the successful communication. This might happen due to
				// CORS, timeout etc.
				// However, since all of this problems trigger an appropriate event
				// by itself we dont wont this process as failure or success at this
				// point.
				return null;
			}
			if (status >= 200 && status < 300) {
				this.parsedResponseText = this.options.parseResponse(
					xhr.responseText,
					xhr.responseXML,
					this
				);

				return true;
			}

			return false;
		},

		setHeader: function (name, value) {
			this.xhr.setRequestHeader(name, value);
			return this;
		},

		setHeaders: function (headers) {
			for (var name in headers) {
				if ( headers.hasOwnProperty(name) )
					this.setHeader(name, headers[name]);
			}

			return this;
		},

		processComplete: function() {
			if ( !this.running )
				return;

			this.running = false;
			this.fireEvent('complete');
		},

		processSuccess: function(event) {
			this.processComplete();
			this.fireEvent('success', [this.parsedResponseText, this]);
		},

		processFailure: function(event) {
			this.processComplete();
			this.fireEvent('failure', [new HttpRequest.Failure(this, event)]);
		},

		processLoadstart: function(event) {
			this.fireEvent('loadstart', [event, this]);
		},

		processProgress: function(event) {
			this.fireEvent('progress', [event, this]);
		},

		processAbort: function(event) {
			this.processComplete();
			this.fireEvent('abort', [new HttpRequest.Failure(this, event)]);
		},

		processError: function(event, err) {
			this.processComplete();
			this.fireEvent('error', [new HttpRequest.Failure(this, event, err)]);
		},

		processTimeout: function(event) {
			this.processComplete();
			this.fireEvent('timeout', [new HttpRequest.Failure(this, event)]);
		},

		getXhr: function() {
			return this.xhr;
		},

		cancel: function() {
			if ( !this.xhr )
				return;

			this.xhr.abort();
			this.xhr.onreadystatechange = null;
			// this.processAbort();
		},

		getStatusCode: function() {
			if ( this.xhr )
				return this.xhr.status;

			return null;
		},

		getStatusText: function() {
			if ( this.xhr )
				return this.xhr.statusText;

			return null;
		},

		getResponseText: function() {
			if ( this.xhr )
				return this.xhr.responseText;

			return null;
		},

		getParsedResponseText: function() {
			return this.parsedResponseText;
		}
	});








	/**
	 * Request failed result wrapper.
	 */
	HttpRequest.Failure = new Class({
		httpRequest: null,
		event: null,
		err: null,
		initialize: function(httpRequest, event, err) {
			this.httpRequest = httpRequest;
			this.event = event;
			this.err = err;
		},

		getResponseError: function() {
			var hr = this.httpRequest;
			var xhr = hr.getXhr();
			if ( !xhr && this.err ) {
				if ( this.err instanceof FileTransferError )
					return this.err.exception;

				return this.err;
			}

			try {
				var response = hr.options.parseResponse(
					xhr.responseText,
					xhr.responseXML,
					hr
				);

				if ( response.error )
					return response.error;
			} catch (e) {
				if ( xhr )
					return xhr.statusText;
			}

			return undefined;
		},

		getReponseStatusCode: function() {
			var hr = this.httpRequest;
			if ( !hr )
				return null;

			return hr.getStatusCode();
		}
	});





	/**
	 * Helper wrapping requests inside a promise.
	 *
	 * @param {HttpClient} httpClient
	 * @param {object} params
	 * @param {object} options
	 */
	var RequestPromiseWrapper = function(httpClient, params) {
		this.httpClient = httpClient;
		this.params = params;

		this.request = null;

		this._furthers = [];
	};

	RequestPromiseWrapper.prototype.send = function() {
		var p = new Promise(function(resolve, reject) {
			var params = {
				'onSuccess': resolve,
				'onFailure': reject,
				'onAbort': reject,
				'onTimeout': reject,
				'onError': reject
			};

			var file = this.params.file;
			delete this.params.file;
			Object.merge(params, this.params);
			params.file = file;

			this.request = this.httpClient.request(params);
		}.bind(this));

		this._furthers.forEach(function(further) {
			p = p[further[0]].apply(p, further[1]);
		});

		return p;
	};

	RequestPromiseWrapper.prototype.cancel = function() {
		if ( this.request )
			this.request.cancel();
	};

	// Mimic promise behaviour, collect all .then(), .catch() and apply them
	// when .send() is called.

	RequestPromiseWrapper.prototype.then = function() {
		this._furthers.push(['then', Array.prototype.slice.call(arguments)]);
		return this;
	};

	RequestPromiseWrapper.prototype.catch = function() {
		this._furthers.push(['catch', Array.prototype.slice.call(arguments)]);
		return this;
	};





	/**
	 * Managing requests serving a global hook into all requests.
	 * Handle multiple requests by aborting current running requests by default.
	 * Any other behaviour is not implemented yet but can be easily done here.
	 */
	HttpClient = NS.HttpClient = new Class({

		listener: null,
		runningRequest: null,
		initialize: function (listener) {
			this.setListener(listener);

			this.boundCompleteRequest = this.completeRequest.bind(this);
		},

		setListener: function(listener) {
			this.listener = typeof listener === 'object' ? listener : null;
		},

		request: function (options) {
			if (this.runningRequest && options.independent !== true)
				this.runningRequest.cancel();

			var preparedReq = this.prepareRequest(options);
			var req = preparedReq[0];

			if ( this.listener ) {
				if ( options.numbGlobalListener )
					req.addEvents(Object.filter(this.listener, function(value, key) {
						return !options.numbGlobalListener.hasOwnProperty(key);
					}));
				else
					req.addEvents(this.listener);
			}

			req.addEvent('complete', this.boundCompleteRequest);

			if ( options.independent !== true )
				this.runningRequest = req;

			return req.send.apply(req, preparedReq[1]);
		},

		prepareRequest: function(options) {
			if (options.file) {
				var file = options.file.getFile();
				return [
					new HttpRequest(options), [
					file,
					options.file.getPostName()
				]];
			}

			return [new HttpRequest(options)];
		},

		completeRequest: function() {
			this.runningRequest = null;
		}
	});

})(gx.zeyosREST);
