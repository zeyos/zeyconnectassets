var ZeyonCommon = ZeyonCommon || {};

ZeyonCommon.GoogleOAuth = function(apiKey, clientId, scopes, success, failure) {
	this.apiKey = apiKey;
	this.clientId = clientId;
	this.success = success;
	this.failure = failure;
	// this.scopes = 'https://www.googleapis.com/auth/contacts.readonly';
	this.scopes = scopes;
};

_pt = ZeyonCommon.GoogleOAuth;

_pt.oauth2 = function() {
	gapi.client.setApiKey(this.apiKey);
	window.setTimeout(this.checkAuth.bind(this), 1);
};

_pt.checkAuth = function() {
	gapi.auth.authorize({
		client_id: this.clientId,
		scope: this.scopes,
		immediate: false
	}, this.handleAuthResult.bind(this));
};

_pt.handleAuthResult = function(authResult) {
	if (authResult && !authResult.error) {
		this.success(gapi.getToken());
	} else {
		this.failure(authResult.error);
	}
};
