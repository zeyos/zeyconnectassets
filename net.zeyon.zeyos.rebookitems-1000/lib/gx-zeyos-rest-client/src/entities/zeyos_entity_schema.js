var globalNameSpace;

if ( typeof exports !== 'undefined' && this.exports !== exports )
	globalNameSpace = module.exports;
else
	globalNameSpace = window;

(function(NameSpace) {

/**
 * JSON schema definition of the zeyos entities.
 *
 * @type {Object}
 */
var zeyosEntitySchemaJSON = {

	// Not existing properties in the concrete entity defintion
	// will default to these default values to prevent some level of duplication.
	"defaults": {
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
			}

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
			}
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
	},

	// There is no particular plural/singular convention, but entity names follow
	// the current state of the actual zeyos database schema table names
	// {@link https://schema.zeyos.com}.
	//
	// Properties:
	//  - defaults Reserved. Will be set as reference to this.defaults.
	//
	//  - iconName  The font awesome icon name.
	//  - modelName Redundant model name.
	//  - fields
	//  - detailSelectFields
	//  - detailDisplayFields
	//  - listSelectFields
	//  - listDisplayFields
	//
	//  - constraints {object} For validation
	//     constraints will receive their key as "name" property on initialization.
	//
	"entities": {

		/**
		 * #CATEGORIES
		 */
		"categories": {
			"iconName": "",
			"modelName": "categories",

			"defaultTitleFieldName": "name",
			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {},

			"constraints": {
				"name": "inherit",
			},

			"detailSelectFields": [],

			"selectJoins": {},

			"detailDisplayFields": [],

			"listSelectFields": [
				"name",
			],

			"listDisplayFields": [
				"name",
			]
		},

		/**
		 * #TAGS
		 */
		"tags": {
			"iconName": "",
			"modelName": "tags",

			"defaultTitleFieldName": "name",
			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {},

			"constraints": {
				"name": "inherit",
			},

			"detailSelectFields": [],

			"selectJoins": {},

			"detailDisplayFields": [],

			"listSelectFields": [
				"name",
			],

			"listDisplayFields": [
				"name",
			]
		},

		/**
		 * #TAGS by entity
		 * Special collection/model schema to select tags of a specific entity since
		 * direct access to tags is not allowed.
		 */
		"entityTags": {
			"iconName": "tag",
			"modelName": "entityTags",

			"defaultTitleFieldName": "name",
			"defaultOrderField": "tags.name",
			"defaultOrderType": "asc", // asc

			"fields": {},

			"constraints": {
				"name": "inherit",
			},

			"detailSelectFields": [],

			"selectJoins": {},

			"detailDisplayFields": [],

			"noListSelectFieldsMerge": true,
			"listSelectFields": [
				// This will guarantee with an distinct select that there is every
				// tags once only and help for easier managing on client side
				["tags.name", "ID"],
				["tags.name", "name"],
			],

			"listDisplayFields": []
		},

		/**
		 * #ACCOUNTS
		 */
		"accounts": {
			"iconName": "",
			"modelName": "accounts",

			"defaultTitleFieldName": "lastname",
			"defaultOrderField": "lastname",
			"defaultOrderType": "asc", // asc

			"fields": {
				"type": {
					"defaultValue": "0",
					"iconName": "paperclip",
					"valueType" : "integer",
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "types",
					"selectOptionsLocaleKey": true,
					"implementation": 'ArrSelect'
				},
				"locked": {
					"defaultValue": 0,
					"iconName": "lock",
					"valueType" : "integer",
					"inputType" : "checkbox",
					"displayType" : "checkbox",
					"implementation" : "Checkbox",
				},
				"excludetax": {
					"defaultValue": 0,
					"iconName": "info-circle",
					"valueType" : "integer",
					"inputType" : "checkbox",
					"displayType" : "checkbox",
					"implementation" : "Checkbox",
				}
			},

			"constraints": {
				"visibility": "inherit",
				"lastname": "inherit",
				"type": {
					"conditions": [
						["field::type", "op::>=", 0], '&&', ["field::type", "op::<=", 4]
					]
				},
				// The following things will be enforced with enhanced form methods
				// "customernum" : "..."
				// "suppliernum" : "..."
				// "currency" : "..."
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"visibility",
				"contact",
				"customernum",
				"suppliernum",
				"currency",
				"locked",
				"excludetax",
				"description",
				"ownergroup"
			],

			"selectJoins": {
				"contact": "inherit",
				"ownergroup": "inherit"
			},

			"detailDisplayFields": [
				"lastname",
				"firstname",
				"type",
				"ownergroup",
				"contact",
				"customernum",
				"suppliernum",
				"currency",
				"locked",
				"excludetax",
				"description",
			],

			"listSelectFields": [
				"firstname",
				"lastname",
				"type",
				"customernum",
				"suppliernum",
				"currency",
			],

			"listDisplayFields": [
				"customernum",
				"suppliernum",
				"currency",
			],

			"joinSelectFields": [
				"firstname",
				"lastname",
			],

			"groupingFields": [
				"assigneduser",
				"creator",
				"type",
			],

		},



		/**
		 * #OPPORTUNITIES
		 */
		"opportunities": {
			"iconName": "",
			"modelName": "opportunities",
			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {
				"status": {
					"defaultValue": "0",
					"iconName": "list-alt",
					"valueType" : "integer",
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "statuses",
					"selectOptionsLocaleKey": true,
					"implementation": 'ArrSelect'
				},
				"probability": {
					"iconName": "calculator",
					"displayType": "percent"
				},
				"worstcase": {
					"iconName": "arrow-circle-o-down",
					"valueType": "float",
					"inputType": "number",
					"displayType": "money",
					"implementation": "Formatted",
					"formatType": "money"
				},
				"mostlikely": {
					"iconName": "arrow-circle-o-right",
					"valueType": "float",
					"inputType": "number",
					"displayType": "money",
					"implementation": "Formatted",
					"formatType": "money"
				},
				"upside": {
					"iconName": "arrow-circle-o-up",
					"valueType": "float",
					"inputType": "number",
					"displayType": "money",
					"implementation": "Formatted",
					"formatType": "money"
				},
			},

			"constraints": {
				"name": "inherit",
				"upside": {
					"localeKey": "error.greator.equal.zero",
					"conditions": [
						["field::upside", "op::>=", 0]
					]
				},
				"mostlikely": {
					"localeKey": "error.greator.equal.zero",
					"conditions": [
						["field::mostlikely", "op::>=", 0]
					]
				},
				"worstcase": {
					"localeKey": "error.greator.equal.zero",
					"conditions": [
						["field::worstcase", "op::>=", 0]
					]
				},
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"visibility",
				"assigneduser",
				"ownergroup",
				"account",
				"contact",
				"worstcase",
				"mostlikely",
				"upside",
				"description",
			],

			"selectJoins": {
				"contact": "inherit",
				"account": "inherit",
				"ownergroup": "inherit",
				"assigneduser": "inherit"
			},

			"detailDisplayFields": [
				"name",
				"opportunitynum",
				"ownergroup",
				"assigneduser",
				"account",
				"contact",
				"duedate",
				"status",
				"priority",
				"probability",
				"worstcase",
				"mostlikely",
				"upside",
				"description",
			],

			"listSelectFields": [
				"name",
				"opportunitynum",
				"duedate",
				"status",
				"priority",
				"probability",
			],

			"listDisplayFields": [
				"duedate",
				"status",
				"priority",
				"probability",
			],

			"groupingFields": [
				"account",
				"assigneduser",
				"contact",
				"priority",
				"status",
				"creator",
			],
		},


		/**
		 * #CONTACTS
		 */
		"contacts": {
			"iconName" : "user",
			"modelName": "contacts",

			"defaultTitleFieldName": "lastname",
			"defaultOrderField": "lastname",
			"defaultOrderType": "asc", // asc

			"fields": {
				"type": {
					"defaultValue": "1",
					"iconName": "paperclip",
					"valueType" : "integer",
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "types",
					"selectOptionsLocaleKey": true,
					"implementation": 'ArrSelect'
				}
			},

			"constraints": {
				"owner": "inherit",
				"visibility": "inherit",
				"lastname": "inherit",
				"type": {
					"conditions": [
						["field::type", "op::==", 0], '||', ["field::type", "op::==", 1]
					]
				},
				"typeFields": {
					"conditions": [
						["field::type", "op::==", 1], '||', "(",
							["field::title", "op::==", ''], '&&',
							["field::company", "op::==", ''], '&&',
							["field::position", "op::==", ''], '&&',
							["field::department", "op::==", ''],
						")"
					]
				}
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"owneruser",
				"ownergroup",
				"assigneduser",
				"visibility",
				"title",
				"position",
				"department",
				"address",
				"region",
				"phone2",
				"fax",
				"email2",
				"website",
				"birthdate",
				"description",
				"picbinfile",
				"gravatar"
			],

			"selectJoins": {
				"owneruser": "inherit",
				"ownergroup": "inherit",
				"assigneduser": "inherit"
			},

			"detailDisplayFields": [
				"lastname",
				"firstname",

				"owneruser",
				"assigneduser",

				"title",
				"type",

				"description",

				"company",
				"position",
				"department",

				"address",
				"postalcode",
				"city",
				"region",
				"country",

				"phone",
				"phone2",
				"cell",
				"fax",
				"email",
				"email2",
				"website",
				"birthdate",
			],

			"detailLegendsByIndexes": {
				8: "contactdata"
			},

			"listSelectFields": [
				"firstname",
				"lastname",
				"type",
				"company",
				"country",
				"postalcode",
				"city",
				"phone",
				"cell",
				"email",
				"assigneduser",
			],

			"joinSelectFields": [
				"firstname",
				"lastname",
				"type"
			],

			"listDisplayFields": [
				":addressShort",
				"phone",
				"cell",
				"email"
			],

			"groupingFields": [
				"assigneduser",
				"city",
				"company",
				"country",
				"creator",
				"department",
				"position",
				"postalcode",
				"region",
				"type",
			],

		},


		/**
		 * #TASKS
		 */
		"tasks": {
			"iconName" : "tasks",
			"modelName": "tasks",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {
				"status": {
					"defaultValue": "0",
					"iconName": "list-alt",
					"valueType" : "integer",
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "statuses",
					"selectOptionsLocaleKey": true,
					"implementation": 'ArrSelect'
				},

				"projectedeffort": {
					"iconName": "clock-o",
					"valueType": "duration",
					"displayType" : "duration",
					"inputType" : "duration"
				}
			},

			"constraints": {
				"name": "inherit",
			},

			"selectJoins": {
				"owneruser": "inherit",
				"ownergroup": "inherit",
				"assigneduser": "inherit",
				"project": "inherit"
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"owneruser",
				"ownergroup",
				"assigneduser",
				"visibility",
				"project",
				// "ticket",
				"datefrom",
				"duedate",
				"description"
			],
			"detailDisplayFields": [
				"name",
				"tasknum",

				"owneruser",
				"assigneduser",

				"project",
				// "ticket",
				"datefrom",
				"duedate",
				"status",
				"priority",
				"projectedeffort",
				"description"
			],

			"joinSelectFields": [
				"name",
				"tasknum",
			],

			"listSelectFields": [
				"name",
				"tasknum",
				"status",
				"priority",
				"projectedeffort"
			],

			"listDisplayFields": [
				"status",
				"priority",
				"projectedeffort"
			],

			"groupingFields": [
				"assigneduser",
				"priority",
				"project",
				"status",
				"ticket",
				"creator",
			],
		},


		/**
		 * #ACTIONSTEPS
		 */
		"actionsteps": {
			"iconName" : "actionsteps",
			"modelName": "actionsteps",

			"standardViewFilterField": null,
			"defaultFilterFields": null,

			"assocFilterFields": [{
				"column": "status",
				"value": [0, 3],
				"condition": "b"
			}],

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {
				"status": {
					"defaultValue": "0",
					"iconName": "list-alt",
					"valueType" : "integer",
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "statuses",
					"selectOptionsLocaleKey": true,
					"implementation": 'ArrSelect',
					"disabled": true
				},
				"effort": {
					"defaultValue": "0",
					"iconName": "clock-o",
					"valueType": "duration",
					"displayType" : "duration",
					"inputType" : "duration",
					"implementation": 'Duration',

				}

			},

			"constraints": {
				"name": "inherit",
				"effort": {
					"localeKey": "error.greator.equal.zero",
					"conditions": [
						["field::effort", "op::>=", 0]
					]
				}
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"assigneduser",
				"owneruser",
				"ownergroup",
				"task",
				// "ticket",
				// "account",
				"description",
			],

			"detailDisplayFields": [
				"name",
				"actionnum",
				"owneruser",
				"assigneduser",
				"task",
				// "ticket",
				// "account",
				"date",
				"status",
				"effort",
				"description",
			],

			"selectJoins": {
				"owneruser": "inherit",
				"ownergroup": "inherit",
				"assigneduser": "inherit",
				"task": "inherit"
			},

			"listSelectFields": [
				"name",
				"actionnum",
				"date",
				"status",
				"effort",
			],

			"joinSelectFields": [
				"name",
				"actionnum",
			],

			"listDisplayFields": [
				"date",
				"status",
				"effort",
			],

			"groupingFields": [
				"account",
				"task",
				"assigneduser",
				"status",
				"ticket",
				"creator",
			],
		},


		/**
		 * #APPOINTMENTS
		 */
		"appointments": {
			"iconName" : "appointments",
			"modelName": "appointments",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {
				"interval": {
					"iconName": "clock-o",
					"defaultValue": "1",
					"inputType": "number",
				},
				"location": {
					"iconName": "location-arrow"
				},
				"recurrence": {
					"iconName": "refresh",
					"valueType": "int",
					"defaultValue": null,
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "calendar.recurrence",
					"selectOptionsLocaleKey": true,
					"implementation": 'ArrSelect',
					"addNonValueLocale": "field.appointments.recurrence.option.none"
				},
				"dateto": {
					"defaultValue": "<?=datenow?>",
					"onCreationDefaultValue": true,
					"iconName": "calendar-o",
					"inputType": "datetime-local",
					"valueType": "timestampSeconds",
					"displayType": "datetime",
				},
				"datefrom": {
					"defaultValue": "<?=datenow?>",
					"onCreationDefaultValue": true,
					"iconName": "calendar-o",
					"inputType": "datetime-local",
					"valueType": "timestampSeconds",
					"displayType": "datetime",
				},
				"daterecurrence": {
					"iconName": "calendar-o",
					"inputType": "datetime-local",
					"valueType": "timestampSeconds",
					"displayType": "datetime",
				}

			},

			"constraints": {
				"name": "inherit",
				"datefrom": {
					"localeKey": "error.appointment.start.date",
					"conditions": [
						["field::datefrom", "op::!=", ""]
					]
				},
				"dateto": {
					"localeKey": "error.dateto.greater.datefrom",
					"conditions": [
						["field::dateto", "op::>", "field::datefrom"]
					]
				},
				"interval": {
					"localeKey": "error.interval.greater.zero",
					"conditions": [
						["field::interval", "op::>", 0]
					]
				}
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"owneruser",
				"ownergroup",
				"assigneduser",
				"recurrence",
				"interval",
				"daterecurrence",
				"description"
			],
			"detailDisplayFields": [
				"name",
				"location",
				"owneruser",
				"assigneduser",
				"datefrom",
				"dateto",
				"color",
				"recurrence",
				"interval",
				"daterecurrence",
				"description"
			],

			"selectJoins": {
				"owneruser": "inherit",
				"ownergroup": "inherit",
				"assigneduser": "inherit"
			},

			"listSelectFields": [
				"visibility",
				"name",
				"location",
				"datefrom",
				"dateto",
				"color",
				"recurrence",
				"interval"
			],

			"joinSelectFields": [
				"name",
				"color"
			],

			"listDisplayFields": [
				// "location",
				"datefrom",
				"dateto",
				"color",
				"recurrence"
			],

			"groupingFields": [
				"assigneduser",
				"creator",
				"recurrence",
			],
		},


		/**
		 * #NOTES
		 */
		"notes": {
			"iconName" : "notes",
			"modelName": "notes",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {
				"text": {
					"iconName": "sticky-note",
					"inputType": "multicontent",
					"displayType": "multicontent",
					"implementation": "MultiContent",
					"contentTypes": ["text", "html"],
					"contentTypeFieldName": "contenttype",
				},

				"status": {
					"defaultValue": "0",
					"iconName": "list-alt",
					"valueType" : "integer",
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "statuses",
					"selectOptionsLocaleKey": true,
					"implementation": 'ArrSelect'
				},

				"contenttype": {}
			},

			"constraints": {
				"name": "inherit"
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"owneruser",
				"ownergroup",
				"assigneduser",
				"description",
				"text",
				"contenttype"
			],
			"detailDisplayFields": [
				"name",
				"owneruser",
				"assigneduser",
				"status",
				"description",
				"text"
			],

			"selectJoins": {
				"creator": "inherit",
				"owneruser": "inherit",
				"ownergroup": "inherit",
				"assigneduser": "inherit"
			},

			"listSelectFields": [
				"visibility",
				"name",
				"status",
				"assigneduser",
			],

			"joinSelectFields": [
				"name"
			],

			"listDisplayFields": [
				"visibility",
				"assigneduser",
				"status",
				"lastmodified"
			],

			"groupingFields": [
				"assigneduser",
				"contenttype",
				"status",
				"creator",
			],
		},



		/**
		 * #EVENTS
		 */
		"events": {
			"iconName" : "events",
			"modelName": "events",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {
				"dateto": {
					"defaultValue": "<?=datenow?>",
					"onCreationDefaultValue": true,
					"iconName": "calendar-o",
					"inputType": "datetime-local",
					"valueType": "timestampSeconds",
					"displayType": "datetime",
				},
				"datefrom": {
					"defaultValue": "<?=datenow?>",
					"onCreationDefaultValue": true,
					"iconName": "calendar-o",
					"inputType": "datetime-local",
					"valueType": "timestampSeconds",
					"displayType": "datetime",
				},
				"entity": {
					"valueType": "origin",
					"isSortable": false
				},
				"index": {
					"isSortable": false

				}
			},

			"constraints": {
				"name": "inherit",
				"datefrom": {
					"localeKey": "error.appointment.start.date",
					"conditions": [
						["field::datefrom", "op::!=", ""]
					]
				},
				"dateto": {
					"localeKey": "error.dateto.greater.datefrom",
					"conditions": [
						["field::dateto", "op::>", "field::datefrom"]
					]
				}
			},

			"detailSelectFields": [
				"lastmodified",
				"creationdate",
				"owneruser",
				"ownergroup"
			],
			"detailDisplayFields": [
				"name",
				"owneruser",
				"datefrom",
				"dateto",
				"color",
			],

			"selectJoins": {
				"owneruser": "inherit",
				"ownergroup": "inherit"
			},

			"listSelectFields": [
				"name",
				"datefrom",
				"dateto",
				"color",
				"entity",
				"index"
			],

			"joinSelectFields": [
				"name",
				"color"
			],

			"listDisplayFields": [
				"datefrom",
				"dateto",
				"color"
			],
		},


		/**
		 * #MINDLOG / RECORDS
		 *
		 * !! ATTENTION !! : This model schema is strongly connected to the
		 * zeylib REST api extension "zeyos-mobile". DO NOT TOUCH unless you know!
		 */
		"records": {
			"iconName" : "mindlog",
			"modelName": "records",

			"customApiRoute": "extensions/zeyos-mobile-records-1.3",

			"defaultFilterFields": null,

			"assocFilterFields": [{
				"column": "flag",
				"value": 0,
				"condition": "="
			}],

			"fields": {
				"assigneduser": {
					"iconVendor": "ZeyosModuleIcon",
					"iconName": "users",
					"valueType" : "association",
					"displayType" : "association",
					"inputType" : "association",
					"implementation": "EntityAssociation",
					"canAssignToMe": false,
					"entityName": "users",
					"entityAlias": "assigneduser"
				},
				"entity": {
					"isSortable": false,
					"customFilter": false
				},
				"index": {
					"isSortable": false,
					"customFilter": false
				},
				"flag": {
					"valueType": "integer",
					"isSortable": false,
					"customFilter": false
				},
				"sender": {
					"isSortable": false,
					"customFilter": false
				},
				"text": {
					"iconName": "paragraph",
					"implementation": "Textarea",
					"valueType": "html",
					"inputType": "textarea"
				},
				"meta": {
					"valueType": "json"
				},
				"date": {
					"valueType": "timestampSeconds",
					"displayType": "datetimepretty"
				},

				"comments": {
					"valueType": "origin"
				},
				"follow": {
					"valueType": "int"
				},
				"like": {
					"valueType": "int"
				},
				"likesCount": {
					"valueType": "int"
				},
				"files": {
					"iconName": "upload",
					"implementation": "File",
					"displayType": "files",
					"valueType": "file",
					"inputType:": "file",
				},
				"associations": {
					"valueType": "origin"
				},
				"entityItem": {
					"valueType": "origin"
				},

				"creator": {},
				"creatorContact": {},
				"assigneduserContact": {},
				"notification": {},
			},

			"constraints": {
				"text": {
					"localeKey": "error.invalid.record",
					"conditions": [
						["field::text", "op::!=", ""],
						'||',
						["field::files", "op::!=", ""]

					]
				},
				"files": {
					"localeKey": "error.invalid.record",
					"conditions": [
						["field::text", "op::!=", ""],
						'||',
						["field::files", "op::!=", ""]
					]
				}
			},

			"noList2DetailSelectFieldsMerge": true,
			"detailSelectFields": [
				"ID",
				"lastmodified",
				"creationdate",
				// "creator",
				"owneruser",
				"ownergroup",
				"entity",
				"index",
				"entityItem",
				"flag",
				"date",
				"sender",
				"text",
				"meta",

				"follow",
				"like",
				"comments",
				"likesCount",
				"files",
				"associations",

				"creator",
				"creatorContact",
				"assigneduser",
				"assigneduserContact",
				"notification"
			],

			"detailDisplayFields": [
				"text",
				"owneruser",
				"assigneduser",
				"files"
			],

			// ATTENTION: These joins are hardcoded in
			// the appropriate zeylib-extension for this model. Do not change
			// until you change this extension as well
			"selectJoins": {
				"creator": {
					"args": ["creator", "records", "LEFT", "creator"],
					"model": "users",
					"joinSelectFields": ["ID", "name", "email"]
				},
				"creatorContact": {
					"args": ["contact", "users", "LEFT", {"users": "creator", "contacts": "creatorContact"}],
					"model": "contacts",
					"joinSelectFields": ["ID", "picbinfile", "gravatar"]
				},
				"assigneduser": {
					"args": ["assigneduser", "records", "LEFT", "assigneduser"],
					"model": "users",
					"joinSelectFields": ["ID", "name", "email"]
				},
				"assigneduserContact": {
					"args": ["contact", "users", "LEFT", {"users": "assigneduser", "contacts": "assigneduserContact"}],
					"model": "contacts",
					"joinSelectFields": ["ID", "picbinfile", "gravatar"]
				},
				"notification": {
					"args": ["ID", "records", "LEFT", 'notification'],
					"model": "notifications",
					"joinSelectFields": ["ID"]
				},
			},

			"detailLegendsByIndexes": null,

			// ATTENTION: These columns are hardcoded in
			// the appropriate zeylib-extension for this model. Do not change
			// until you change this extension as well
			"listSelectFields": [
				"lastmodified",
				"creationdate",
				// "creator",
				"owneruser",
				"ownergroup",
				"entity",
				"index",
				"entityItem",
				"flag",
				"date",
				"sender",
				"text",
				"meta",

				"follow",
				"like",
				"comments",
				"likesCount",
				"files",
				"associations",

				"creator",
				"creatorContact",
				"assigneduser",
				"assigneduserContact",
				"notification"
			],

			"listDisplayFields": [
				"text"
			]
		},


		/**
		 * #RECORDS COMMENTS
		 *
		 * !! ATTENTION !! : This model schema is strongly connected to the
		 * zeylib REST api extension "zeyos-mobile". DO NOT TOUCH unless you know!
		 */
		"comments": {
			"modelName": "comments",

			"defaultFilterFields": null,
			"assocFilterFields": null,

			"defaultOrderField": "creationdate",
			"defaultOrderType": "asc",

			"fields": {
				"creationdate": {
					"valueType": "timestampSeconds",
					"displayType": "datetimepretty"
				},
				"sender": {},
				"text": {
					"valueType": "html",
				},
				"creatorContact": {}
			},

			"detailSelectFields": [
				"record",
				"creator",
				"text"
			],
			"detailDisplayFields": [
				"text"
			],

			"selectJoins": {
				"creator": {
					"args": ["creator", "comments", "LEFT", "creator"],
					"model": "users",
					"joinSelectFields": ["ID", "name", "email"]
				},
				"creatorContact": {
					"args": ["contact", "users", "LEFT", {"users": "creator", "contacts": "creatorContact"}],
					"model": "contacts",
					"joinSelectFields": ["ID", "picbinfile", "gravatar"],
					"nestedJoin": true
				},
			},

			"listSelectFields": [
				"record",
				"creationdate",
				"text",
				"creator",
				"creatorContact"
			],

			"listDisplayFields": [
			],
		},


		/**
		 * #RECORDS LIKES
		 */
		"likes": {
			"modelName": "likes",

			"defaultFilterFields": null,
			"assocFilterFields": null,

			"defaultOrderField": "ID",
			"defaultOrderType": "asc", // asc

			"defaultOrderField": "creationdate",
			"fields": {
				"creatorContact": {}
			},

			"detailSelectFields": [
			],
			"detailDisplayFields": [],

			"selectJoins": {
				"creator": {
					"args": ["creator", "likes", "LEFT", "creator"],
					"model": "users"
				},
				"creatorContact": {
					"args": ["contact", "users", "LEFT", {"users": "creator", "contacts": "creatorContact"}],
					"model": "contacts",
					"joinSelectFields": ["ID", "picbinfile", "gravatar"],
					"nestedJoin": true
				},
			},

			"joinSelectFields": ["ID"],

			"listSelectFields": [
				"creator",
				"creationdate",
				"creatorContact"
			],

			"listDisplayFields": [
			],
		},


		/**
		 * #RECORDS FILES
		 *
		 * !! ATTENTION !! : This model schema is strongly connected to the
		 * zeylib REST api extension "zeyos-mobile". DO NOT TOUCH unless you know!
		 */
		"files": {
			"modelName": "files",

			"defaultFilterFields": null,
			"assocFilterFields": null,

			"defaultOrderField": "ID",

			"fields": {
				"filename": {},
				"mimetype": {},
				"size": {},
				"binfile": {}
			},

			"detailSelectFields": [
			],
			"detailDisplayFields": [],

			"selectJoins": {},

			"listSelectFields": [
				"record",
				"filename",
				"mimetype",
				"size",
				"binfile",
			],

			"listDisplayFields": [
			],
		},


		/**
		 * #NOTIFICATIONS
		 */
		"notifications": {
			"modelName": "notifications",

			"defaultFilterFields": null,
			"assocFilterFields": null,

			"defaultOrderField": "date",

			"fields": {
				"date": {},
				"flag": {
					"valueType": "int"
				}
			},

			"detailSelectFields": [],
			"detailDisplayFields": [],

			"selectJoins": {},

			"listSelectFields": [
				"date",
				"flag",
			],

			"listDisplayFields": [],
		},


		/**
		 * #TICKETS
		 * this entity is for list views only. To set tasks tickets.
		 */
		"tickets": {
			"iconName" : "tickets",
			"modelName": "tickets",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],

			"selectJoins": {},

			"listSelectFields": [
				"name",
				"ticketnum",
			],

			"joinSelectFields": [
				"name",
				"ticketnum"
			],

			"listDisplayFields": [
				"ticketnum",
			],
		},


		/**
		 * #PROJECTS
		 * this entity is for list views only. To set tasks projects.
		 */
		"projects": {
			"iconName" : "projects",
			"modelName": "projects",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"fields": {},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],

			"selectJoins": {},

			"listSelectFields": [
				"name",
				"projectnum",
			],

			"joinSelectFields": [
				"name"
			],

			"listDisplayFields": [
				"projectnum",
			],
		},


		/**
		 * #GROUPS
		 * this entity is for list views only. To set ownership.
		 * This entity is bound to special rules and processing.
		 * DO NOT TOUCH unless you know what you do.
		 */
		"groups": {
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


		/**
		 * #USERS
		 * this entity is for list views only. To set ownership.
		 */
		"users": {
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


		/**
		 * #MESSAGES
		 */
		"messages": {
			"iconName" : "messages",
			"modelName": "messages",

			"standardViewFilterField": {
				"fieldName": "mailbox",
				"value": 0
			},

			"defaultFilterFields": [{
				"column": "mailbox",
				"value": 0
			}],

			"assocFilterFields": [{
				"column": "mailbox",
				"value": 0
			}],

			"defaultOrderField": "date",
			"defaultOrderType": "desc",

			"fields": {
				"subject": {},
				"to": {},
				"sender": {},
				"cc": {},
				"bcc": {},
				"to_email": {},
				"to_name": {},
				"sender_name": {},
				"sender_email": {},
				"flag": {
					"valueType": "int"
				},
				"date": {
					"iconName": "clock-o",
					"displayType": "datetimeverbose",
					"valueType": "timestampSeconds",
					"inputType": "displayType",
				},
				"contenttype": {},
				"text": {
					"inputType": "multicontent",
					"displayType": "multicontent",
					"implementation": "MultiContent",
					"contentTypes": ["text", "html"],
					"contentTypeFieldName": "contenttype",
				},
				"mailbox": {
					"valueType": "int",
					"inputType" : "select",
					"displayType" : "select",
					"selectOptionsFromZeyos": "mailboxes",
					"selectOptionsLocaleKey": true,
					"implementation": "ArrSelect",
					"isSortable": false,
					"customFilter": false
				}
			},

			"groupingFields": [
				"date",
				"to",
				"contenttype",
				// "mailserver",
				// "mailinglist",
				"ticket",
				"creator",
				"sender",
			],

			"detailSelectFields": [
				"sender",
				"to",

				"lastmodified",
				"owneruser",
				"ownergroup",
				"ticket",
				"text",
				"contenttype",

				"cc",
				"bcc"
			],
			"detailDisplayFields": [
				"owneruser",
				"ticket",
				"text"
			],
			"selectJoins": {},

			"listSelectFields": [
				"date",
				"subject",
				"sender_name",
				"sender_email",
				"to_name",
				"to_email",
				"flag",
				"mailbox",
			],

			"joinSelectFields": [],
			"listDisplayFields": [
				":email_recipient",
				"date",
			],
		},


		/**
		 * #MAILINGLISTS
		 */
		"mailinglists": {
			"iconName" : "mailinglists",
			"modelName": "mailinglists",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,

			"fields": {
				"sender": {}
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"sender",
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #LINKS
		 */
		"links": {
			"iconName" : "links",
			"modelName": "links",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
				"url": {}
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"url"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #TRANSACTIONS
		 */
		"transactions": {
			"iconName" : "transactions",
			"modelName": "transactions",

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
				"type": {}
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"transactionnum",
				"type"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #PAYMENTS
		 */
		"payments": {
			"iconName" : "payments",
			"modelName": "payments",

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
				"subject": {}
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"subject"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #CONTRACTS
		 */
		"contracts": {
			"iconName" : "contracts",
			"modelName": "contracts",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"contractnum"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #CAMPAIGNS
		 */
		"campaigns": {
			"iconName" : "campaigns",
			"modelName": "campaigns",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #ITEMS
		 */
		"items": {
			"iconName" : "items",
			"modelName": "items",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"itemnum"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #STORAGES
		 */
		"storages": {
			"iconName" : "storages",
			"modelName": "storages",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #PRICELISTS
		 */
		"pricelists": {
			"iconName" : "pricelists",
			"modelName": "pricelists",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #RESOURCES
		 */
		"resources": {
			"iconName" : "resources",
			"modelName": "resources",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"identifier"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #WEBLETS
		 */
		"weblets": {
			"iconName" : "weblets",
			"modelName": "weblets",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"identifier"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #SERVICES
		 */
		"services": {
			"iconName" : "services",
			"modelName": "services",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"identifier"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #EXTDATAFORMS
		 */
		"extdataforms": {
			"iconName" : "extdataforms",
			"modelName": "extdataforms",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"identifier"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},


		/**
		 * #APPLICATIONS
		 */
		"applications": {
			"iconName" : "applications",
			"modelName": "applications",

			"defaultOrderField": "name",
			"defaultOrderType": "asc", // asc

			"defaultFilterFields": null,
			"assocFilterFields": null,
			"fields": {
			},

			"detailSelectFields": [
				"lastmodified",
			],
			"detailDisplayFields": [],
			"selectJoins": {},

			"listSelectFields": [
				"name",
				"identifier"
			],

			"joinSelectFields": [],
			"listDisplayFields": [],
		},

	}

};

/**
 * ATTENTION:
 * You have to initialize this component by yourself. AFTER you have initialized
 * your localization implementation by calling zeyosEntitySchema.doInit();
 *
 * @type {Object}
 */
var zeyosEntitySchema = {
	_isInit: {},
	_defaults: zeyosEntitySchemaJSON.defaults,

	_fieldsNameSpace: {
		Text: null,
		ArrSelect: null,
		ObjSelect: null,
		PriorityArrSelect: null,
		Checkbox: null,
		Textarea: null,
		Countries: null,
		Currencies: null,
		EntityAssociation: null,
		EntityOwner: null,
		EntityOwnergroup: null,
		Formatted: null,
		ColorSelector: null,
		Duration: null,
		File: null,
		MultiContent: null,
	},

	resolveLabel: null,

	doInit: function(fields, resolveLabel) {
		var name;
		for ( name in this._fieldsNameSpace ) {
			if ( !this._fieldsNameSpace.hasOwnProperty(name) )
				continue;

			this._fieldsNameSpace[name] = fields[name];
		}

		this.resolveLabel = resolveLabel;

		this._defaults.implementation = this._fieldsNameSpace[this._defaults.implementation];

		this._doInitFields(this._defaults, this._defaults);
	},

	get: function(name) {
		var entity = zeyosEntitySchemaJSON.entities[name];

		if ( !entity )
			throw new Error("Entity does not exist: " + name);

		if ( !this._isInit[name] ) {
			entity = zeyosEntitySchemaJSON.entities[name] = this._doInitEntity(entity, name);
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
		// 	var dif = entity.groupingFields.differencesTo(entity.listSelectFields);
		// 	if ( dif.length > 0 ) {
		// 		throw new Error('InvalidSchemaDefinition: Grouping fields must be listSelectFields either. Missing select fields are: ' + dif.join(','));
		// 	}
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
			else if ( typeof field.implementation === 'string' )
				field.implementation = this._fieldsNameSpace[field.implementation];
		}

	},

	// _doInitSelectOptions: function(entityName, field, fieldName) {
	// 	if ( field.inputType !== 'select' )
	// 		return;

	// 	if ( typeof field.selectOptionsFromZeyos !== 'string' )
	// 		return;

	// 	key = entityName + '.fields.' + fieldName + '.selectOptions';
	// 	field.selectOptions = this.resolveLabel(key);
	// }
};

/**
 * Validating constraints of the zeyos entity schema against data objects.
 *
 * @type {Object}
 */
var schemaValidator = {

	check: function(schema, data) {
		// console.log(schema, data);
		var name, constrain, invalid = [];
		for ( name in schema ) {
			if ( !schema.hasOwnProperty(name) )
				continue;

			constrain = schema[name];
			if ( this.enforceConditions(constrain.conditions, data) === false )
				invalid.push(constrain);
		}

		return invalid.length === 0 ? true : invalid;
	},

	enforceConditions: function(conditions, data) {
		var i, l, expression, isType;
		var nestedLvl = [];
		var conditionStack = [];
		var expect = 'exp';
		for ( i = 0, l = conditions.length; i < l; i++ ) {
			expression = conditions[i];

			if ( expression === '(' ) {
				nestedLvl.push(conditionStack);
				conditionStack = [];
				continue;
			}

			if ( expression === ')' ) {
				if ( nestedLvl.length === 0 )
					throw new Error('InvalidArgumentException: Invalid parenthesised conditions ' +
						'in: ' + JSON.stringify(conditions, null, '\t'));

				var stackResult = this.closeConditionStack(conditions, conditionStack, data);
				conditionStack = nestedLvl.pop();
				conditionStack.push(stackResult);

			} else {
				isType = (
					typeof expression === 'string' ?
					'op' :
					'exp'
				);

				if ( expect === 'op' ) {
						if ( isType === 'exp' ) {
							// default to &&
							conditionStack.push('&&');
							expect = 'op';

						} else {
							expression = this.parseOperator(expression);
							expect = 'exp';
						}
				} else { // if ( expect === 'exp' )
					if ( isType === 'op' )
						throw new Error('InvalidArgumentException: Invalid expression-operator order ' +
							'for conditions: ' + JSON.stringify(conditions, null, '\t'));

					expect = 'op';
				}

				conditionStack.push(expression);
			}

			if ( conditionStack.length > 2 )
				this.testConditionStack(conditionStack, data);
		}

		if ( nestedLvl.length !== 0 )
			throw new Error('InvalidArgumentException: Invalid parenthesised conditions ' +
				'in: ' + JSON.stringify(conditions, null, '\t'));

		return this.closeConditionStack(conditions, conditionStack, data);
	},

	closeConditionStack: function(conditions, conditionStack, data) {
		if ( conditionStack.length !== 1 )
			throw new Error('InvalidArgumentException: Invalid conditions expression-operator count ' +
						'for conditions: ' + JSON.stringify(conditions, null, '\t'));

		var res  = conditionStack[0];
		if ( typeof res !== 'boolean' )
			return this.testExpression(res, data);

		return res;
	},

	/**
	 * Evaluate the condition stack by comparing expression top down.
	 * @return {boolean}
	 */
	testConditionStack: function(conditionStack, data) {
		// console.log(conditionStack);
		var exp1 = conditionStack[0];
		if ( typeof exp1 !== 'boolean' )
			exp1 = this.testExpression(exp1, data);

		var op = conditionStack[1];
		if ( op === '&&' && exp1 === false ) {
			// false && [?] is always false
			conditionStack.splice(0, 3, false);

		} else if ( op === '||' && exp1 === true ) {
			// true || [?] is always true
			conditionStack.splice(0, 3, true);

		} else {
			var exp2 = conditionStack[2];
			if ( typeof exp2 !== 'boolean' )
				exp2 = this.testExpression(exp2, data);

			conditionStack.splice(0, 3, this.combine(
				exp1,
				op,
				exp2
			));
		}

	},

	testExpression: function(expression, data) {
		// console.log(expression);
		if ( expression.length !== 3 )
			throw new Error('InvalidArgumentException: A [expression] must consist of 3 items!');

		var i, l, comparison, item, items = [];
		for ( i = 0, l = expression.length; i < l; i++ ) {
			item = expression[i];

			if ( typeof item === 'string' ) {
				// Checking for first char gives performance win > about 50%
				if ( item.charAt(0) === 'f' && item.indexOf('field::') === 0 ) {
					items.push(data[item.substr(7)]);

				} else if ( item.charAt(0) === 'o' && item.indexOf('op::') === 0 ) {
					comparison = item.substr(4);

				} else {
					items.push(item);
				}

			} else {
				items.push(item);
			}
		}

		if ( !comparison )
			throw new Error('InvalidArgumentException: Missing [comparison] in condition: ' +
				JSON.stringify(expression, null, '\t'));

		if ( items.length !== 2 )
			throw new Error('InvalidArgumentException: Invalid [expressions] count in condition: ' +
				JSON.stringify(expression, null, '\t'));

		return this.compare(
			items[0],
			comparison,
			items[1]
		);
	},

	parseOperator: function(operator) {
		switch(operator.toLowerCase()) {
			case 'or':
			case '||':  return '||';
			case '&&':
			case 'and': return '&&';
		}

		throw new Error('Invalid operator: ' + operator);
	},

	combine: function(left, operator, right) {
		switch(operator.toLowerCase()) {
			case '||':  return left || right;
			case '&&': return left && right;
		}

		throw new Error('Invalid operator: ' + operator);
	},

	compare: function(left, comparison, right) {
		// console.log('[check]', left, comparison, right);
		switch(comparison) {
			case '!=':  return left != right;
			case '!==': return left !== right;
			case '=':
			case '==':  return left == right;
			case '===': return left === right;
			case '<':   return left < right;
			case '>':   return left > right;
			case '>=':  return left >= right;
			case '<=':  return left <= right;
		}

		throw new Error('Invalid comparison: ' + comparison);
	}
};

NameSpace.zeyosEntitySchema = zeyosEntitySchema;
NameSpace.zeyosEntitySchemaJSON = zeyosEntitySchemaJSON;

})(globalNameSpace);