(function(NS) {
  /**
   * Singleton
   *
   */
  var Factory = NS.Factory = {

    options: {
      API_ENDPOINT:  '1.0', // read from settings on initialization
      ZEYOS_API:     'https://api.zeyos.com/',
      ZEYOS_URL:     'https://cloud.zeyos.com/',

      resolveLabel: null,
      proxy: false,

      loadingIndicator: null,
    },

    schemas: {},
    authModel: null,
    authModelName: 'authentication',

    restModel: null,


    initREST: function(credentials, options) {
      if ( options )
        Options.prototype.setOptions.call(this, options);

      gx.zeyosREST.EntitySchema.doInit(this.options.resolveLabel);

      var authModel = this.getAuthenticationModel();
      authModel.setCredentials(credentials);
      var restModel = this.getRESTmodel();
      restModel.setAutoAuthentication(authModel);

      return restModel;
    },

    addModelSchema: function(objSchema) {
      var modelName = objSchema.options.modelName;
      this.schemas[modelName] = objSchema;

      return objSchema;
    },

    applyEntityDefinition: function(modelName, options) {
      this.schemas[modelName] = new NS.EntityModelSchema(options);
    },

    getModelSchema: function(modelName, options) {
      var schema = this.schemas[modelName];
      if ( !schema ) {
        return this.addModelSchema(new NS.EntityModelSchema({
          modelName: modelName,
          modelClass: NS.BaseModel
        }));
      }

      return schema;
    },

    queryWeblet: function(webletRoute, method, options) {
      return this.getRESTClient().requestWeblet(webletRoute, method, options);
    },

    queryService: function(service, method, options) {
      return this.getRESTClient().requestService(service, method, options);
    },

    queryModel: function(modelName, id) {
      var modelItem = this.getModelSchema(modelName).newInstance();
      modelItem.setId(id);
      return modelItem.loadAndUnpack();
    },

    queryCollection: function(modelName, fields) {
      var collection = this.newCollection(modelName, fields);
      return collection.loadAndUnpack();
    },

    newCollection: function(modelName, filterFields, customOptions) {
      var options = {};
      if ( filterFields && (!customOptions || !customOptions.filter) )
        if ( filterFields instanceof gx.zeyosREST.CollectionFilter )
          options.filter = filterFields;
        else
          options.filter = new NS.CollectionFilter(filterFields);

      if ( customOptions )
        Object.merge(options, customOptions);

      return new NS.BaseCollection(
        this.getModelSchema(modelName),
        options
      );
    },

    searchCollection: function(modelName, searchText) {

    },

    getAuthenticationModel: function() {
      if (!this.authModel) {
        var schema = this.getModelSchema(this.authModelName);
        this.authModel = schema.newInstance();
      }

      return this.authModel;
    },

    createRestModel: function() {
      var restModel = this.restModel = new NS.RestModel({
        apiUrl: this.options.ZEYOS_API,
        platformsUrl: this.options.ZEYOS_URL,
        apiEndpoint: this.options.API_ENDPOINT,
        proxy: this.options.proxy,
        loadingIndicator: this.options.loadingIndicator,
        webletExposedTo: this.options.webletExposedTo
      });
      return restModel;
    },

    getRESTmodel: function() {
      if ( !this.restModel )
        this.createRestModel();

      return this.restModel;
    },

    getRESTClient: function() {
      return this.getRESTmodel().getClient();
    },

    newModel: function(modelName, objValues) {
      var schema = this.getModelSchema(modelName);
      var model = schema.newInstance();

      if ( objValues )
        model.setPlainValuesObject(objValues);

      return model;
    },

  };


  NS.logOnErrorAndRethrow = function(res) {
    // You might want to handle aborted requests like so:
    //
    // if ( res instanceof HttpRequest.Failure && res.event.type === 'abort' )
    //   return res;

    // console.log(typeof res);
    if ( typeof res === 'object' ) {
      if ( res.__$ZeyOSMobileLoggedError === 'loggingDone' )
        throw res;

      res.__$ZeyOSMobileLoggedError = 'loggingDone';
    }

    if (res instanceof Error) {
      console.error(res.stack);
    } else {
      console.error(res);
    }

    throw res;
  };

  NS.showAlert = function(text, type) {
    alert(text);
  };

})(gx.zeyosREST);
