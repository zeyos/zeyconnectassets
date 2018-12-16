gx.zeyosREST.EntitySchema.entities.contacts = {
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
      "implementation": "ArrSelect"
    }
  },

  "constraints": {
    "owner": "inherit",
    "visibility": "inherit",
    "lastname": "inherit",
    "type": {
      "conditions": [
        ["field::type", "op::==", 0], "||", ["field::type", "op::==", 1]
      ]
    },
    "typeFields": {
      "conditions": [
        ["field::type", "op::==", 1], "||", "(",
          ["field::title", "op::==", ""], "&&",
          ["field::company", "op::==", ""], "&&",
          ["field::position", "op::==", ""], "&&",
          ["field::department", "op::==", ""],
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

};
