gx.zeyosREST.EntitySchema = {
  _isInit: {},
  _defaults: null,

  resolveLabel: null,

  doInit: function(resolveLabel) {
    this.resolveLabel = resolveLabel || function(l) {return l;};
    this._doInitFields(this._defaults, this._defaults);
  },

  get: function(name) {
    var entity = this.entities[name];

    if ( !entity )
      throw new Error("Entity does not exist: " + name);

    if ( !this._isInit[name] ) {
      entity = this.entities[name] = this._doInitEntity(entity, name);
      this._isInit[name] = true;
    }

    return entity;
  },

  validateEntity: function(entity, data) {
    return this.validateSchema(this.get(entity).constraints, data);
  },

  validateSchema: function(schema, data) {
    return schemaValidator.check(schema, data);
  },

  /**
   * Return all constraints computed with the given object. Filling up the
   * object with non existing keys. Commonly used for reseting previously
   * error highlighted fields.
   *
   * @return {object}
   */
  resolveErrorConstraints: function(entity, errors) {
    var constraints = this.get(entity).constraints;

    var name, obj = {};
    for ( name in constraints ) {
      if ( !constraints.hasOwnProperty(name) )
        continue;

      obj[name] = null;
    }

    var error, desc;
    for ( i = 0, l = errors.length; i < l; i++ ) {
      error = errors[i];
      desc = this.resolveLabel(error.localeKey);
      if ( !desc )
        desc = error.localeKey;

      obj[error.name] = desc;
    }

    return obj;
  },

  /**
   * Initialize the label using the included zeyos localization with
   * the zeyon AppLocale library.
   *
   * Maybe overwritten by "subclasses" to adjust behaviour.
   *
   */
  doInitLabel: function(entityName, field, name) {
    if ( field.labelKey ) {
      return this.resolveLabel(field.labelKey);
    }

    var key = field.label || name;
    var label = this.resolveLabel(entityName + ".fields." + key);
    if ( !label )
      label = this.resolveLabel("general.fields." + key);

    if ( label )
      return label;
    else
      return key;

  },

  _doInitEntity: function(entity) {
    if ( entity.inherit !== undefined ) {
      var inheritFrom = this.get(entity.inherit);
      var cloned = Object.clone(inheritFrom);
      entity = Object.merge({}, cloned, entity);
    }

    var defaults = entity.defaults = this._defaults;

    if ( !entity.entityName )
      entity.entityName = entity.modelName;

    if ( !entity.defaultTitleFieldName )
      entity.defaultTitleFieldName = defaults.defaultTitleFieldName;

    if ( !entity.defaultFilterFields && defaults.defaultFilterFields )
      entity.defaultFilterFields = Array.clone(defaults.defaultFilterFields);

    if ( !entity.assocFilterFields && defaults.assocFilterFields )
      entity.assocFilterFields = Array.clone(defaults.assocFilterFields);

    if ( entity.standardViewFilterField === undefined && defaults.standardViewFilterField )
      entity.standardViewFilterField = Object.clone(defaults.standardViewFilterField);

    if ( !entity.defaultOrderField )
      entity.defaultOrderField = defaults.defaultOrderField;

    if ( !entity.defaultOrderType )
      entity.defaultOrderType = defaults.defaultOrderType;

    if ( typeof entity.customApiRoute === 'string' ) {
      entity.customApiRoute = {
        list: entity.customApiRoute,
        details: entity.customApiRoute
      };
    }

    this._doInitFieldLists(entity, defaults);
    this._doInitConstraints(entity, defaults);
    this._doInitJoins(entity, defaults);
    this._doCopyFromDefaultFields(entity, defaults);
    this._doInitFields(entity, defaults);

    return entity;
  },

  _doInitFieldLists: function(entity, defaults) {
    // Merge list fields with defaults
    if ( entity.noListSelectFieldsMerge !== true )
      entity.listSelectFields = defaults.listSelectFields.concat(
        entity.listSelectFields);

    // if ( entity.groupingFields && entity.groupingFields.length > 0 ) {
    //  var dif = entity.groupingFields.differencesTo(entity.listSelectFields);
    //  if ( dif.length > 0 ) {
    //    throw new Error('InvalidSchemaDefinition: Grouping fields must be listSelectFields either. Missing select fields are: ' + dif.join(','));
    //  }
    // }

    // Merge detail with list fields.
    if ( entity.noList2DetailSelectFieldsMerge !== true )
      entity.detailSelectFields.combine(entity.listSelectFields);

    // Merge default detail form legends
    var detailLegendsByIndexes = entity.detailLegendsByIndexes;
    if ( detailLegendsByIndexes !== null && detailLegendsByIndexes !== false ) {
      entity.detailLegendsByIndexes = Object.merge(
        {},
        defaults.detailLegendsByIndexes,
        detailLegendsByIndexes
      );
    }

    // Merge default join select fields.f
    if ( !entity.joinSelectFields )
      entity.joinSelectFields = [];

    entity.joinSelectFields.combine(defaults.joinSelectFields);
  },

  _doInitConstraints: function(entity, defaults) {
    var name, constraint;
    for ( name in entity.constraints ) {
      if ( !entity.constraints.hasOwnProperty(name) )
        continue;

      constraint = entity.constraints[name];
      if ( constraint === 'inherit' ) {
        constraint = entity.constraints[name] = defaults.constraints[name];
      }

      if ( !constraint.name )
        constraint.name = name;
    }
  },

  _doInitJoins: function(entity, defaults) {
    if ( entity.selectJoins ) {
      this._doInitJoinsFields(entity.entityName, entity.selectJoins, defaults.selectJoins);
    }
  },

  _doInitJoinsFields: function(entityName, joins, defaults) {
    var name, join;
    Object.each(joins, function(join, joinName) {
      if ( join !== 'inherit' )
        return;

      if ( !defaults[joinName] ) {
        console.error('Try to inherit from invalid default join: ' + join);
        return;
      }

      join = Object.clone(defaults[joinName]);
      if ( join.args && join.args[1] === '::entityTable' )
        join.args[1] = entityName;

      joins[joinName] = join;
    });

  },

  _doCopyFromDefaultFields: function(entity, defaults) {
    var fields = []
      .combine(entity.detailSelectFields)
      .combine(entity.listSelectFields)
      .combine(entity.joinSelectFields);

    if ( entity.groupingFields )
      fields.combine(entity.groupingFields);

    var fieldName, field;
    for ( var i = 0, l = fields.length; i < l; i++ ) {
      fieldName = fields[i];
      if ( typeOf(fieldName) === 'array' )
        fieldName = fieldName[1];

      if ( entity.fields[fieldName] )
        continue;

      field = defaults.fields[fieldName];
      if ( !field )
        throw new Error('ZeyOS missing field definition for (entity | field): ' +
          entity.entityName + ' | ' + fieldName);

      entity.fields[fieldName] = Object.clone(defaults.fields[fieldName]);
    }
  },

  _doInitFields: function(entity, defaults) {
    var field, fields = entity.fields;
    for ( var name in fields ) {
      if ( !fields.hasOwnProperty(name) )
        continue;

      field = fields[name];
      field.name = name;

      if ( field.defaultValue === undefined )
        field.defaultValue = defaults.defaultValue;

      if ( !field.displayType )
        field.displayType = defaults.displayType;

      if ( !field.valueType )
        field.valueType = defaults.valueType;

      if ( !field.inputType )
        field.inputType = defaults.inputType;

      if ( field.iconName && !field.iconVendor )
        field.iconVendor = defaults.iconVendor;

      // this._doInitSelectOptions(entity.modelName, field, name);

      if ( !field.implementation )
        field.implementation = defaults.implementation;
    }

  },

  // _doInitSelectOptions: function(entityName, field, fieldName) {
  //  if ( field.inputType !== 'select' )
  //    return;

  //  if ( typeof field.selectOptionsFromZeyos !== 'string' )
  //    return;

  //  key = entityName + '.fields.' + fieldName + '.selectOptions';
  //  field.selectOptions = this.resolveLabel(key);
  // }
};

