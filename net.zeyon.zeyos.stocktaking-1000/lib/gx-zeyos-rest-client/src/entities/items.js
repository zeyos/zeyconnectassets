gx.zeyosREST.EntitySchema.entities.items = {
  "iconName" : "items",
  "modelName": "items",

  "defaultOrderField": "name",
  "defaultOrderType": "asc", // asc

  "defaultFilterFields": null,
  "assocFilterFields": null,
  "fields": {
    "name": {},
    "type": {}
  },

  "detailSelectFields": [
    "lastmodified",
  ],
  "detailDisplayFields": [],
  "selectJoins": {
    'stocktransactions': 'inherit'
  },

  "listSelectFields": [
    "name",
    "itemnum",
    "type"
  ],

  "joinSelectFields": [],
  "listDisplayFields": [],
};
