(function () {
gx.zeyosREST.EntitySchema.entities.objects = {
  "iconName" : "objects",
  "modelName": "objects",

  "defaultOrderField": "name",
  "defaultOrderType": "asc", // asc

  "defaultFilterFields": null,
  "assocFilterFields": null,
  "fields": {
    "name": {},
    "entity": {},
    "description": {},
    "data": {
      "valueType": "plainJson"
    },
  },

  "detailSelectFields": [
    "lastmodified",
    "data"
  ],
  "detailDisplayFields": [],
  "selectJoins": {},

  "listSelectFields": [
    "creationdate",
    "lastmodified",
    "name",
    "entity",
    "description"
  ],

  "joinSelectFields": [],
  "listDisplayFields": [],
};

// var ObjectsModelClass = new Class({
//   Extends: NS.BaseModel
// });

// Factory.applyEntityDefinition(modelName, {
//   modelName: 'objects',
//   modelClass: ObjectsModelClass
// });

})();