gx.zeyosREST.EntitySchema.entities = {
  users: {
    "iconName" : "users",
    "modelName": "users",

    "defaultOrderField": "name",
    "defaultOrderType": "asc", // asc

    "standardViewFilterField": {
      "fieldName": "activity",
      "value": 0
    },

    "defaultFilterFields": [{
      "column": "activity",
      "value": 0,
      "condition": "="
    }],

    "assocFilterFields": [{
      "column": "activity",
      "value": 0,
      "condition": "="
    }],

    "fields": {},

    "detailSelectFields": [
      "lastmodified",
    ],
    "detailDisplayFields": [],

    "selectJoins": {},

    "listSelectFields": [
      "name",
      "email"
    ],

    "joinSelectFields": [
      "name",
      "email"
    ],

    "listDisplayFields": [
    ],
  },
  groups: {
    "iconName" : "groups",
    "modelName": "groups",

    "defaultOrderField": "name",
    "defaultOrderType": "asc", // asc

    "standardViewFilterField": {
      "fieldName": "activity",
      "value": 0
    },
    "defaultFilterFields": [{
      "column": "activity",
      "value": 0,
      "condition": "="
    }],

    "assocFilterFields": [{
      "column": "activity",
      "value": 0,
      "condition": "="
    }],

    "fields": {},

    "detailSelectFields": [
      "lastmodified",
    ],
    "detailDisplayFields": [],

    "selectJoins": {},

    "listSelectFields": [
      "name"
    ],

    "joinSelectFields": [
      "name"
    ],

    "listDisplayFields": [],
  },
};

