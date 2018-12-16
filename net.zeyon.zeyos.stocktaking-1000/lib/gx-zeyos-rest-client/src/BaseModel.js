(function(NS) {
  var Factory = NS.Factory;
  var HttpRequest = NS.HttpRequest;

  // TODO

  /**
   * Helper to prevent silently failing promises.
   *
   * @see Factory.logOnErrorAndRethrow
   */
  var logOnErrorAndRethrow = NS.logOnErrorAndRethrow;

  var objDate =new Date();
  var DT = {
    'Date'               : objDate,
    timezoneOffsetSeconds: objDate.getTimezoneOffset() * 60
  };

  var ZeyOS = {};

  ZeyOS.FMT = {
    dateTime: function(parsedValue) {
      return new Date(parsedValue * 1000).format('%Y-%m-%d %H:%M');
    },
    dateTimeVerbose: function(parsedValue) {
      return new Date(parsedValue * 1000).format('%Y-%m-%d %H:%M');
    },
    dateTimePretty: function(parsedValue) {
      return new Date(parsedValue * 1000).format('%Y-%m-%d %H:%M');
    },
    duration: function(parsedValue) {
      // TODO
      return parsedValue;
    }
  };


  var BaseEvent = new Class({
    instance: null,
    initialize: function(instance) {
      this.instance = instance;
    },

    getInstance: function() {
      return this.instance;
    }

  });


  var ModelEvent = new Class({
    Implements: BaseEvent
  });


  /**
   * Schema's act as the definition between models and various other
   * components like a persistence layer.
   *
   * @type {Class}
   */
  var BaseModelSchema = new Class({
    Implements: Options,
    options: {
      modelName: 'Base',
      modelClass: null,
      collectionClass: null,
      defaultDetailViewName: null,
      defaultListViewName: null,
      globalSearchEntity: false,

      integrationType: 'full',

      extendListQuery: null, /* function(collection, batch, query) {
        Attention: Be aware of modifing the query!
        This query is saved and reused for paging functionality etc.
      } */
      handleListQueryResult: null // function(collection, batch) {}
    },

    initialize: function(options) {
      this.setOptions(options);
    },

    init: function() {
      return this;
    },

    getModelName: function() {
      return this.options.modelName;
    },

    getEntityName: function() {
      return this.getModelName();
    },

    getIntegrationType: function() {
      return this.options.integrationType;
    },

    getDefaultDetailViewName: function() {
      return this.options.defaultDetailViewName;
    },

    getDefaultListViewName: function() {
      return this.options.defaultListViewName;
    },

    getCollectionClass: function() {
      return this.options.collectionClass;
    },

    newInstance: function(collection) {
      return new this.options.modelClass(this, collection);
    }
  });

  /**
   * EntityModelSchema act as the concrete connection between a zeyos entity
   * and the corresponding model.
   *
   * This implementation is strongly connected with the zeyos_entity_schema.js
   * definition.
   *
   * @type {Class}
   */
  var EntityModelSchema = new Class({
    Extends: BaseModelSchema,

    _schema: null,
    initialize: function(options) {
      this.parent(options);

      if ( !this._schema ) {
        this._schema = NS.EntitySchema.get(this.getModelName());
        if ( !this._schema )
          throw new Error('Could not load unknown model schema: ' + this.getModelName());
      }

      return this;
    },

    getEntityName: function() {
      return this._schema.entityName;
    },

    getDefaultTitleFieldName: function() {
      return this._schema.defaultTitleFieldName;
    },

    getListSelectColumns: function() {
      return this._schema.listSelectFields;
    },

    getDetailSelectColumns: function() {
      return this._schema.detailSelectFields;
    },

    getSelectJoins: function() {
      return this._schema.selectJoins;
    },

    getJoinSelectColumns: function() {
      return this._schema.joinSelectFields;
    },

    getListDisplayFields: function() {
      return this._schema.listDisplayFields;
    },

    getDetailDisplayFields: function() {
      return this._schema.detailDisplayFields;
    },

    getDetailLegendsByIndexes: function() {
      return this._schema.detailLegendsByIndexes;
    },

    getField: function(name) {
      return this._schema.fields[name];
    },

    getFields: function() {
      return this._schema.fields;
    },

    getDefaultFilterFields: function() {
      return this._schema.defaultFilterFields;
    },

    getAssocFilterFields: function() {
      return this._schema.assocFilterFields;
    },

    getStandardViewFilterField: function() {
      return this._schema.standardViewFilterField;
    },

    getDefaultOrderField: function() {
      return this._schema.defaultOrderField;
    },

    getDefaultOrderType: function() {
      return this._schema.defaultOrderType;
    },

    getCustomApiRoute: function(type) {
      var routes = this._schema.customApiRoute;
      return routes ? routes[type] : null;
    },

    getGroupingFields: function() {
      return this._schema.groupingFields;
    },

    newInstance: function(collection) {
      var newItem = this.parent(collection);
      var schemaFields = this.getFields();
      var fields = this.getDetailSelectColumns();
      var fieldName, defaultValues = [];
      for ( var i = 0, l = fields.length; i < l; i++ ) {
        fieldName = fields[i];
        if ( typeOf(fieldName) === 'array' )
          fieldName = fieldName[1];

        defaultValues[i] = modelUtils.getFieldDefaultValue(schemaFields[fieldName]);
      }

      newItem.setDetailFields(defaultValues, fields);
      newItem.initDefaults();
      newItem.unsetDirtyState();

      return newItem;
    },

    newFieldInstance: function(field, modelItem) {
      if ( typeof field === 'string' )
        field = this.getField(field);

      this.initFieldLabel(field);

      if ( field.inputType === 'select' )
        this.initFieldSelectOptions(field);

      var instanceOptions;
      try {
        instanceOptions = Object.clone(field);
      } catch(e) {
        console.log(field, value);
        console.error(e);
      }

      return new field.implementation(instanceOptions, modelItem);
    },

    initFieldLabel: function(field) {
      if ( field.labelKey ) {
        field.label = _(field.labelKey) || field.labelKey;
        return field.label;
      }

      var key = field.label || field.name;
      var labelKey = this.getEntityName() + ".fields." + key;
      var label = _(labelKey);
      if ( !label ) {
        labelKey = "general.fields." + key;
        label = _(labelKey);
      }

      if ( label ) {
        field.label = label;
        field.labelKey = labelKey;
      } else {
        field.label = key;
      }

      return field.label;
    },

    initFieldSelectOptions: function(field) {
      if ( field.inputType !== 'select' )
        return;

      var key = field.selectOptionsLocaleKey;
      if ( typeof key === undefined )
        return;

      if ( key === true )
        key = this.getEntityName() + '.fields.' + field.name + '.selectOptions';

      field.selectOptions = _(key);
    },

  });

  var modelUtils = {
    getFieldDefaultValue: function(field) {
      var value = field.defaultValue;

      if ( value === '<?=datenow?>' ) {
        value = parseInt(new Date().getTime() / 1000);
      } else if ( value === '<?=numformat?>' ) {
        value = '';
      }

      return value;
    },
    parsedInputValueToPlainValue: function(field, value) {
      var v, type = field.valueType || 'text';

      switch (type) {
        case 'text':
        case 'textarea':
        case 'html':
          return (''+value).trim();
        case 'int':
        case 'integer':
          v = parseInt(value);
          return Number.isNaN(v) ? null : v;
        case 'float':
          v = parseFloat(value);
          return Number.isNaN(v) ? null : v;
        case 'file':
          return value;

        case 'timestampSeconds':
          if ( value ) {
            // value = (''+value).replace('T', ' ');
            value = parseInt((new Date(value).getTime()) / 1000);
          } else
            value = null;

          break;
        case 'timestampMilliSeconds':
          if ( value ) {
            // value = (''+value).replace('T', ' ');
            value = parseInt((new Date(value).getTime()) / 1000);
          } else
            value = null;

          break;
        case 'association':
          if ( value && typeof value === 'object' )
            value = value.getId();

          if ( !value )
            value = '';

          break;
        case 'duration':
          var fractions = value.split(':');
          var minutes = 0;
          if ( fractions[0] )
            minutes += parseInt(fractions[0]) * 60;

          if ( fractions[1] )
            minutes += parseInt(fractions[1]);

          return minutes;
        case 'json':
          return JSON.stringify(value);
        case 'plainJson':
          // Do not json stringify since postgresql can and will handle json.
          return value;
      }

      if ( value && field.inputType === 'datetime-local' ) {
        value = value + DT.timezoneOffsetSeconds;
      }

      return value;
    },

    getJoinAlias: function(join) {
      var alias = join.args[3];
      if ( !alias )
        alias = join.model;

      if ( typeof alias !== 'string' )
        alias = alias[join.model];

      return alias;
    },

    getJoinSelectFields: function(join) {
      var joinFields = join.joinSelectFields;
      if ( !joinFields ) {
        var joinSchema = Factory.getModelSchema(join.model);
        joinFields = Array.clone(joinSchema.getJoinSelectColumns());
      } else {
        joinFields = Array.clone(joinFields);
      }

      return joinFields;
    },

    /**
     * This will hydrate the numeric result of a query by resolving all
     * joins and setting them for the given model.
     * Returns the modified columns array which you want to use to read the
     * standard numeric fields.
     * {@see this.addJoinsToQuery}
     *
     * @param  {[type]} model         [description]
     * @param  {[type]} item          [description]
     * @param  {[type]} selectColumns [description]
     * @param  {[type]} joins         [description]
     * @return {[type]}               [description]
     */
    hydrateResultJoins: function(model, item, selectColumns, joins) {
      var modifedColumns = selectColumns.clone();
      selectColumns.each(function(column, i) {
        if ( !joins.hasOwnProperty(column) )
          return;

        modifedColumns.splice(i, 1);
      });

      var start = modifedColumns.length;
      selectColumns.each(function(column, i) {
        if ( !joins.hasOwnProperty(column) )
          return;

        var join = joins[column];
        var alias = this.getJoinAlias(join);

        var joinSchema = Factory.getModelSchema(join.model);
        var joinFields = this.getJoinSelectFields(join);

        var joinItem = [];
        for (var i = 0, l = joinFields.length; i < l; i++) {
          joinItem.push(item[start + i]);
        }

        start += joinFields.length;

        model.setJoinedModel(alias, joinSchema, joinItem, joinFields);
      }.bind(this));

      return modifedColumns;
    },

    /**
     * Add joins to the given query in the dependence of the given selectcolumns.
     * This will modify the query in the way that it will add and remove columns
     * from that very query.
     * {@see this.hydrateResultJoins} will act as counterpart to successfully
     * hydrate the numeric result of this query.
     * This function expects the query to be filled with the wanted selectColumns.
     *
     * @param {[type]} query         [description]
     * @param {[type]} joins         [description]
     */
    addJoinsToQuery: function(query, joins) {
      var selectColumns = query.getColumns();
      var modifedColumns = selectColumns.clone();
      selectColumns.each(function(column, i) {
        if ( !joins.hasOwnProperty(column) )
          return;

        var join = joins[column];

        modifedColumns.splice(i, 1);

        query.join.apply(query, join.args);

        var alias = this.getJoinAlias(join);
        var joinFields = this.getJoinSelectFields(join);

        var joinField;
        for (var i = 0, l = joinFields.length; i < l; i++) {
          joinField = joinFields[i];
          joinFields[i] = alias + '.' + joinFields[i];
        }

        modifedColumns.append(joinFields);

      }.bind(this));

      query.columns(modifedColumns, true);
    },

  };

  /**
   * Representing a field of a model with its options and values.
   *
   * @private
   *
   * @type {Class}
   */
  var ModelField = new Class({
    model: null,
    field: null,
    plainValue: null,
    parsedValue: null,
    displayValue: null,
    inputValue: null,

    customData: {},

    /**
     * This value will be used for dirty comparisons.
     * @type {mixed}
     */
    initialPlainValue: undefined,

    initialize: function(model, field, plainValue) {
      this.model = model;
      this.field = field;

      if (plainValue !== undefined)
        this.setPlainValue(plainValue);
    },

    getSchema: function() {
      return this.model.getSchema();
    },

    setCustomData: function(data) {
      Object.merge(this.customData, data);
    },

    getCustomData: function() {
      return this.customData;
    },

    /**
     * Setting the plain value. In most cases comming from the persistent
     * layer (database). Converting this plain value to its various
     * types.
     * Also setting the initial plain value for dirty state comparison.
     *
     * @param {mixed} plainValue
     */
    setPlainValue: function(plainValue, updateInitial) {
      this.plainValue = plainValue;
      if ( updateInitial !== false )
        this.initialPlainValue = plainValue;

      this.parsedValue = this._parsePlainValue(this.field, plainValue);
      this.displayValue = this._parseToDisplayValue(this.field, this.parsedValue);
      this.inputValue = this._parseToInputValue(this.field, this.parsedValue);
    },

    /**
     * Set the input value. In most cases this value is comming from the
     * html <input> type. Converting it automatically to its appropriate
     * plain value format for the persistent layer.
     *
     * @param {mixed} value
     */
    setInputValue: function(value) {
      this.inputValue = value;
      var plainValue = this._parsedInputValueToPlainValue(this.field, value);
      this.setPlainValue(plainValue, false);
    },

    getOptions: function() {
      return this.field;
    },

    getPlainValue: function() {
      return this.plainValue;
    },

    getParsedValue: function() {
      return this.parsedValue;
    },

    getDisplayValue: function() {
      if ( typeOf(this.displayValue) === 'element' ) {
        return this.displayValue.clone();
      }

      return this.displayValue;
    },

    getInputValue: function() {
      return this.inputValue;
    },

    getFieldNameInDependenceOfValue: function() {
      if ( this.field.valueType !== 'association' )
        return this.field.name;

      var plainValue = this.getPlainValue();
      if ( isNaN(parseInt(plainValue)) )
        return '-' + this.field.name;

      return this.field.name;
    },

    _parsePlainValue: function(field, plainValue) {
      if ( plainValue == null )
        return null;

      var v, type = field.valueType || 'text';

      switch (type) {
        case 'json':
        case 'plainJson':
          return JSON.decode(plainValue);

        case 'text':
          return ('' + plainValue).htmlSpecialChars();

        case 'int':
        case 'integer':
          v = parseInt(plainValue, 10);
          if ( Number.isNaN(v) )
            return '';

          return v;

        case 'float':
          v = parseFloat(plainValue);
          if ( Number.isNaN(v) )
            return '';

          return v;

        case 'timestampSeconds':
          return (
            plainValue ?
            parseInt(plainValue) : // parseInt(plainValue) * 1000 :
            null
          );

        case 'timestampMilliSeconds':
          return (
            plainValue ?
            parseInt(plainValue) :
            null
          );
      }

      return plainValue;
    },

    _parseToDisplayValue: function(field, parsedValue) {
      switch(field.displayType) {
        case 'percent':
          return parsedValue + ' %';

        case 'date':
          return (
            parsedValue ?
            ZeyOS.FMT.dateTime(parsedValue) : // new Date(parsedValue).format('%Y-%m-%d') :
            ''
          );
        case 'datetime':
          return (
            parsedValue ?
            ZeyOS.FMT.dateTime(parsedValue) : // new Date(parsedValue).format('%Y-%m-%d %H:%m') :
            ''
          );
        case 'datetimepretty':
          return (
            parsedValue ?
            ZeyOS.FMT.dateTimePretty(parsedValue) : // new Date(parsedValue).format('%Y-%m-%d %H:%m') :
            ''
          );
        case 'datetimeverbose':
          return (
            parsedValue ?
            ZeyOS.FMT.dateTimeVerbose(parsedValue) : // new Date(parsedValue).format('%Y-%m-%d %H:%m') :
            ''
          );
        case 'association':
          return this.model.getJoinedModel(field.entityAlias);
        case 'select':
        if ( field.implementation && field.implementation.staticCreateDisplayValue )
          return field.implementation.staticCreateDisplayValue(field, parsedValue);

          if ( field.selectOptions === undefined ) {
            this.getSchema().initFieldSelectOptions(field);
            if ( field.selectOptions === undefined )
              break;
          }

          var val = field.selectOptions[parsedValue];
          if ( val !== undefined )
            return val;

          break;
        case 'duration':
          return ZeyOS.FMT.duration(parsedValue);

        default:
          return parsedValue;
      }

      return parsedValue;
    },

    _parseToInputValue: function(field, parsedValue) {
      switch(field.inputType) {
        case 'date':
          return (
            parsedValue ?
            new Date(parsedValue * 1000).format('%Y-%m-%d') :
            ''
          );
        case 'datetime':
        case 'datetime-local':
          return (
            parsedValue ?
            new Date(parsedValue * 1000).format('%Y-%m-%dT%H:%M') :
            ''
          );
        case 'association':
          var joinedModel = this.model.getJoinedModel(field.entityAlias);
          if ( joinedModel && joinedModel.getId() )
            return joinedModel;

          parsedValue = '';

          break;
        case 'duration':
          return ZeyOS.FMT.duration(parsedValue);

      }

      return parsedValue;
    },

    _parsedInputValueToPlainValue: modelUtils.parsedInputValueToPlainValue,

    unsetDirtyState: function() {
      this.initialPlainValue = this.plainValue;
    },

    isPlainValueDirty: function() {
      return this.initialPlainValue !== this.plainValue;
    }
  });

  /**
   * A basic model class. Suplying several convenience methods and abstracting
   * the access to there corresponding database entities.
   *
   * @param {BaseModelSchema} schema
   * @param {Collection} collection (Optional)
   *
   * @events update
   *
   * @type {Class}
   */
  var BaseModel = new Class({
    Implements: [Events, Options],

    Binds: [
      'handleDetailsResult',
      'fireCollectionUpdateEvent',
      'handleUpdateResult',
      'handleBatchUpdateResult',
      'handlePersistResult',
      'isExpectedResultValue',
      'handleDelete'
    ],

    options: {
      batchPersistResultName: 'persist',
      batchUpdateResultName: 'update',
      batchLoadResultName: 'load',

      // True will result in a batch request calling GET on the persisted entity.
      // To immediately retrieve the items to get e.g. changes due to services?
      // However, there is a problem with auto authentication in the RestModel class.
      // @see TODO line ca. 1239 in this.persistChanged().
      batchUpdateOnPersist: false
    },

    ID: null,

    /**
     * Indicating if this element was deleted (deleted! not just visibility = 2).
     * @type {Boolean}
     */
    deleted: false,

    /**
     * Indicating if one of the fields of this model is an relation to another
     * entity.
     * @type {Boolean}
     */
    hasRelationField: false,

    itemState: null,

    joinedModels: {},

    customData: {},

    fields: null,
    schema: null,
    collection: null,
    initialize: function(schema, /*optional*/ collection) {
      this.collection = collection;
      this.schema = schema;
    },

    buildBatchPersistResultName: function() {
      return this.options.batchPersistResultName + this.schema.getModelName();
    },

    buildBatchLoadResultName: function() {
      return this.options.batchLoadResultName + this.schema.getModelName();
    },

    buildBatchUpdateResultName: function() {
      return this.options.batchUpdateResultName + this.schema.getModelName();
    },

    initDefaults: function() {},

    setFieldsObject: function(objItem, arrColumns) {
      var fields = this.fields, item = {}, name, field;

      if ( !fields )
        this.fields = fields = {};

      for (var i = 0, l = arrColumns.length; i < l; i++) {
        name = arrColumns[i];

        field = fields[name];
        if ( !field ) {
          field = fields[name] = new ModelField(
            this,
            this.schema.getField(name)
          );
        }

        field.setPlainValue(objItem[name]);
      }

      if ( fields.ID )
        this.setId(fields.ID.getPlainValue());
    },

    _setFields: function(arrItem, arrColumns) {
      var fields = this.fields, item = {}, name, field;

      if ( !fields )
        this.fields = fields = {};

      if ( typeOf(arrItem) !== 'array' )
        arrItem = [];

      for (var i = 0, l = arrColumns.length; i < l; i++) {
        name = arrColumns[i];

        if ( typeOf(name) === 'array' )
          name = name[1];

        field = fields[name];
        if ( !field ) {
          field = fields[name] = new ModelField(
            this,
            this.schema.getField(name)
          );
        }

        field.setPlainValue(arrItem[i]);
      }

      if ( fields.ID )
        this.setId(fields.ID.getPlainValue());

      this.fields = fields;
    },

    setItemState: function(state) {
      this.itemState = state;
    },

    setListFields: function(item, fields) {
      fields = modelUtils.hydrateResultJoins(
        this,
        item,
        fields,
        this.schema.getSelectJoins()
      );

      this.setItemState('list');
      this._setFields(item, fields);
    },

    setDetailFields: function(item, fields) {
      fields = modelUtils.hydrateResultJoins(
        this,
        item,
        fields,
        this.schema.getSelectJoins()
      );

      this.setItemState('detail');
      this._setFields(item, fields);
    },

    setJoinFields: function(item, fields) {
      this.setItemState('join');
      this._setFields(item, fields);
    },

    setCustomData: function(values) {
      Object.merge(this.customData, values);
    },

    getCustomData: function() {
      return this.customData;
    },

    getSchema: function() {
      return this.schema;
    },

    getItemState: function() {
      return this.itemState;
    },

    get: function(fieldName) {
      var field = this.fields[fieldName];
      if ( !field )
        return undefined;

      return field.getDisplayValue();
    },

    set: function(fieldName, value) {
      var field = this.fields[fieldName];
      if ( !field )
        throw new Error('Unknown field: ' + fieldName);

      field.setInputValue(value);
    },

    getField: function(fieldName) {
      return this.fields[fieldName];
    },

    getId: function() {
      return this.ID;
    },

    setId: function(id) {
      this.ID = id;
      var idField = this.getField('ID');
      if ( idField )
        idField.setInputValue(id);
    },

    getFirstValidField: function(arrFields) {
      var val;
      for ( var i = 0, l = arrFields.length; i < l; i++ ) {
        val = this.get(arrFields[i]);
        if ( val )
          return val;
      }

      return undefined;
    },

    setPlainValuesObject: function(values) {
      var name, field;
      for ( name in values ) {
        if ( !values.hasOwnProperty(name) )
          continue;

        field = this.getField(name);
        if ( field )
          field.setPlainValue(values[name]);
      }

      if ( values.ID )
        this.setId(values.ID);

      return this;
    },

    setInputValuesObject: function(values) {
      var name, field;
      for ( name in values ) {
        if ( !values.hasOwnProperty(name) )
          continue;

        field = this.getField(name);
        if ( field )
          field.setInputValue(values[name]);
      }

      if ( values.ID )
        this.setId(values.ID);

      return this;
    },

    getPlainValues: function(type) {
      var name, field, values = {};

      if ( type !== undefined ) {
        var fields;
        if ( type === 'join' ) fields = this.schema.getJoinSelectColumns();
        if ( type === 'detail' ) fields = this.schema.getJoinSelectColumns();
        if ( type === 'list' ) fields = this.schema.getJoinSelectColumns();

        for ( var i = 0, l = fields.length; i < l; i++ ) {
          name = fields[i];
          field = this.getField(name);
          if ( !field )
            continue;

          values[name] = field.getPlainValue();
        }

        return values;
      }

      for ( name in this.fields ) {
        if ( !this.fields.hasOwnProperty(name) )
          continue;

        values[name] = this.getField(name).getPlainValue();
      }

      return values;
    },

    getInputValues: function() {
      var name, values = {};
      for ( name in this.fields ) {
        if ( !this.fields.hasOwnProperty(name) )
          continue;

        values[name] = this.getField(name).getInputValue();
      }

      return values;
    },

    getDirtyPlainValues: function() {
      var isNewItem = !this.getId();
      var name, nameByValue, field, value, fields = this.fields, dirtyValues = {};
      for ( name in fields ) {
        if ( !fields.hasOwnProperty(name) )
          continue;

        field = fields[name];
        nameByValue = field.getFieldNameInDependenceOfValue();
        if ( isNewItem ) {
          value = field.getPlainValue();
          if ( value !== '' )
            dirtyValues[nameByValue] = value;

        } else if ( field.isPlainValueDirty() )
          dirtyValues[nameByValue] = field.getPlainValue();
      }

      return dirtyValues;
    },

    setJoinedModel: function(alias, schema, arrItem, fields) {
      var model = this.joinedModels[alias];
      if ( !model ) {
        model = schema.newInstance();
        this.joinedModels[alias] = model;
      }

      model.setJoinFields(arrItem, fields);
    },

    setJoinedModelInstance: function(alias, model) {
      this.joinedModels[alias] = model;
    },

    addOneToManyJoinModelInstance: function(alias, model) {
      if ( !this.joinedModels[alias] )
        this.joinedModels[alias] = [];

      this.joinedModels[alias].push(model);
    },

    getJoinedModel: function(alias) {
      return this.joinedModels[alias];
    },

    /**
     * Image which represents this item.
     * @return {HTMLElement}
     */
    getImage: function() {
      return null;
    },

    getIcon: function() {
      return null;
    },

    getTitleFieldName: function() {
      return this.getSchema().getDefaultTitleFieldName();
    },

    /**
     * Title of this model. E.g. Account name of accounts. First- and lastname
     * of contacts etc.
     * @return {text|HTMLElement}
     */
    getTitle: function(noMarkup) {
      var name = this.get(this.getTitleFieldName());
      if ( !name )
        return '';

      if ( noMarkup === true )
        return name;

      return new Element('strong', {
        'html': name
      });
    },

    /**
     * Optional additional title information e. g. the company of an contact.
     * @return {text|HTMLElement}
     */
    getSubTitle: function() {
      return null;
    },

    load: function() {
      var schema = this.schema;
      var columns = schema.getDetailSelectColumns();
      var route = schema.getCustomApiRoute('details') || schema.getEntityName();
      var query = Factory.getRESTmodel().itemQuery(route, this.getId())
        .indexedResult()
        .columns(columns);

      modelUtils.addJoinsToQuery(query, schema.getSelectJoins());

      var batch = Factory.getRESTmodel().createBatch();
      if ( typeof this.extendLoadBatchBefore === 'function' )
        this.extendLoadBatchBefore(batch);

      batch.addQuery(this.buildBatchLoadResultName(), query);

      if ( typeof this.extendLoadBatchAfter === 'function' )
        this.extendLoadBatchAfter(batch);

      return batch
        .run()
        .then(this.handleDetailsResult)
        .catch (logOnErrorAndRethrow);
    },

    loadAndUnpack: function() {
      var _this = this;
      return this.load()
        .then(function() {
          return _this;
        });
    },

    // @abstract extendLoadBatchBefore: function(batch) {},
    // @abstract extendLoadBatchAfter: function(batch) {},

    createUpdateQuery: function(options) {
      options || (options = {});

      var lastmodified;

      if ( options.ignoreLastmodified !== true ) {
        lastmodified = this.getField('lastmodified');
        if ( lastmodified )
            lastmodified = lastmodified.getPlainValue();
      }

      var schema = this.schema;
      var columns = schema.getDetailSelectColumns();
      var table = schema.getEntityName();
      var route = schema.getCustomApiRoute('details') || table;
      var query = Factory.getRESTmodel().listQuery(route)
        .indexedResult()
        .columns(columns);

      if ( lastmodified )
        query.where('lastmodified', lastmodified, 'gt');

      modelUtils.addJoinsToQuery(query, schema.getSelectJoins());

      if ( options.noId === true )
        return query;

      return query.where('ID', this.getId());

    },

    update: function() {
      var options = {};
      if ( this.itemState !== 'details' )
        options.ignoreLastmodified = true;

      var query = this.createUpdateQuery(options);

      var batch = Factory.getRESTmodel().createBatch();
      if ( typeof this.extendLoadBatchBefore === 'function' )
        this.extendLoadBatchBefore(batch);

      batch.addQuery(this.buildBatchUpdateResultName(), query);

      if ( typeof this.extendLoadBatchAfter === 'function' )
        this.extendLoadBatchAfter(batch);

      return batch
        .run()
        .then(this.handleBatchUpdateResult)
        .catch (logOnErrorAndRethrow);
    },

    /**
     * Updates this model with the data of the given model.
     *
     * @param {array} fields (optional) array of fieldsname which should be updated.
     * @return {[type]}
     */
    updateByModel: function(model, fields) {
      if ( !fields )
        fields = Object.keys(this.fields);

      var updateValues = model.getPlainValues();
      this.setPlainValuesObject(updateValues, fields);

      var updateCustomData = model.getCustomData();
      if ( updateCustomData && Object.getLength(updateCustomData) > 0 ) {
        var customData = this.getCustomData();
        Object.merge(customData, updateCustomData);
        this.setCustomData(customData);
      }
    },

    /**
     * Load details of this model. Do nothing if this items details where
     * already loaded.
     *
     * @param  {boolean} force
     * @return {Promise}
     */
    loadDetails: function(force) {
      if ( force !== true && this.itemState === 'details' )
        return Promise.resolve();

      return this.update();
    },

    /**
     * Persist the given values.
     * If peristValues is ommitted, getDirtyPlainValues will be called.
     * @param  {object} persistValues
     * @return {Promise}
     */
    persistChanged: function(persistValues) {
      // throw new Error('TODO - not yet ported');

      if ( persistValues === undefined )
        persistValues = this.getDirtyPlainValues();

      delete persistValues.ID;

      var id = this.getId();
      if ( !id )
        id = '';

      if ( !this.getId() && !persistValues.creator && this.fields.creator ) {
        var authUser = Factory.getAuthenticationModel();
        if ( authUser )
          authUser = authUser.getId();

        if ( authUser )
          persistValues.creator = authUser;
      }

      var modelName = this.schema.getEntityName();
      var query = Factory.getRESTmodel().persistItemQuery(modelName, id, persistValues);
      var updateQuery = this.createUpdateQuery({
        ignoreLastmodified: true,
        noId: true
      });

      var persistQueryBatchName = this.buildBatchPersistResultName();

      // TODO - this will fail if the order of the batch requests changes.
      // E.g. what happen if RESTmodel will change order by adding automated
      // authentication!
      // Solution would be to set the identifier here by a special character
      // composition e.g.: <?batchResult:persistQueryBatchName?> and
      // resolving this string to the appropriate number at the very last moment
      // e.g. in the batch.createBody() method.
      //
      // Another solution is support of relative block selection e.g. {{/-1/result}}
      // for the result of the very previous block
      updateQuery.where('ID', id ? id : '{{/0/result}}');
      updateQuery.limit(1);

      var batch = Factory.getRESTmodel().createBatch();
      if ( typeof this.extendPersistBatchBefore === 'function' )
        this.extendPersistBatchBefore(batch, persistValues);

      batch.addQuery(persistQueryBatchName, query);

      if ( this.options.batchUpdateOnPersist === true )
        batch.addQuery(this.buildBatchUpdateResultName(), updateQuery);

      if ( typeof this.extendPersistBatchAfter === 'function' )
        this.extendPersistBatchAfter(batch, persistValues);

      return batch
        .run()
        .then(this.handlePersistResult)
        .catch (logOnErrorAndRethrow);
    },

    extendPersistBatchBefore: function(batch, persistValues) {},
    extendPersistBatchAfter: function(batch, persistValues) {},

    handlePersistResult: function(batch) {
      var result = batch.getResult();
      if ( !NS.handleRequestResult(result) ) {
        console.error(result);
        throw result;
      }

      // if ( !NS.handleRequestResult(res, _('error.request.save'), this.isExpectedResultValue) ) {
      //  console.error(res);
      //  throw res;
      // }

      // if ( typeOf(res.result) === 'object' ) {
      //  this.setFieldsObject(res.result, this.schema.getDetailSelectColumns());
      //  this.fireUpdateEvent();

      //  return true;
      // }

      var persistResult = batch.getResult(this.buildBatchPersistResultName());
      var id = parseInt(persistResult.result);
      if ( !Number.isNaN(id) )
        this.setId(id);

      var updateResult = batch.getResult(this.buildBatchUpdateResultName());
      if ( updateResult )
        this.handleUpdateResult(updateResult);

      return batch;
    },

    isExpectedResultValue: function(res) {
      return res === true || !Number.isNaN(parseInt(res)) || typeOf(res) === 'object';
    },

    validate: function() {
      var modelName = this.schema.getEntityName();
      var valid = zeyosEntitySchema.validateEntity(
        modelName,
        this.getPlainValues()
      );

      if ( valid === true ) {
        return {
          valid: true,
          names: zeyosEntitySchema.resolveErrorConstraints(
            modelName,
            []
          )
        };
      } else {
        return {
          valid: false,
          names: zeyosEntitySchema.resolveErrorConstraints(
            modelName,
            valid
          )
        };
      }
    },

    handleDetailsResult: function(batch) {
      var result = batch.getResult();
      if ( !NS.handleRequestResult(result) ) {
        console.error(result);
        throw result;
      }

      var itemResult = batch.getResult(this.buildBatchLoadResultName());
      this.setDetailFields(
        itemResult.result,
        this.schema.getDetailSelectColumns()
      );

      this.fireUpdateEvent();

      return batch;
    },

    handleBatchUpdateResult: function(batch) {
      var result = batch.getResult();
      if ( !NS.handleRequestResult(result) ) {
        console.error(result);
        throw result;
      }

      var items = batch.getResult(this.buildBatchUpdateResultName());
      return this.handleUpdateResult(items);
    },

    handleUpdateResult: function(items) {
      if ( !NS.handleRequestResult(items) ) {
        console.error(items);
        throw items;
      }

      if ( items.result.length === 0 ) {
        this.unsetDirtyState();
        this.fireUpdateEvent();
        return this;
      }

      this.setDetailFields(
        items.result[0],
        this.schema.getDetailSelectColumns()
      );

      this.fireUpdateEvent();

      return this;
    },

    unsetDirtyState: function() {
      var name, fields = this.fields;
      for ( name in fields ) {
        if ( !fields.hasOwnProperty(name) )
          continue;

        fields[name].unsetDirtyState();
      }
    },

    fireUpdateEvent: function(item) {
      if ( item === undefined )
        item = this;

      var event = new ModelEvent(item);
      this.fireEvent('update', [event]);
      if ( this.collection ) {
        // this.collection.fireUpdateItemEvent(item);
        // addModel will take care of replacing the current model if it exists
        // and fireing the appropriate event.
        this.collection.addModel(item);
      }
    },

    fireRemoveEvent: function(item) {
      if ( item === undefined )
        item = this;

      var event = new ModelEvent(item);
      this.fireEvent('remove', [event]);
      if ( this.collection )
        this.collection.removeItem(this.getId());
    },

    remove: function() {
      return Factory.getRESTmodel().deleteItemQuery(
        this.schema.getEntityName(),
        this.getId()
      )
        .run()
        .then(this.handleDelete)
        .catch (logOnErrorAndRethrow);

    },

    handleDelete: function(res) {
      if ( !NS.handleRequestResult(res) ) {
        console.error(res);
        throw res;
      }

      this.deleted = true;
      this.fireRemoveEvent(this);

      return this;
    },

    // TODO - visibility handling
    // externalize from zeyos mobile app.
  });

  NS.BaseEvent = BaseEvent;
  NS.BaseModelSchema = BaseModelSchema;
  NS.EntityModelSchema = EntityModelSchema;
  NS.BaseModel = BaseModel;

  NS.modelUtils = modelUtils;
  NS.ModelField = ModelField;
  NS.ZeyOS = ZeyOS;

})(gx.zeyosREST);
