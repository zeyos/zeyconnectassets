(function(ns) {

  /**
   * Abstracting on top of the RestClient, giving sugar Model Querying
   * cababilities and optional auto authentication handling with the
   * AuthenticationModel.
   *
   * @param {object} options
   */
  var RestModel = function(options) {
    this.client = new ns.RestClient(options);

    this.requestResource = this.client.requestResource.bind(this.client);
    this.requestService = this.client.requestService.bind(this.client);
    this.requestWeblet = this.client.requestWeblet.bind(this.client);
  };

  /*
   * Shortcut
   */
  var RestModel_prototype = RestModel.prototype;

  RestModel_prototype.getClient = function() {
    return this.client;
  };

  RestModel_prototype.bindRequestListener = function(listener) {
    this.getClient().getRawClient().setListener(listener);
  };

  /**
   * Configuring this RESTmodel to automatically try to authenticate requests
   * with the given AuthenticationModel.
   *
   * NOTE: This is not supported for all requests. But for all requests running
   * through Query modeling.
   *
   */
  RestModel_prototype.setAutoAuthentication = function(/*AuthenticationModel*/ authModel) {
    this.authModel = authModel;
    this.client.setCredentials(authModel.getCredentials());
  };

  /**
   * @private
   * {@see this.auth()}
   */
  RestModel_prototype._authQuery = function(credentials) {
    return this.createQuery('auth', 'post')
      .query({'object': 1})
      .data(credentials);
  };

  /**
   * Execute a Query.
   *
   * @param  {RestModelQuery|BatchQuery} modelQuery
   * @return {Promise}
   */
  RestModel_prototype.runQuery = function(modelQuery, requestOptions) {
    var resource = modelQuery.createResource();
    var resourceMethod = modelQuery.getResourceMethod();

    // automatic authentication with AuthenticationModel is active and
    // this query is no batch query or the batch query is not populated with
    // the authentication task.
    if ( false && this.authModel && (!(modelQuery instanceof BatchQuery) || modelQuery.getResultIndex('__getAuthToken') === undefined ) ) {
      var authModel = this.authModel;
      var client = this.client;
      var authToken = client.getCredentials().authToken;
      if ( !authToken ) {
        // Authenticate by getting an authToken.
        var batch;

        var credentials = authModel.getCredentials();
        client.setCredentials(credentials);
        // We need to populate the request authentication in the header
        // to actually execute the batch request otherwise we would receive
        // unuthorized with valid credentials either, cause POST /batch is
        // no open resource
        var headers = {
          'Zeyos-Api-User': credentials.user,
          'Zeyos-Api-Password': credentials.password
        };

        if ( requestOptions && requestOptions.headers )
          Object.merge(header, requestOptions.headers);

        if ( modelQuery instanceof BatchQuery ) {
          batch = modelQuery.prependQuery('__getAuthToken', this._authQuery(credentials));
        } else {
          batch = this.createBatch()
            .addQuery('__getAuthToken', this._authQuery(credentials))
            .addQuery('__originalRequest', modelQuery);
        }

        return batch.run(Object.merge({headers: headers}, requestOptions))
            .then(function(batch) {
              // On success save the authentication token
              var res = batch.getResult('__getAuthToken');
              if ( res && res.result ) {
                client.setCredentials(credentials, res.result.token);
              }

              if ( modelQuery instanceof BatchQuery )
                return batch.getRawResult();

              return batch.getResult('__originalRequest');
          });

    // var credentials = this.getCredentials();
    // if ( false && this.authModel && credentials && !credentials.authToken ) {
    //   // Authenticate by getting an authToken.
    //   if ( resource === 'batch' ) {

    //   } else {
    //     var _this = this;

    //     return batch.do({header: {
    //         'Zeyos-Api-User': credentials.user,
    //         'Zeyos-Api-Password': credentials.password,
    //       }})
    //       .then(function(batch) {
    //         _this.handleAuthResult(credentials, batch.getResult('__getAuthToken'));

    //         // _pt.handleAuthResult = function(credentials, res) {
    //         //   if ( res && res.result ) {
    //         //     this.setCredentials(credentials, res.result.token);
    //         //   } else {
    //         //     this.credentials = null;
    //         //   }

    //         //   return res;
    //         // };

    //         return batch.getResult('__originalRequest');
    //       });
    //   }
    // }

      }
    }

    var options = {
      header: {},
      data: modelQuery.createBody(),
      query: modelQuery.createQuery()
    };

    if ( requestOptions )
      Object.merge(options, requestOptions);

    return this.requestResource(
      resource,
      resourceMethod,
      options
    );
  };


  /**
   * Authenticate the given credentials with an auth request. On success
   * save the returned token + credentials for further requests with
   * this token.
   *
   * @param  {string} user
   * @param  {string} password
   * @param  {string} platform
   * @param  {string} identifier
   *
   * @return {Promise}
   */
  RestModel_prototype.auth = function(user, password, platform, identifier) {
    var credentials = {
      user: user,
      password: password,
      platform: platform,
      identifier: identifier
    };
    this.client.setCredentials(credentials);
    return this._authQuery(credentials)
      .run()
      .then(function(res) {
        return this.handleAuthResult(credentials, res);
      }.bind(this));
  };



  /**
   * Retrieving the current authenticated user if one exits for the given
   * credentials.
   */
  RestModel_prototype.getAuth = function() {
    return this.requestResource('auth', 'get');
  };

  /**
   * Delete the current authenticated credentials.
   *
   */
  RestModel_prototype.deleteAuth = function() {
    return this.requestResource('auth', 'delete');
  };

  /**
   * Return the numformat for entities.
   *
   * @param  {string} column
   * @param  {object} options
   * @return {Promise}
   */
  RestModel_prototype.getNumformat = function(column, options) {
    options = options || {};
    if ( options.independent === undefined )
      options.independent = true;

    return this.requestResource('numformat/' + column, 'get', options);
  };

  /*
   * All the following functions returns a minimal setup query you can modify
   * and run.
   *
   * All functions which and with xxxQuery will return a prepared query. You
   * have to call run() on these to execute.
   */

  /**
   * Create a RestModelQuery with this RestModel.
   *
   * @param  {string} resource
   * @param  {string} resourceMethod
   * @return {RestModelQuery}
   */
  RestModel_prototype.createQuery = function(resource, resourceMethod) {
    return new RestModelQuery(this, resource, resourceMethod);
  };

  /**
   * Create a BatchQuery with this RestModel.
   * @param  {string} resource
   * @param  {string} resourceMethod
   * @return {BatchQuery}
   *
   */
  RestModel_prototype.createBatch = function() {
    return new BatchQuery(this);
  };

  /**
   * Doing a global search over all entities. This result reflects the zeyos global
   * search.
   *
   * NOTE: the zeyos REST entity "search" does not allow body params.
   * You have to set params:
   *   e=[contacts, ...]
   *   n=5
   *   q=mySearchText
   *
   * as explicit url query parameters with Query.query({n:5})!
   * Query.limit(5) wont work in this case.
   *
   *
   * @param {array} entities Restrict search to these entities (contacts|accounts|etc...)
   * @return {Query}
   */
  RestModel_prototype.searchGlobalQuery = function (searchValue, entities, limit) {
    var params = {q: searchValue};

    if ( entities )
      params.e = typeof entities === 'string' ? [entities] : entities;

    if ( limit === undefined )
      limit = 5;

    params.n = limit;

    return new RestModelQuery(this, 'search', 'get').query(params);
  };

  /**
   * Advanced search of a specific entity.
   * Item is searched with SQL like comparison against various fields defined
   * by the API and not editable from this side
   *
   * @param  {string} entity
   * @param  {string} searchValue
   * @return {Query}
   */
  RestModel_prototype.searchEntityQuery = function(entity, searchValue) {
    // return this.listQuery('search/' + entity).query({q:searchValue});
    return this.listQuery(entity).search(searchValue);
  };

  /**
   * Retrieve a list.
   *
   * @param  {string} entity
   * @return {Query}
   */
  RestModel_prototype.listQuery = function(entity) {
    return new RestModelQuery(this, entity, 'get');
  };

  /**
   * Retrieve a list.
   *
   * @param  {string} entity
   * @return {Query}
   */
  RestModel_prototype.deleteListQuery = function(entity) {
    return new RestModelQuery(this, entity, 'delete');
  };

  /**
   * Return the count of a query.
   *
   * @param  {string} entity
   * @return {Query}
   */
  RestModel_prototype.countListQuery = function(entity) {
    return new RestModelQuery(this, entity, 'get').queryType('c');
  };

  /**
   * Retrieve one item of an entity
   *
   * @param  {string} entity
   * @param  {string} id
   * @return {Query}
   */
  RestModel_prototype.itemQuery = function(entity, id, method) {
    return new RestModelQuery(this, entity + '/' + id, method || 'get');
  };

  /**
   * Delete an entity item.
   *
   * @param  {string} entity
   * @param  {string} id
   * @return {Query}
   */
  RestModel_prototype.deleteItemQuery = function(entity, id) {
    return new RestModelQuery(this, entity + '/' + id, 'delete');
  };

  /**
   * Update multiple entity items.
   *
   * NOTE: The where params is mandatory and will be transfered over the
   * url query to separate the actual data to update in the body.
   *
   * @param  {string} entity
   * @param  {array|Query} arrWhere Mandatory conditions, which items to update.
   * @param  {object} fieldsData Fieldnames and values to apply to the selected items.
   *
   * @return {Query}
   */
  RestModel_prototype.persistItemsQuery = function(entity, arrWhere, fieldsData) {
    var query = new RestModelQuery(this, entity, 'post');

    if ( arrWhere instanceof Query ) {
      query.query(arrWhere._createParams());
    } else {
      query.query(arrWhere);
    }

    return query.data(fieldsData);
  };

  RestModel_prototype.persistItemQuery = function(entity, id, fieldsData) {
    return new RestModelQuery(this, entity + '/' + (id ? id : ''), id ? 'post' : 'put')
      .data(fieldsData);
  };

  RestModel_prototype.persistRecordLikeState = function(record, state) {
    var query = new Query(this, 'records/' + record.getId() + '/likes');
    if ( state )
      return query.put();

    return query.delete();
  };

  RestModel_prototype.persistRecordFollowState = function(record, state) {
    var query = new Query(this, 'records/' + record.getId() + '/follows');
    if ( state )
      return query.post();

    return query.delete();
  };

  RestModel_prototype.batch = function() {
    return new Batch(this);
  };

  RestModel_prototype.mindlog = function() {
    return this.request('get', 'extensions/zeyos-mobile/1_0'/*, data, files, header*/);
  };





  /**
   * Propel like querying syntax sugar helper.
   *
   * You most probably dont want to instantiate it but use {@see RestModel}
   * queryXXX methods.
   *
   */
  var Query = function(resource, resourceMethod) {
    this.resource = resource;
    this.j = [];
    this.w = [];
    this.o = [];
    this.s = [];
    this.g = [];
    this.m = null;
    this.i = null;
    this.q = null;
    this.n = null;
    this.d = null;
    this.x = false;
    this.bodyData = null;
    this.resourceMethodType = typeof resourceMethod !== undefined ? resourceMethod : 'get';
    this.preventMonitorEntryState = false;

    this.commentsCount = null;
    this.likesCount = null;
    this.queryObj = null;
  };

  /**
   * Shortcut.
   */
  var Query_prototype = Query.prototype;

  ns.QUERY_EQUAL = '=';
  ns.QUERY_NOT_EQUAL = '!=';
  ns.QUERY_LIKE = 'LIKE';
  ns.QUERY_NOT_LIKE = 'NOT_LIKE';
  ns.QUERY_ILIKE = 'ILIKE';
  ns.QUERY_NOT_ILIKE = 'NOT_ILIKE';
  ns.QUERY_LESS_THAN = 'lt';
  ns.QUERY_LESS_EQUAL = 'le';
  ns.QUERY_GREATER_THAN = 'gt';
  ns.QUERY_GREATER_EQUAL = 'ge';
  ns.QUERY_IS_NULL = 'n';
  ns.QUERY_NOT_NULL = 'nn';
  ns.QUERY_IN = 'in';

  ns.QUERY_TYPE_COUNT = 'c';
  ns.QUERY_TYPE_SQL = 's';

  ns.RESULT_TYPE_INDEXED = 'indexed';

  Query_prototype.clone = function() {
    var c = new Query(this.resource, this.resourceMethodType);
    c.j = Array.clone(this.j);
    c.w = Array.clone(this.w);
    c.o = Array.clone(this.o);
    c.s = Array.clone(this.s);
    c.g = Array.clone(this.g);
    c.m = this.m;
    c.i = this.i;
    c.q = this.q;
    c.n = this.n;
    c.d = this.d;
    c.x = this.x;
    c.preventMonitorEntryState = this.preventMonitorEntryState;
    c.commentsCount = this.commentsCount;
    c.likesCount = this.likesCount;
    c.queryObj = Object.clone(this.queryObj);
    c.bodyData = Object.clone(this.bodyData);
    return c;
  };

  Query_prototype.resourceMethod = function(m) {
    this.resourceMethodType = m;
    return this;
  };

  Query_prototype.resultType = function(type) {
    this.x = type === 'indexed';
    return this;
  };

  Query_prototype.indexedResult = function() {
    return this.resultType('indexed');
  };

  Query_prototype.preventMonitorEntry = function(to) {
    this.preventMonitorEntryState = typeof to === 'undefined' ? to : true;
    return this;
  };

  /**
   * Explicity set query parameter. Url Query paramter. Not to confuse with
   * this Model Query.
   */
  Query_prototype.query = function(obj) {
    this.queryObj = obj ? obj : {};
    return this;
  };

  Query_prototype.countComments = function() {
    this.commentsCount = true;
    return this;
  };

  Query_prototype.countLikes = function() {
    this.likesCount = true;
    return this;
  };

  Query_prototype.getColumns = function() {
    return this.s;
  };

  Query_prototype.columns = function(columns, reset) {
    if ( columns === null ) {
      this.s = [];
      return this;
    }

    if ( reset === true ) {
      this.s = [];
    }

    for (var i = 0, l = columns.length; i < l; i++) {
      this.s.push(columns[i]);
    }

    return this;
  };

  Query_prototype.join = function(column, table, type, alias) {
    var params = [];

    if ( column )
      params.push(column);

    if ( table )
      params.push(table);

    if ( type )
      params.push(type);

    if ( alias )
      params.push(alias);

    this.j.push(params);
    return this;
  };

  Query_prototype.resetJoins = function() {
    this.j = [];
    return this;
  };

  Query_prototype.arrWhere = function(arrWhere) {
    for ( var i = 0, l = arrWhere.length; i < l; i++ )
      this.where.apply(this, arrWhere[i]);

    return this;
  };

  Query_prototype.where = function(column, value, condition, isIdentifier) {
    if ( column instanceof Query ) {
      this.arrWhere(column.w);
      return this;
    }

    this.w.push(JSON.stringify(Array.prototype.slice.call(arguments)));
    return this;
  };

  Query_prototype.whereStartLevel = function(type) {
    this.w.push(type);
    return this;
  };

  Query_prototype.whereEndLevel = function(type) {
    this.w.push(type === 'all' ? 'ea' : 'el');
    return this;
  };

  Query_prototype.search = function(value) {
    this.m = value;
    return this;
  };

  Query_prototype.setCount = function() {
    this.query('c');
    return this;
  };

  Query_prototype.orderBy = function(column, type) {
    if ( column === null ) {
      this.o = [];
      return this;
    }

    if ( type === undefined || type === 'desc' || type === '-' )
      type = '-';
    else
      type = '+';

    this.o.push(column + type);
    return this;
  };

  Query_prototype.groupBy = function(column, type) {
    if ( column === null ) {
      this.g = [];
      return this;
    }

    this.g.push(column);
    return this;
  };

  Query_prototype.offset = function(offset) {
    this.i = offset;
    return this;
  };

  Query_prototype.distinct = function(d) {
    this.d = d;
    return this;
  };

  Query_prototype.limit = function(limit) {
    this.n = limit;
    return this;
  };

  Query_prototype.data = function(objBodyData) {
    this.bodyData = objBodyData;
    return this;
  };

  Query_prototype.queryType = function(type) {
    this.q = type;
    return this;
  };

  /**
   * Allowed special names:
   *   __all: equals to no category filter
   *   __has: return all items which has any category/tag
   *   __none: return all items which has no category/tag assigned
   *
   * @param  {[type]} categoryName
   * @return {[type]}
   */
  Query_prototype.filterByCategory = function(table, categoryName) {
    if ( categoryName === '__all' )
      return this;

    // ATTENTION: The names (categoryTag.name) and order of fields here are hard dependencies
    // for the zeylib extension: mobile-zeyos-records. Change not or both.

    if ( categoryName === '__has' ) {
      this.distinct(1);
      this.join('tags', table, 'INNER', 'categoryTag');
      this.join('tag', 'categories', 'INNER', {'tags': 'categoryTag', 'categories': 'isCategoryTag'});
      this.where('categoryTag.name', 'isCategoryTag.name', '=', true);
      return this;
    }

    if ( categoryName === '__none' ) {
      this.join('tags', table, 'LEFT', 'categoryTag');
      this.where('categoryTag.name', null, 'n');
      return this;
    }

    this.join('tags', table, 'LEFT', 'categoryTag');
    this.where('categoryTag.name', categoryName);
    return this;
  };

  /**
   * These has to be in the urlQuery, even with X-HTTP-Override-Method.
   *
   */
  Query_prototype.createEnforcedQueryParams = function() {
    var query = {};

    if ( this.x )
      query.x = true;

    if ( this.preventMonitorEntryState )
      query.monitor = 0;

    if ( typeOf(this.queryObj) == 'object' )
      query = this.queryObj;

    return query;
  };

  Query_prototype.createQueryParams = function() {
    var params = {};

    if ( this.j.length > 0 )
      params.j = this.j;

    if ( this.s.length !== 0 )
      params.s = this.s;
    else
      params.s = [];

    if ( this.w.length > 0 )
      params.w = this.w;

    if ( this.o.length > 0 )
      params.o = this.o;

    if ( this.g.length > 0 )
      params.g = this.g;

    if ( this.m !== null )
      params.m = this.m;

    if ( this.n !== null )
      params.n = this.n;

    if ( this.i !== null )
      params.i = this.i;

    if ( this.q !== null )
      params.q = this.q;

    if ( this.d !== null )
      params.d = 1;

    if ( this.commentsCount !== null )
      params.comments = 'count';

    if ( this.likesCount !== null )
      params.likes = 'count';

    return params;
  };

  Query_prototype.createQuery = function() {
    return Object.merge(this.createEnforcedQueryParams(), this.createQueryParams());
  };

  Query_prototype.createBody = function() {
    return this.bodyData;
  };

  Query_prototype.createResource = function() {
    return this.resource;
  };

  Query_prototype.getResourceMethod = function() {
    return this.resourceMethodType;
  };





  /**
   * A Query wrapper to comfortable run queries with the RestModel class and
   * authentication mechanics.
   *
   * {@see RestModel.createQuery()}
   *
   * @param {RestModel} restModel
   * @param {string} resource {@see Query() constructor}
   * @param {string} resourceMethod {@see Query() constructor}
   */
  var RestModelQuery = function(restModel, resource, resourceMethod) {
    this.restModel = restModel;

    // Call parent
    Query.apply(this, Array.prototype.slice.call(arguments, 1));
  };

  /**
   * Inherit Query.
   */
  RestModelQuery.prototype = new Query();
  RestModelQuery.prototype.constructor = RestModelQuery;

  /**
   * Shortcut.
   */
  var RestModelQuery_prototype = RestModelQuery.prototype;

  RestModelQuery_prototype.run = function() {
    return this.restModel.runQuery(this);
  };






  /**
   * Helper doing batch requests against the zeyos REST api.
   *
   * This helper is abstracting the indexed results order of the various tasks
   * inside one batch request by applying an identifier for each task which
   * allows you to select the appropriate result afterwards.
   *
   * You most probably dont want to instantiate it yourself but use
   * {@see RestModel.batch} method.
   *
   * TODO Decouple BatchQuery from RestModel by creating a wrapper RestModelBatch
   * similar to: RestModelQuery.
   *
   * @param {RestModel} restModel
   */
  var BatchQuery = function(restModel) {
    this.restModel = restModel;
    this.batches = [];

    this.resultsIdentifier = {};
    this.resultType = 'all';
    this.rawResult = null;
    this.resultTypeAdded = false;
  };

  /**
   * Shortcut.
   */
  var BatchQuery_prototype = BatchQuery.prototype;

  /**
   * Add resource task to this batch request.
   *
   * @param {string} identifier The task identifier {@see this.getResult()}.
   * @param {string} resource
   * @param {string} resourceMethod
   * @param {object} urlQuery Url query
   * @param {object} data
   * @param {boolean} prepend Whether or not to prepend the query in the execution order.
   */
  BatchQuery_prototype.add = function(identifier, resource, resourceMethod, urlQuery, data, prepend) {
    var batch = {
      path: resource,
      verb: resourceMethod,
      query: urlQuery || '',
      body: data || ''
    };

    if ( prepend === true ) {
      this.batches.unshift(batch);
      var resultsIdentifier = this.resultsIdentifier;
      for ( var i in resultsIdentifier ) {
        if ( !resultsIdentifier.hasOwnProperty(i) )
          continue;

        resultsIdentifier[i] += 1;
      }

      resultsIdentifier[identifier] = 0;

    } else {
      this.resultsIdentifier[identifier] = this.batches.push(batch) - 1;
    }

    return this;
  };

  BatchQuery_prototype.addQuery = function(identifier, query) {
    return this.add(
      identifier,
      query.createResource(),
      query.getResourceMethod(),
      query.createQuery(),
      query.createBody()
    );
  };

  BatchQuery_prototype.prependQuery = function(identifier, query) {
    return this.add(
      identifier,
      query.createResource(),
      query.getResourceMethod(),
      query.createQuery(),
      query.createBody(),
      true
    );
  };

  BatchQuery_prototype.returnType = function(type) {
    this.resultType = type;
    return this;
  };

  BatchQuery_prototype.getResult = function(identifier) {
    if ( identifier === undefined || !this.rawResult )
      return this.rawResult;

    return this.rawResult.result[this.getResultIndex(identifier)];
  };

  BatchQuery_prototype.getRawResult = function() {
    return this.rawResult;
  };

  BatchQuery_prototype.getResultIndex = function(identifier) {
    return this.resultsIdentifier[identifier];
  };

  BatchQuery_prototype.getData = function() {
    return this.batches;
  };

  BatchQuery_prototype.createQuery = function() {
    return {};
  };

  BatchQuery_prototype.createBody = function() {
    var body = this.batches;

    if ( this.resultTypeAdded !== true && this.resultType )
      body.push(this.resultType);

    return body;
  };

  BatchQuery_prototype.createResource = function() {
    return 'batch';
  };

  BatchQuery_prototype.getResourceMethod = function() {
    return 'post';
  };

  BatchQuery_prototype.run = function(requestOptions) {
    var _this = this;
    return this.restModel.runQuery(this, requestOptions)
      .then(function(result) {
        _this.rawResult = result;
        return _this;
      });
  };

  ns.Query = Query;
  ns.RestModel = RestModel;
  ns.BatchTask = BatchQuery;

})(gx.zeyosREST);