gx.zeyosREST.EntitySchema._defaults = {
  "modelName": "defaults",

  "defaultTitleFieldName": "name",
  "standardViewFilterField": {
    "fieldName": "visibility",
    "value": 0
  },
  "defaultFilterFields": [{
    "column": "visibility",
    "value": 0
  }],
  "assocFilterFields": [{
    "column": "visibility",
    "value": [0, 1],
    "condition": "in"
  }],
  "defaultOrderField": "lastmodified",
  "defaultOrderType": "desc", // asc

  "defaultValue": "",

  // Specify the type, how this field is displayed in e.g.
  // list / detail views. Sample values:
  //  - text
  //  - tel
  //  - mail
  //  - ...
  //
  "displayType": "text",

  // Specify the type of the plain value:
  //  - text
  //  - date
  //  - datetime
  //  - time
  //  - integer | int
  //  - float
  //  - origin --- indicating to NOT touch the value
  //  - ...
  //
  //
  // ATTENTION:
  // It is important that the "valueType" and "inputType" harmonize with each
  // other. It is NOT possible to combine any value with each other. In some
  // cases you even might receive a JavaScript error.
  //
  "valueType": "text",

  // Specify the type, how the field is handled when editing.
  //  - text (html5 input types)
  //  - textarea
  //  - select
  //    (REQUIRE an additional "selectOptions" definition at the
  //    "inputType" level. Following zeyos: Defined as numeric array where the
  //    index equals the plain value of the option)
  //
  // ATTENTION: {@see valueType}
  "inputType": "text",

  // A concrete implementation of a field.
  "implementation": 'Text',

  // Defaults to the field name.
  "label": undefined,

  // The iconName refers to this vendor icon set.
  "iconVendor": "FontAwesome",

  // General fields. Properties:
  //  - name --- Will be set during initialization.
  //  - iconName --- The font awesome icon name.
  //  - onCreationDefaultValue
  //  - displayType {string}
  //  - valueType {string}
  //  - inputType {string}
  //  - fieldImplementation {object}
  //    - implementation
  //    - options
  //
  //  - isSortable {boolean} --- if === false do not add to this field the sort by select (ommitting means isSortable = true)
  //  - customFilter {mixed} --- if === false do not add to this field the custom filter select
  //
  // onCreationDefaultValue: this defines a field as dirty on creation.
  // Normaly dirty only values will be transported to the server, fields
  // marked with this property will also transport its value even so it
  // is not dirtied by the user when creating a new item.
  "fields": {
    "ID": {
      "valueType": "int"
    },

    "picbinfile": {
      "isSortable": false,
      "customFilter": false,
      "valueType": "origin"
    },
    "gravatar": {
      "isSortable": false,
      "customFilter": false
    },

    "identifier": {
      "iconName": "tag"
    },

    "visibility": {
      "valueType": "int",
      "inputType" : "select",
      "displayType" : "select",
      "selectOptionsFromZeyos": "global.visibilities",
      "selectOptionsLocaleKey": "defaults.fields.visibility.selectOptions",
      "implementation": "ArrSelect",
      "isSortable": false,
      "customFilter": false
    },

    "lastmodified": {
      "defaultValue": "<?=datenow?>",
      "displayType": "datetime",
      "valueType": "timestampSeconds",
      "inputType": "datetime-local"
    },
    "creationdate": {
      "defaultValue": "<?=datenow?>",
      "displayType": "datetime",
      "valueType": "timestampSeconds",
      "inputType": "datetime-local"
    },
    "datefrom": {
      "iconName": "thumb-tack",
      "inputType": "datetime-local",
      "valueType": "timestampSeconds",
      "displayType": "datetime",
    },
    "duedate": {
      "iconName": "thumb-tack",
      "inputType": "datetime-local",
      "valueType": "timestampSeconds",
      "displayType": "datetime",
    },
    "date": {
      "iconName": "thumb-tack",
      "inputType": "datetime-local",
      "valueType": "timestampSeconds",
      "displayType": "datetime",
    },
    "cell": {
      "iconName": "mobile-phone",
      "displayType": "tel"
    },
    "phone": {
      "iconName": "phone",
      "displayType": "tel"
    },
    "phone2": {
      "iconName": "phone",
      "displayType": "tel"
    },
    "fax": {
      "iconName": "fax",
      "displayType": "tel"
    },
    "country": {
      // A special field needs special treatment
      "iconName": "flag",
      "inputType" : "select",
      "displayType" : "select",
      // "selectOptions": "ZeyOSlocales::types",
      "selectOptionsLocaleKey": true,
      "implementation": "Countries"
    },
    "currency": {
      // A special field needs special treatment
      "iconName": "money",
      "inputType" : "select",
      "displayType" : "select",
      // "selectOptions": "ZeyOSlocales::types",
      "selectOptionsLocaleKey": true,
      "implementation": "Currencies"
    },
    "email": {
      "iconName": "envelope",
      "displayType": "mail",
      "inputType": "email"
    },
    "email2": {
      "iconName": "envelope",
      "displayType": "mail",
      "inputType": "email"
    },
    "birthdate": {
      "iconName": "birthday-cake",
      "inputType": "date",
      "valueType": "timestampSeconds",
      "displayType": "date"
    },
    "title": {
      "iconName": "tag"

    },
    "firstname": {
      "iconName": "bookmark-o"

    },
    "lastname": {
      "iconName": "bookmark",
      "required": true,
    },
    "name": {
      "iconName": "bookmark",
      "required": true,
    },
    "transactionnum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "opportunitynum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "customernum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "suppliernum": {
      "iconName": "folder-o",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "projectnum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "tasknum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "actionnum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "ticketnum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "itemnum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "contractnum": {
      "iconName": "folder",
      "defaultValue": "<?=numformat?>",
      "placeholder": "numformat"
    },
    "company": {
      "iconName": "building"
    },
    "position": {
      "iconName": "briefcase"

    },
    "department": {
      "iconName": "file"

    },
    "city": {},
    "address": {
      "iconName": "truck",
      "implementation": "Textarea",
      "inputType": "textarea"
    },
    "postalcode": {},
    "region": {},

    "color": {
      "iconName": "asterisk",
      "colors": ['FCC', 'CCF', 'CFC', 'FFC', 'FCF', 'CFF'],
      "displayType": "color",
      "implementation": "ColorSelector"
    },

    "website": {
      "iconName": "external-link",
      "displayType": "website",
      "inputType": "url"
    },

    "description": {
      "labelKey": "general.fields.description",
      "iconName": "pencil-square-o",
      "implementation": "Textarea",
      "inputType": "textarea"
    },

    "priority": {
      "defaultValue": "2",
      "iconName": "unsorted",
      "valueType" : "integer",
      "inputType" : "select",
      "displayType" : "select",
      "selectOptionsFromZeyos": "global.priorities",
      "selectOptionsLocaleKey": "defaults.fields.priority.selectOptions",
      "implementation": 'PriorityArrSelect'
    },

    "record": {},

    "contact": {
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "contacts",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "contacts",
      "entityAlias": "contacts"
    },

    "account": {
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "accounts",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "accounts",
      "entityAlias": "accounts"
    },

    "project": {
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "projects",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "projects",
      "entityAlias": "projects"
    },

    "ticket": {
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "tickets",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "tickets",
      "entityAlias": "tickets"
    },

    "task": {
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "tasks",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "tasks",
      "entityAlias": "tasks"
    },

    "creator": {
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "users",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "users",
      "entityAlias": "creator"
    },

    "assigneduser": {
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "users",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "users",
      "entityAlias": "assigneduser"
    },

    "owneruser": {
      "labelKey": "general.fields.owner",
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "groups",
      "valueType" : "association",
      "displayType" : "ownership",
      "inputType" : "association",
      "implementation": "EntityOwner",
      "entityName": "users",
      "entityAlias": "owneruser",

      "isSortable": false,
      "customFilter": false
    },

    "ownergroup": {
      "labelKey": "general.fields.owner",
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "groups",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityOwnergroup",
      "entityName": "groups",
      "entityAlias": "ownergroup",

      "isSortable": false,
      "customFilter": false
    },

    "stocktransactions" :{
      "iconVendor": "ZeyosModuleIcon",
      "iconName": "stocktransactions",
      "valueType" : "association",
      "displayType" : "association",
      "inputType" : "association",
      "implementation": "EntityAssociation",
      "entityName": "stocktransactions",
      "entityAlias": "stocktransactions"
    },
  },

  // Default constrains for reusability. Can be used by setting "inherit"
  // for a specific constrain in an entity. E.g.
  // constraints: {
  //   "owner": "inherit" // will receive "defaults.constraints.owner" properties
  // }
  "constraints": {
    "owner": {
      "localeKey": "error.owner",
      "conditions": [
        ["field::owneruser", "op::==", ""], '||', ["field::ownergroup", "op::==", ""], '||',
        ["field::owneruser", "op::==", null], '||', ["field::ownergroup", "op::==", null]
      ]
    },
    "visibility": {
      "conditions": [
        ["field::visibility", "op::===", undefined],
          "||",
        "(", ["field::visibility", "op::>=", 0], '&&', ["field::visibility", "op::<=", 2], ")"
      ]
    },
    "lastname": {
      "localeKey": "error.empty",
      "conditions": [
        ["field::lastname", "op::!=", '']
      ]
    },
    "name": {
      "localeKey": "error.empty",
      "conditions": [
        ["field::name", "op::!=", '']
      ]
    }
  },

  "selectJoins": {
    "contact": {
      "args": ["contact", "::entityTable", "LEFT"],
      "model": "contacts"
    },
    "account": {
      "args": ["account", "::entityTable", "LEFT"],
      "model": "accounts"
    },
    "ownergroup": {
      "args": ["ownergroup", "::entityTable", "LEFT", "ownergroup"],
      "model": "groups"
    },
    "owneruser": {
      "args": ["owneruser", "::entityTable", "LEFT", "owneruser"],
      "model": "users"
    },
    "assigneduser": {
      "args": ["assigneduser", "::entityTable", "LEFT", "assigneduser"],
      "model": "users"
    },
    "project": {
      "args": ["project", "::entityTable", "LEFT"],
      "model": "projects"
    },
    "ticket": {
      "args": ["ticket", "::entityTable", "LEFT"],
      "model": "tickets"
    },
    "task": {
      "args": ["task", "::entityTable", "LEFT"],
      "model": "tasks"
    },
    "creator": {
      "args": ["creator", "::entityTable", "LEFT", "creator"],
      "model": "users"
    },
    "stocktransactions": {
      "args": ["item", "stocktransactions"],
      "model": "stocktransactions"
    },
  },

  // Define columns for list select queries.
  // These names have to equal to zeyos database columns.
  "listSelectFields": ["ID"],

  // Define columns displayed in list views.
  // These names allow specific non zeyos database column names e.g.
  // ":addressShort". However if the name does not equal a concrete database
  // column thant it must be signaled with ":" as prefix. These columns
  // might call special functions for specialized visualization.
  "listDisplayFields": [],

  // Define columns displayed in detail views.
  // {@see listDisplayFields}
  "detailDisplayFields": [],

  // Define <legend> | panels positions for detail forms. The index of
  // items define the field position before which the legend should be
  // positioned.
  "detailLegendsByIndexes": {
    0: "masterdata"
  },

  // These fields get selected when joining the entity.
  "joinSelectFields": ["ID"],
};