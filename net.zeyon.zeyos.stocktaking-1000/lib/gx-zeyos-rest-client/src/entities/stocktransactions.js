(function(NS) {

gx.zeyosREST.EntitySchema.entities.itemsstocktransactions = {
  "inherit": "items",

  "fields": {
  },

  "selectJoins": {
    "stocktransactions": "inherit"
  },

  "listSelectFields": [
    "stocktransactions"
  ],
};

/**
 * This is for joins only.
 */
gx.zeyosREST.EntitySchema.entities.stocktransactions = {
  "iconName" : "stocktransactions",
  "modelName": "stocktransactions",

  "defaultOrderField": "ID",
  "defaultOrderType": "desc", // asc

  "defaultFilterFields": null,
  "assocFilterFields": null,
  "fields": {
    "amount": {}
  },

  "joinSelectFields": [
    "amount"
  ],

  "detailSelectFields": [],
  "detailDisplayFields": [],
  "selectJoins": {},
  "listSelectFields": [],
  "listDisplayFields": [],
};


var ItemsStockTransactionsModel = new Class({
  Extends: NS.BaseModel,

  stocktransactions: [],
  cumulatedStockAmount: null,

  getCumulatedStockAmount: function() {
    if ( this.cumulatedStockAmount === null ) {
      var stocktransactions = this.getJoinedModel('itemsstocktransactions');
      var amount = 0;
      stocktransactions.forEach(function(stocktransaction) {
        amount += parseInt(stocktransaction.get('amount'));
      });

      this.cumulatedStockAmount = amount;
    }
    return this.cumulatedStockAmount;
  }
});

gx.zeyosREST.Factory.addModelSchema(new NS.EntityModelSchema({
  modelName: "items",
  modelClass: ItemsStockTransactionsModel,
}));

})(gx.zeyosREST);
