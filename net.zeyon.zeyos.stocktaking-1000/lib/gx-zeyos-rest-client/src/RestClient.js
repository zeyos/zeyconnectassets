(function(NS) {
  var HttpRequest = NS.HttpRequest;

  var RestClient = NS.RestClient = function(options) {
    options = options || {};
    if ( !options.platformsUrl )
      throw new Error('InvalidArgumentException: Missing option.platformsUrl');

    if ( !options.apiUrl )
      throw new Error('InvalidArgumentException: Missing option.apiUrl');

    if ( !options.apiEndpoint )
      throw new Error('InvalidArgumentException: Missing option.apiEndpoint');

    if ( !options.baseWebletUrl ) {
      options.baseWebletUrl = typeof BASE_WEBLET_ROUTE !== 'undefined' ?
        BASE_WEBLET_ROUTE :
        // Assuming we are "in" that very weblet
        window.location.href + '/';
    }

    var url = options.platformsUrl;
    if ( url.lastIndexOf('/') != url.length - 1 ) {
      url += '/';
      options.platformsUrl = url;
    }

    url = options.apiUrl;
    if ( url.lastIndexOf('/') != url.length - 1 ) {
      url += '/';
      options.apiUrl = url;
    }

    url = options.apiEndpoint;
    if ( url.lastIndexOf('/') != url.length - 1 ) {
      url += '/';
    }

    if ( url.charAt(0) !== '/' )
      url = '/' + url;

    options.apiEndpoint = url;

    this.credentials = {};
    this.boundHandleFailure = this.handleFailure.bind(this);
    this.options = options;
    this.api = new gx.zeyosREST.RawClient(options);
  };

  var _pt = RestClient.prototype;

  _pt.getRawClient = function() {
    return this.api;
  };


  _pt.getCredentials = function() {
    return this.credentials;
  };

  _pt.requestWeblet = function (weblet, method, options) {
    options || (options = {});

    var credentials = this.getCredentials();
    options.url = this.createWebletUrl(weblet, credentials);
    options.method = method;
    return this.request(options);
  };

  _pt.requestService = function (service, method, options) {
    options || (options = {});

    var credentials = this.getCredentials();
    options.url = this.createServiceUrl(service, credentials);

    options.method = method;

    return this.request(options);
  };

  /**
   * Do request a task/resource of the zeylib api of a platform.
   * Populating the request with authentification data.
   *
   * options.query property can be explicit url query data which will NOT get
   * transfered in the body in dependence of the method. Whereas the data
   * object will get appended to the url in dependence of that very method.
   *
   * @public
   *
   * @param  {string} resource
   * @param  {string} method The http request method.
   *
   * @param  {object} options {query: {},data: {}|[], headers: {}, json: bool}
   *
   * @return {Promise}
   */
  _pt.requestResource = function (resource, method, options) {
    if ( typeOf(options) !== 'object' )
      options = {json: true};
    else if ( !options.hasOwnProperty('json') )
      options.json = true;

    if ( !options.headers )
      options.headers = {};

    if ( !options.data )
      options.data = {};

    var headers = options.headers;
    var data = options.data;

    method = String(method).toLowerCase();

    // var bodyEmpty = method === 'get';
    // if ( resource !== 'batch' && bodyEmpty && !headers['X-HTTP-Method-Override'] ) {
    //   // Do not append data to the uri but use method override header
    //   // and send query as JSON in the body.
    //   // Note: This conforms with the ZeyOS REST api. And will be done by
    //   // default cause we get pretty much long urls with the sql over rest
    //   // feature.
    //   headers['X-HTTP-Method-Override'] = method.toUpperCase();
    //   method = 'post';
    //   data = {__query: data};
    // }

    options.method = method;

    var credentials = this.getCredentials();
    options.url = this.createResourceUrl(resource, credentials);

    if ( typeof options.query === 'object' )
      options.url += '?'+Object.toQueryString(options.query);

    return this.request(this.applyAuthData(credentials, options));
  };


  /**
   * Do request.
   *
   * @param  {string} requestType Http method.
   * @param  {string} task
   * @param  {object} data
   * @param  {array} file
   * @param  {object} headers
   *
   * @return {Promise}
   */
  _pt.request = function(options) {
    var request = this.api.request(options);

    if ( options.independent === true ) {
      // TODO - bind this.handleFailure to onFailure event
      return request;
    }

    return request.catch (this.boundHandleFailure);
  };

  /**
   * If we got real error log it and throw again to prevent swallowed error
   * in a promise chain.
   * If we receive 401 unauthorized unset current credentials.
   * All other things will be returned to the next possible .then().
   *
   * @private
   */
  _pt.handleFailure = function(err) {
    if ( err instanceof Error ) {
      console.error(err.stack);
      throw err;
    }

    if ( err instanceof HttpRequest.Failure &&
        err.httpRequest.getStatusCode() === 401 )
      this.unsetCredentials();

    return err;
  };

  _pt.unsetCredentials = function() {
    this.credentials = null;
  };

  /**
   * Set credentials which will be used for authorization against the
   * zeylib api {@see this.auth}
   *
   * @param {object} credentials
   * @param {string} authToken   The authentication token which will be
   * returned from the zeylib api from the /auth resource. It is fine to
   * omit this parameter if you have not authToken yet.
   */
  _pt.setCredentials = function(credentials, authToken) {
    var platform = '' + credentials.platform;
    var platformUrl = credentials.platformUrl;

    if ( platformUrl ) {
      if ( platformUrl.lastIndexOf('/') == platformUrl.length - 1 ) {
        platformUrl = platformUrl.substr(0, platformUrl.length - 1);
      }

      credentials.apiDestination = platformUrl + this.options.apiEndpoint;
      credentials.platformDestination = platformUrl + '/';
    } else {
      credentials.apiDestination = this.options.apiUrl + platform +
          this.options.apiEndpoint;

      credentials.platformDestination = this.options.platformsUrl + platform + '/';
    }

    // credentials.apiDestination = 'https://cloud.zeyos.com/intern-sebastian/api.php/remotecall/net.zeyon.common-apis-1000.api/';

    credentials.authToken = authToken;

    this.credentials = credentials;
  };

  _pt.createServiceUrl = function (service, credentials) {
    credentials = credentials || this.credentials;
    return credentials.platformDestination + 'remotecall/' + service;
  };

  _pt.createWebletUrl = function (webletRoute, credentials) {
    credentials = credentials || this.credentials;
    if ( this.options.webletExposedTo )
      return this.options.webletExposedTo + webletRoute;

    return this.options.baseWebletUrl + webletRoute;
  };

  /**
   * Create appropriate resource url for the given task and credentials.
   *
   * @private
   *
   * @param  {string} task
   * @param  {object} credentials
   * @return {[type]}
   */
  _pt.createResourceUrl = function (resource, credentials) {
    credentials = credentials || this.credentials;

    resource = String(resource);
    if (resource.charAt(0) === '/')
      resource = resource.substr(1);

    return credentials.apiDestination + resource;
  };

  _pt.createPlatformUrl = function(task, credentials) {
    credentials = credentials || this.credentials;

    task = String(task);
    if (task.charAt(0) === '/')
      task = task.substr(1);

    return credentials.platformDestination + task;
  };

  _pt.createBinfileUrl = function(/*File | URL*/mixedUrl, credentials, /*default: attachment*/disposition) {
    if ( disposition === undefined )
      disposition = 'attachment';

    if ( typeof mixedUrl === 'object' ) {
      var f = mixedUrl.getId;
      if ( typeof f === 'function' )
        mixedUrl = f.call(mixedUrl);
    }

    credentials = credentials || this.credentials;
    return this.createTaskUrl('files/' + mixedUrl + '/download') + '?__token=' + this.createAuthToken() + '&cache=86400&disposition=' + disposition;
  };

  _pt.createContactPictureUrl = function(contactId) {
    if ( typeof contactId === 'object' ) {
      var f = contactId.getId;
      if ( typeof f === 'function' )
        contactId = f.call(contactId);
    }

    return this.createTaskUrl('contacts/' + contactId + '/picture') + '?__token=' + this.createAuthToken() + '&cache=86400';
  };

  /**
   * Populate the given data with authentication data from the
   * credentials.
   * Returns array with the maybe changed data object and
   * additional header.
   *
   * @private
   *
   * @param  {object} credentials
   * @param  {object} options
   * @return {object}
   */
  _pt.applyAuthData = function(credentials, options) {
    credentials = credentials || this.credentials;

    if ( !options.headers )
      options.headers = {};

    if ( credentials.authToken ) {
      // data.__token = credentials.identifier + ':' +
      //  credentials.authToken;
      options.headers['Zeyos-Api-Token'] = this.createAuthToken(credentials);
    } else {
      // We do not want to this because this will always success but never
      // give us an authToken to work with.
      //
      // If we have no token we should try to get one by doing a batch request
      // with /auth resource
      //
      options.headers['Zeyos-Api-User'] = credentials.user;
      options.headers['Zeyos-Api-Password'] = credentials.password;
    }

    return options;
  };

  _pt.createAuthToken = function(credentials) {
    credentials = credentials || this.credentials;

    return credentials.identifier + ':' + credentials.authToken;
  };

  _pt.preUploadFileRequest = function(name, file, options, url) {
    if ( !options.parseResponse ) {
      options.parseResponse = function(text, xml, httpRequest) {
        var json = JSON.parse(text);

        if ( typeof json !== 'object' )
          throw new Error('Response is not of type object');

        if ( !json.name || !json.tempfile )
          throw new Error('Response neither contains "result" nor "error" key.');

        return json;
      };
    }

    return this.request(
      'POST',
      // 'http://efesus.de/upload.php',
      url || this.createPlatformUrl('upload'),
      {},
      new RequestFile(file, name),
      {},
      options
    );
  };





  /**
   * Wrapping a file which is supposed to be send by http request.
   * Connecting the file object and the file post name for the request.
   *
   * @param {[type]} file
   * @param {[type]} filePostName
   */
  var RequestFile = NS.RequestFile = function(file, filePostName) {
    this.file = file;
    this.filePostName = filePostName;
  };

  RequestFile.prototype.getPostName = function() {
    return this.filePostName;
  };

  RequestFile.prototype.getFile = function() {
    return this.file;
  };

})(gx.zeyosREST);
