(function(NS) {

var Factory = NS.Factory;
var HttpRequest = NS.HttpRequest;


var logOnErrorAndRethrow = NS.logOnErrorAndRethrow;


var CollectionEvent = NS.CollectionUpdateEvent = new Class({
  Implements: NS.BaseEvent,

  item: null,
  oldItem: null,
  index: null,
  initialize: function(instance, item, oldItem) {
    this.instance = instance;
    this.item = item;
    this.oldItem = oldItem;
  },

  getItem: function() {
    return this.item;
  },

  getOldItem: function() {
    return this.oldItem;
  },

  setItemIndex: function(index) {
    this.index = index;
    return this;
  },

  getItemIndex: function() {
    return this.index;
  }
});


var CollectionFilter = NS.CollectionFilter = new Class({
  filter: [],
  sortFields: [],
  groupingField: undefined,
  searchText: undefined,
  queryHandler: {},
  queryHandlerCount: 0,

  initialize: function(fields) {
    if ( fields )
      this.addFields(fields);
  },

  addQueryHandler: function(i, handler, bind) {
    this.queryHandler[i] = {
      handler: handler,
      bind: bind ? bind : this
    };

    this.queryHandlerCount++;
  },

  removeQueryHandler: function(i) {
    delete this.queryHandler[i];
    this.queryHandlerCount--;
  },

  applyQueryHandler: function(query) {
    if ( this.queryHandlerCount <= 0 )
      return;

    var handler;
    for ( var i in this.queryHandler ) {
      handler = this.queryHandler[i];
      handler.handler.call(handler.bind, query, this);
    }
  },

  addFields: function(fields) {
    if ( typeOf(fields) === 'object' ) {
      for ( var fieldName in fields ) {
        if ( !fields.hasOwnProperty(fieldName) )
          continue;

        this.addField(fieldName, fields[fieldName]);

      }
      return;
    }

    for ( var field, i = 0, l = fields.length; i < l; i++ ) {
      field = fields[i];
      this.addField(field[0], field[1], field[2]);
    }

  },

  /**
   * Corresponds to the zeylib.api.Query.where parameters.
   * For supported comparisons {@see this.compare}.
   *
   * @param {string} fieldName
   * @param {mixed} value
   * @param {string} comparison
   */
  addField: function(fieldName, value, comparison) {
    var field = this.getField(fieldName);
    if ( field ) {
      field.value = value;
      field.comparison = comparison ? comparison : '=';
      return;
    }

    this.filter.push({
      field: fieldName,
      value: value,
      comparison: comparison ? comparison : '='
    });
  },

  getField: function(fieldName) {
    var filter;
    for ( var i = 0, l = this.filter.length; i < l; i++ ) {
      filter = this.filter[i];
      if ( filter.field === fieldName ) {
        return filter;
      }
    }
  },

  removeField: function(fieldName) {
    for ( var i = 0, l = this.filter.length; i < l; i++ ) {
      if ( this.filter[i].field === fieldName ) {
        this.filter.splice(i, 1);
        return;
      }
    }

  },

  setGroupingField: function(fieldName) {
    this.groupingField = fieldName;
  },

  getGroupingField: function() {
    return this.groupingField;
  },

  setSortFields: function(fields) {
    var field, type, sortBy = [];
    for ( var i = 0, l = fields.length; i < l; i++ ) {
      field = fields[i];
      type = 'asc';

      if ( typeof field !== 'string' ) {
        if ( field[1] )
          type = field[1];

        field = field[0];
      }

      sortBy.push({
        field: field,
        type: type
      });
    }

    this.sortFields = sortBy;
  },

  getSortFields: function() {
    return this.sortFields.length > 0 ? this.sortFields : null;
  },

  setSearchText: function(text) {
    this.searchText = text ? text : undefined;
  },

  setCategory: function(categoryId) {
    this.categoryId = categoryId && categoryId != '__all' ? categoryId : null;
  },

  getCategory: function() {
    return this.categoryId;
  },

  getSearchText: function() {
    return this.searchText;
  },

  setAssignedUserId: function(assignedUserId) {
    this.assignedUserId = assignedUserId;
  },

  getAssignedUserId: function() {
    return this.assignedUserId;
  },

  forEach: function(callback) {
    var filter;
    for ( var i = 0, l = this.filter.length; i < l; i++ ) {
      filter = this.filter[i];
      callback(filter.field, filter.value, filter.comparison);
    }

  },

  toKey: function() {
    var res = '', filter;
    for ( var i = 0, l = this.filter.length; i < l; i++ ) {
      filter = this.filter[i];
      res += filter.field + filter.comparison + this.valueToString(filter.value);
    }

    return res;
  },

  valueToString: function(value) {
    switch (typeOf(value)) {
      case 'array':
        var r = '';
        value.each(function(v, i) {r += v;});
        return r;

      case 'object': return Object.toQueryString(value);
      default: return '' + value;
    }
  },

  match: function(model) {
    var filter, field;
    for ( var i = 0, l = this.filter.length; i < l; i++ ) {
      filter = this.filter[i];
      field = model.getField(filter.field);
      if ( field !== undefined && !this.compare(field.getParsedValue(), filter.value, filter.comparison) )
        return false;
    }

    return true;
  },

  compare: function(v1, v2, c) {
    switch(c) {
      case '=': return v1 == v2;
      case '!=': return v1 != v2;
      case 'gt': return v1 > v2;
      case 'ge': return v1 >= v2;
      case 'lt': return v1 < v2;
      case 'le': return v1 <= v2;
      case 'in': return (typeOf(v2) === 'array' ? v2 : [v2]).contains(v1);
      case 'LIKE': return (''+v2).indexOf((''+v1).replace('%', '')) !== -1;
      case 'ILIKE': return (''+v2).toLowerCase().indexOf((''+v1).replace('%', '').toLowerCase()) !== -1;
      case 'b':
        if ( typeOf(v2) !== 'array' )
          throw new Error('Invalid ');

        return v1 >= v2[0] && v1 <= v2[1];
    }
  }
});





/**
 * Collection to handle list of entity models.
 */
var BaseCollection = NS.BaseCollection = new Class({
  Implements: [Events, Options],

  Binds: [
    'handleListResult',
    'processListResult'
  ],

  options: {
    limit: 30,
    filter: null,
    batchItemsResultName: 'items',
    batchCountResultName: 'itemsCount',
    requestOptions: {},
    batchInjection: null,

    plainModelType: 'indexed',

    // TODO auto relation resolution
    batchRelationItemsResultName: 'relationItems',
    relationModelName: '',
    relationIdColumnName: '',

    // null - no joins
    // ['join1', 'join2'] - join these
    managedJoins: null,
    joins: null,
    distinct: null,

    selectFields: null,
  },

  loaded: false,

  offset: 0,
  lastItemCount: 0,
  canLoadMore: true,
  query: null,
  schema: null,
  filter: null,
  items: null, // Indicating that this collection has never loaded items over network
  byId: {},

  totalCount: null,

  currentRequest: null,

  initialize: function(schema, options) {
    this.schema = schema;
    this.setOptions(options);
  },

  getSchema: function() {
    return this.schema;
  },

  buildBatchItemsResultName: function() {
    return this.options.batchItemsResultName + '_' + this.schema.getModelName();
  },

  buildBatchCountResultName: function() {
    return this.options.batchCountResultName + '_' + this.schema.getModelName();
  },

  getFilter: function() {
    return this.options.filter;
  },

  setFilter: function(filter) {
    this.options.filter = filter;
  },

  addSelectColumns: function(newFields) {
    if ( !this.options.selectFields )
      this.options.selectFields = [];

    var selectFields = this.options.selectFields;
    for ( var f, i = 0, l = newFields.length; i < l; i++ ) {
      f = newFields[i];
      if ( !selectFields.contains(f) )
        selectFields.push(f);
    }

  },

  instantiateModels: function(items, fields) {
    var instModelFunc = this.options.plainModelType === 'indexed' ?
      'setListFields' :
      'setFieldsObject';

    var models, model, exists;
    if ( !this.items ) {
      models = this.items = [];
      this.byId = {};
    } else
      models = this.items;

    for ( var i = 0, l = items.length; i < l; i++ ) {
      model = this.schema.newInstance(this);
      model[instModelFunc](items[i], fields);

      exists = this.byId[model.getId()];
      if ( exists ) {
        exists.updateByModel(model, fields);
      } else {
        models.push(model);
        this.byId[model.getId()] = model;
      }
    }

    return models;
  },

  setListItems: function(items) {
    this.instantiateModels(items, this.buildSelectColumnsArray());
  },

  reset: function() {
    this.items = null;
    this.loaded = false;
    this.offset = 0;
    this.query = null;
    this.byId = {};

    this.fireEvent('reset', [this]);
  },

  /**
   * Load entities by resetting the current offset.
   *
   * @return {Promise}
   */
  load: function(options) {
    this.offset = 0;
    this.items = null;
    this.byId = {};
    this.canLoadMore = true;
    this.lastItemCount = 0;
    return this.doQuery(options);
  },

  loadAndUnpack: function() {
    var _this = this;
    return this.load()
      .then(function() {
        return _this;
      });
  },

  /**
   * Load more entities by increasing the offset.
   *
   * @return {Promise}
   */
  loadMore: function() {
    if ( !this.query )
      return this.load();

    this.offset += this.options.limit;
    this.lastItemCount = this.items ? this.items.length : 0;

    return this.doQuery();
  },

  /**
   * Return whether or not there are more items to load.
   * @return {boolean}
   */
  getCanLoadMore: function() {
    return this.canLoadMore;
  },

  _calculateCanLoadMore: function(resultLength) {
    if ( resultLength === 0 ) {
      this.canLoadMore = false;
      return;
    }

    var l = this.items.length;
    if ( l % this.options.limit !== 0 )  {
      this.canLoadMore = false;
      return;
    }

    this.canLoadMore = l !== this.lastItemCount;
  },


  /**
   * Update all current items by querying them by der Id with a single
   * query.
   * This is most useful loading a saved session where you may saved the items
   * ids only and not the whole items.
   *
   */
  updateAllItems: function() {
    var ids = [];
    this.forEachItem(function(item) {
      ids.push(item.getId());
    });

    var schema = this.schema;
    var table = this.getSchemaTableName(schema);

    var route = this.buildApiRoute(schema, table);
    var columns = this.buildSelectColumnsArray();

    var query = Factory.getRESTmodel().listQuery(route)
      .indexedResult()
      .columns(columns)
      .where('ID', ids, NS.QUERY_IN);

    var batch = Factory.getRESTmodel()
      .createBatch()
      .addQuery(this.buildBatchItemsResultName(), query);

    return batch
      .run()
      .then(this.handleListResult)
      .catch (logOnErrorAndRethrow);
  },

  /**
   * Querying entities by applying the given filter and the current offset.
   *
   * @param {string} options (Optional) Mixed:
   *   type:string - Advanced search string (using the advanced/intelligent zeylib api search)
   *   type:object - array of possible options
   *
   * @return {Promise}
   */
  doQuery: function(options) {
    var searchTextValue = null;
    if ( typeof options === 'string' ) {
      searchTextValue = options;
      options = {};
    } else {
      options = options || {};
      searchTextValue = options.searchTextValue;
    }

    options.returnRequestObj = true;

    var batchInjection = this.options.batchInjection;
    var query = this.buildQuery(searchTextValue);
    var schema = this.schema;

    var batch = Factory.getRESTmodel()
      .createBatch()
      .addQuery(this.buildBatchItemsResultName(), query);

    var withOneToManyRelation = this.options.relationModelName !== '';
    if ( withOneToManyRelation ) {
      this.extendBatchWithRelation(batch);
    }

    if ( batchInjection ) {
      batchInjection.extendBatch(this, batch, query);
    }

    var currentRequest = this.currentRequest = batch
      .run(Object.merge({}, this.options.requestOptions, options));

    var result = currentRequest.send();

    if ( batchInjection ) {
      result = result.then(batchInjection.handleBatchResult);
    }

    result = result
      .then(this.handleListResult);

    if ( withOneToManyRelation ) {
      result = result.then(this.handleRelationItems.bind(this));
    }

    return result
      .then(this.processListResult)
      .catch (logOnErrorAndRethrow);
  },

  resetQuery: function() {
    this.query = null;
  },

  buildApiRoute: function(schema, schemaModelName, type) {
    return schema.getCustomApiRoute(type ? type : 'list') || schemaModelName;
  },

  getSchemaTableName: function(schema) {
    return schema.getEntityName();
  },

  createBatchWithRelationResultName: function() {
    return this.options.batchRelationItemsResultName;
  },

  extendBatchWithRelation: function(batch) {
    var schema = Factory.getModelSchema(this.options.relationModelName);
    var table = this.getSchemaTableName(schema);
    var route = this.buildApiRoute(schema, table);
    var columns = schema.getListSelectColumns();

    var relationQuery = Factory.getRESTmodel().listQuery(route)
      .indexedResult()
      .columns(columns)
      .where(this.query)
      .where(this.options.relationIdColumnName, '{{/-1/result/*/0}}', Factory.QUERY_IN);

    var selectJoins = schema.getSelectJoins();
    if ( selectJoins )
      NS.modelUtils.addJoinsToQuery(relationQuery, selectJoins);

    batch.addQuery(this.createBatchWithRelationResultName(), relationQuery);
  },

  handleRelationItems: function(batch) {
    var items = batch.getResult(this.createBatchWithRelationResultName()).result;
    var schema = Factory.getModelSchema(this.options.relationModelName);

    var relationName = this.options.relationModelName;

    for ( var i = 0, l = items.length; i < l; i++ ) {
      var model = schema.newInstance();
      model.setListFields(items[i], schema.getListSelectColumns());

      var item = this.getModelById(model.getId());
      item.addOneToManyJoinModelInstance(relationName, model.getJoinedModel('stocktransactions'));
    }

    return batch;
  },

  buildQuery: function(searchTextValue) {
    var orderBy, assigneduserId, category, schema = this.schema;
    if ( !this.query ) {
      var table = this.getSchemaTableName(schema);
      var route = this.buildApiRoute(schema, table);
      var groupingField, groupingFieldName, groupingFieldType = 'desc';
      var columns = this.buildSelectColumnsArray();

      var query = Factory.getRESTmodel().listQuery(route)
        .indexedResult()
        .limit(this.options.limit);

      var filter = this.options.filter;
      if ( filter ) {
        filter.forEach(function(field, value, comparison) {
          query.where(field, value, comparison);
        });

        orderBy = filter.getSortFields();

        groupingField = filter.getGroupingField();
        if ( groupingField ) {

          groupingFieldName = groupingField;
          if ( typeof groupingField === 'object' ) {
            groupingFieldName = groupingField.field;
            groupingFieldType = groupingField.type;
          }

          if ( groupingFieldName ) {
            if ( !orderBy )
              orderBy = [];

            orderBy.unshift({
              field: groupingFieldName,
              type: groupingFieldType
            });
          }
        }

        category = filter.getCategory();
        if ( category ) {
          query.filterByCategory(table, category.name);
        }

        assigneduserId = filter.getAssignedUserId();
        if ( assigneduserId ) {
          query.whereStartLevel('or');
          query.where('assigneduser', assigneduserId);
          query.whereEndLevel();
        }

        filter.applyQueryHandler(query);
      }

      if ( orderBy )  {
        orderBy.each(function(order) {
          var field = order.field;
          if ( field.indexOf('.') === -1 )
            field = table + '.' + order.field;

          query.orderBy(field, (
            order.type === 'desc' ?
            '-' :
            '+'
          ));
        });
      } else {
        var orderField = schema.getDefaultOrderField();
        if ( orderField.indexOf('.') === -1 )
          orderField = table + '.' + orderField;

        query.orderBy(orderField, (
          schema.getDefaultOrderType() === 'desc' ?
          '-' :
          '+'
        ));

      }

      query.columns(columns);

      var selectJoins = schema.getSelectJoins();
      if ( selectJoins )
          NS.modelUtils.addJoinsToQuery(query, selectJoins);

      if ( this.options.joins ) {
        this.options.joins.forEach(function(join) {
          query.join.apply(query, join);
        });
      }

      if ( this.options.distinct )
        query.distinct(this.options.distinct);

      this.query = query;
    }

    if ( searchTextValue === undefined && this.options.filter ) {
      searchTextValue = this.options.filter.getSearchText();
    }

    if ( searchTextValue !== undefined )
      this.query.search(searchTextValue);

    // this.query.query('s');
    this.query.offset(this.offset);

    return this.query;
  },

  getOffset: function() {
    return this.offset;
  },

  getModelById: function(id) {
    return this.byId[id];
  },

  getItems: function() {
    return this.items;
  },

  getFirstItem: function() {
    return this.items[0];
  },

  getLastItem: function() {
    if ( !this.items )
      return null;

    return this.items[this.items.length - 1];
  },

  forEachItem: function(cb) {
    var items = this.items;
    if ( !items )
      return;

    for ( var i = 0, l = items.length; i < l; i++ )
      cb(items[i], i);
  },

  getItemsCount: function() {
    return this.items ? this.items.length : 0;
  },

  handleListResult: function(batch) {
    var result = batch.getResult();
    if ( !NS.handleRequestResult(result) ) {
      console.error(result);
      throw result;
    }

    var items = batch.getResult(this.buildBatchItemsResultName());

    if ( !NS.handleRequestResult(items) ) {
      console.error(items);
      throw items;
    }

    var schema = this.schema;

    this.instantiateModels(
      items.result,
      this.buildSelectColumnsArray()
    );

    this._calculateCanLoadMore(items.result.length);
    return batch;
  },

  processListResult: function(batch) {
    this.fireUpdateEvent();
    this.loaded = true;

    return batch;
  },

  handleTotalCountResult: function(batch) {
    var result = batch.getResult();
    if ( !NS.handleRequestResult(result) ) {
      console.error(result);
      throw result;
    }

    this.totalCount = parseInt(batch.getResult(this.buildBatchCountResultName()).result);

    this.fireEvent('updateCount', [this]);
  },

  getTotalCount: function() {
    return this.totalCount;
  },

  buildSelectColumnsArray: function() {
    var columns = this.schema.getListSelectColumns().clone();
    if ( this.options.filter ) {
      var groupingField = this.options.filter.getGroupingField();
      if ( groupingField ) {
        if ( typeof groupingField === 'object' )
          groupingField = groupingField.field;

        if ( groupingField && !columns.contains(groupingField) ) {
          columns.push(groupingField);
        }
      }
    }

    if ( typeOf(this.options.managedJoins) === 'array' ) {
      columns.append(this.options.managedJoins);
    }

    if ( this.options.selectFields ) {
      var selectFields = this.options.selectFields;
      for ( var f, i = 0, l = selectFields.length; i < l; i++ ) {
        f = selectFields[i];
        if ( !columns.contains(f) )
          columns.push(f);
      }
    }

    return columns;
  },

  fireUpdateEvent: function() {
    this.fireEvent('update', [new CollectionEvent(this)]);
  },

  fireUpdateItemEvent: function(modelItem, oldModelItem, itemIndex) {
    this.fireEvent('updateItem', [new CollectionEvent(this, modelItem, oldModelItem).setItemIndex(itemIndex)]);
  },

  fireRemoveItemEvent: function(modelItem, oldModelItem, itemIndex) {
    this.fireEvent('removeItem', [new CollectionEvent(this, modelItem, oldModelItem).setItemIndex(itemIndex)]);
  },

  fireAddItemEvent: function(modelItem) {
    this.fireEvent('addItem', [new CollectionEvent(this, modelItem)]);
  },

  // TODO
  // removeAll: function() {
  //   this.items = [];
  //   this.byId = {};
  //   this.persist();
  //   this.fireRemoveAllEvent();
  // },

  fireRemoveAllEvent: function() {
    this.fireEvent('removeAll', [new CollectionEvent(this)]);
  },

  newModelInstance: function() {
    return this.schema.newInstance(this);
  },

  addModel: function(model, suppressEvents) {
    var items = this.items;
    if ( items == null )
      items = this.items = [];

    var id = model.getId();
    var exists = this.byId[id];
    this.byId[id] = model;
    if ( !exists ) {
      items.push(model);
      if ( suppressEvents !== true )
        this.fireAddItemEvent(model);

    } else {
      var oldItem = null;
      for (var i = items.length - 1; i >= 0; i--) {
        if ( items[i].getId() == id ) {
          oldItem = items.splice(i, 1, model)[0];
          break;
        }
      }

      if ( suppressEvents !== true )
        this.fireUpdateItemEvent(model, oldItem, i);
    }

  },

  addModelsFromCollection: function(collection) {
    collection.forEachItem(function(item) {
      this.addModel(item, true);
    }.bind(this));

    this.fireUpdateEvent();
  },

  removeItem: function(id) {
    this.byId[id] = null;
    var item;
    for (var i = this.items.length - 1; i >= 0; i--) {
      if ( this.items[i].getId() == id ) {
        item = this.items.splice(i, 1)[0];
        break;
      }
    }

    this.fireRemoveItemEvent(item, null, i);
  },

  sortByLastmodified: function(fieldName, type) {
    if ( type === 'desc' )
      type = 1;
    else
      type = -1;

    this.items.sort(function (a, b) {
      return (a.getField('lastmodified').getPlainValue() - b.getField('lastmodified').getPlainValue()) * type;
    });
  },

  cancelRequest: function() {
    if ( this.currentRequest )
      this.currentRequest.cancel();
  },

  destroy: function() {
    this.schema = null;
    this.filter = null;
    this.cancelRequest();

    this.reset();
  }
});



})(gx.zeyosREST);
