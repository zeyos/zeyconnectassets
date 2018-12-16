(function(NS) {
  var Factory = NS.Factory;

  /**
   * Authentication model representing the current authenticated user with
   * a token or by session. This model is supposed to be treated as singleton
   * (@see Factory.getAuthenticationModel()).
   *
   * This class abstracting the authentication on top of the
   * gx.zeyosREST.RestClient and therefore is tightly coupled to that very
   * component.
   *
   * By default this class is using localStorage to store and load the
   * authenticated user.
   *
   * ATTENTION: Currently their is no support for handling .setCredentials
   * after initializing. You have to do extra work to recognize a change
   * of the credentials to rerequest a auth token etc.
   *
   * @event authChanged
   */
  var AuthenticationModel = new Class({
    Extends: NS.BaseModel,

    authToken: null,
    authBySession: false,
    credentials: {},

    user: null,
    contact: null,

    groupsCollection: null,

    CREDENTIALS_SETTING: 'app.credentials',

    setRESTmodel: function(RESTmodel) {
      this.RESTmodel = RESTmodel;
    },

    getRESTmodel: function() {
      return this.RESTmodel || Factory.getClient();
    },

    setCredentials: function(credentials) {
      this.credentials = credentials;
      this.authBySession = typeof credentials.user === 'undefined';
    },

    getCredentials: function() {
      return this.credentials;
    },

    requireAuthentication: function() {
      return this.authBySession !== true || !((this.getRESTmodel().getClient().getCredentials() || {}).authToken);
    },

    isAuthenticated: function() {
      throw new Error('TODO - not yet ported');

      return new Promise(function(resolve, reject) {
        if (this.authToken !== null) {
          // Already authenticated
          resolve(true);
          return;
        }

        // Try to read credentials from persistent resources.
        var credentials = Object.getLength(this.credentials) > 0 ?
          this.credentials :
          this.read();

        if (credentials) {
          // Try to authenticate with this credentials
          var res = Factory.getClient().getAuth(
            credentials.platform,
            credentials.identifier,
            credentials.authToken,
            credentials.platformUrl
          )
            .then (function(res) {
              if ( !NS.handleRequestResult(res) ) {
                // There might be old deprecated credentials settings.
                // Therefore invalidate credentials on any error.
                this.unsetAuthentication();
                throw res;

              }

              res.result.token = credentials.authToken;
              this.setAuthentication(credentials, res.result);
              return true;
            }.bind(this));

          resolve(res);
          return;
        }

        // Bring up login view
        resolve(false);
      }.bind(this));
    },

    doAuthenticate: function(user, password, platform, deviceId, platformUrl) {
      throw new Error('TODO - not yet ported');
      var credentials = {
        user: user,
        password: password,
        platform: platform,
        identifier: deviceId,
        platformUrl: platformUrl
      };

      return Factory.getClient().auth(
        user,
        password,
        platform,
        deviceId,
        null,
        platformUrl
      )
        .then(function(res) {
          if ( !NS.handleRequestResult(res) ) {
            this.unsetAuthentication();
            throw res;
          }

          this.setAuthentication(credentials, res.result);
          // this.getZeyosSettings();
          return true;
        }.bind(this));
    },

    /**
     * @see this.deleteAuth
     *
     * @private
     * @return {[type]}
     */
    unsetAuthentication: function() {
      this.authToken = null;
      this.groupsCollection = null;
      this.credentials = {};
      this.dispose();

      this.fireEvent('authChanged', [false, this]);
    },

    unsetAuthenticationToken: function() {
      this.authToken = null;
    },

    setAuthenticationToken: function(token) {
      this.authToken = token;
    },

    getAuthenticationToken: function() {
      return this.authToken;
    },

    setAuthentication: function(credentials, result) {
      if ( result !== undefined ) {
        if ( typeof(result) !== 'object' || !result.ID || !result.token || !result.permissions || !result.groupNames ) {
          // this.unsetAuthentication();
          throw new Error('Invalid authentication result.');
        }

        this.authToken = result.token;
        credentials.authToken = result.token;
        credentials.permissions = result.permissions;
        credentials.groupNames = result.groupNames;
        credentials.ID = result.ID;
        credentials.name = result.name;

        this.setAuthUserModel({
          ID: result.ID,
          name: result.name,
        });

        var contact = result.contact || credentials.contact;
        if ( contact ) {
          this.setAuthContactModel(contact);
          credentials.contact = this.contact.getPlainValues();
        }
      }
      this.credentials = credentials;
      this.write(credentials);

      this.fireEvent('authChanged', [credentials, this]);
    },

    read: function() {
      if ( (typeof(Backend) !== 'undefined') && Backend ) {
        return JSON.parse( Backend.Config.get(this.CREDENTIALS_SETTING, 'string', null) || 'null' );
      } else {
        var c = localStorage.getItem('userAuthentication');
        if ( c === null )
          return null;

        return JSON.parse(c);
      }
    },

    write: function(credentials) {
      if ( (typeof(Backend) !== 'undefined') && Backend )
        Backend.Config.set(this.CREDENTIALS_SETTING, JSON.stringify(credentials));
      else
        localStorage.setItem('userAuthentication', JSON.encode(credentials));
    },

    dispose: function() {
      if ( (typeof(Backend) !== 'undefined') && Backend ) {
        Backend.Config.set(this.CREDENTIALS_SETTING, 'null');
      } else {
        localStorage.removeItem('userAuthentication');
      }
    },

    getId: function() {
      return this.credentials.ID;
    },

    /*
    getGroupsCollection: function() {
      if ( !this.groupsCollection ) {
        var groupsSchema = App.getModelSchema('groups');
        this.groupsCollection = new App.OfflineCollection(groupsSchema, {});

        var titleFieldName = groupsSchema.getDefaultTitleFieldName();

        var id, group, groups = [], groupNames = this.credentials.groupNames;
        for ( id in groupNames ) {
          group = {ID: id};
          group[titleFieldName] = groupNames[id];
          groups.push(group);
        }

        this.groupsCollection.setOfflineItems(groups);
      }

      return this.groupsCollection;
    },
    */

    setAuthUserModel: function(user) {
      var userModelSchema = Factory.getModelSchema('users');
      this.user = userModelSchema.newInstance();
      this.user.setFieldsObject(user, userModelSchema.getDetailSelectColumns());
    },

    setAuthContactModel: function(contact) {
      var contactModelSchema = Factory.getModelSchema('contacts');
      this.contact = contactModelSchema.newInstance();
      this.contact.setFieldsObject(contact, contactModelSchema.getDetailSelectColumns());
    },

    getUserModel: function() {
      return this.user;
    },

    getContactModel: function() {
      return this.contact;
    },

    getPermissions: function() {
      return this.credentials.permissions;
    },

    getPlatform: function() {
      return this.credentials.platform;
    },

    deleteAuth: function()  {
      var credentials = Object.clone(this.credentials);
      var _this = this;
      delete credentials.authToken;
      var restClient = Factory.getClient();
      return restClient.deleteAuth()
        .then(function(res) {
          _this.setCredentials(credentials);
          restClient.setCredentials(credentials);
          return res;
        });
    }

  });

  Factory.addModelSchema(new NS.BaseModelSchema({
    modelName: 'authentication',
    modelClass: AuthenticationModel
  }));

  NS.AuthenticationModel = AuthenticationModel;

})(gx.zeyosREST);
