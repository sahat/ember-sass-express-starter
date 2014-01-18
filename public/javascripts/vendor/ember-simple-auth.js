// Version: 0.0.11
// Last commit: 877c4a4 (2013-12-03 20:34:53 +0100)


(function() {
'use strict';

/**
  The main namespace for Ember.SimpleAuth

  @class SimpleAuth
  @namespace Ember
  @static
**/
Ember.SimpleAuth = {};

/**
  Sets up Ember.SimpleAuth for your application; invoke this method in a custom
  initializer like this:

  ```javascript
  Ember.Application.initializer({
    name: 'authentication',
    initialize: function(container, application) {
      Ember.SimpleAuth.setup(container, application);
    }
  });
  ```

  @method setup
  @static
  @param {Container} container The Ember.js container, see http://git.io/ed4U7Q
  @param {Ember.Application} application The Ember.js application instance
  @param {Object} [options]
    @param {String} [options.routeAfterLogin] route to redirect the user to after successfully logging in - defaults to `'index'`
    @param {String} [options.routeAfterLogout] route to redirect the user to after logging out - defaults to `'index'`
    @param {String} [options.loginRoute] route to redirect the user to when login is required - defaults to `'login'`
    @param {String} [options.serverTokenRoute] the server endpoint used to obtain the access token - defaults to `'/token'`
    @param {String} [options.autoRefreshToken] enable/disable automatic token refreshing (if the server supports it) - defaults to `true`
    @param {Array[String]} [options.crossOriginWhitelist] list of origins that (besides the origin of the Ember.js application) send the authentication token to - defaults to `[]`
**/
Ember.SimpleAuth.setup = function(container, application, options) {
  options = options || {};
  this.routeAfterLogin      = options.routeAfterLogin || 'index';
  this.routeAfterLogout     = options.routeAfterLogout || 'index';
  this.loginRoute           = options.loginRoute || 'login';
  this.serverTokenEndpoint  = options.serverTokenEndpoint || '/token';
  this.autoRefreshToken     = Ember.isEmpty(options.autoRefreshToken) ? true : !!options.autoRefreshToken;
  this.crossOriginWhitelist = Ember.A(options.crossOriginWhitelist || []);

  var session = Ember.SimpleAuth.Session.create();
  application.register('simple_auth:session', session, { instantiate: false, singleton: true });
  Ember.$.each(['model', 'controller', 'view', 'route'], function(i, component) {
    application.inject(component, 'session', 'simple_auth:session');
  });

  Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (!Ember.isEmpty(session.get('authToken')) && Ember.SimpleAuth.includeAuthorizationHeader(options.url)) {
      jqXHR.setRequestHeader('Authorization', 'Bearer ' + session.get('authToken'));
    }
  });

  /**
    @method includeAuthorizationHeader
    @private
  */
  this.includeAuthorizationHeader = function(url) {
    this._links = this._links || {};
    var link = Ember.SimpleAuth._links[url] || function() {
      var link = document.createElement('a');
      link.href = url;
      Ember.SimpleAuth._links[url] = link;
      return link;
    }();
    function formatLocation(location) { return location.protocol + '//' + location.hostname + (location.port !== '' ? ':' + location.port : ''); }
    var linkOrigin       = formatLocation(link);
    this._locationOrigin = formatLocation(window.location);
    return this.crossOriginWhitelist.indexOf(linkOrigin) > -1 || linkOrigin === this._locationOrigin;
  },

  /**
    Call this method when an external login was successful. Typically you would
    have a separate window in which the user is being presented with the
    external provider's authentication UI and eventually being redirected back
    to your application. When that redirect occured, the application needs to
    call this method on its opener window, e.g.:

    ```html
      <html>
        <head></head>
        <body>
          <script>
            window.opener.Ember.SimpleAuth.externalLoginSucceeded({ access_token: 'secret token!' });
            window.close();
          </script>
        </body>
      </html>
    ```

    This method will then set up the session (see
    [Session#setup](#Ember.SimpleAuth.Session_setup) and invoke the
    [Ember.SimpleAuth.ApplicationRouteMixin#loginSucceeded](#Ember.SimpleAuth.ApplicationRouteMixin_loginSucceeded)
    callback.

    @method externalLoginSucceeded
    @param {Object} sessionData The data to setup the session with (see [Session#setup](#Ember.SimpleAuth.Session_setup)))
  */
  this.externalLoginSucceeded = function(sessionData) {
    session.setup(sessionData);
    container.lookup('route:application').send('loginSucceeded');
  };

  /**
    Call this method when an external login fails, e.g.:

    ```html
      <html>
        <head></head>
        <body>
          <script>
            window.opener.Ember.SimpleAuth.externalLoginFailed('something went wrong!');
            window.close();
          </script>
        </body>
      </html>
    ```

    The argument you pass here will be forwarded to the
    [Ember.SimpleAuth.ApplicationRouteMixin#loginSucceeded](#Ember.SimpleAuth.ApplicationRouteMixin_loginFailed)
    callback.

    @method externalLoginFailed
    @param {Object} error Any optional error that will be forwarded to the [Ember.SimpleAuth.ApplicationRouteMixin#loginSucceeded](#Ember.SimpleAuth.ApplicationRouteMixin_loginFailed) callback
  */
  this.externalLoginFailed = function(error) {
    container.lookup('route:application').send('loginFailed', error);
  };
};

})();



(function() {
'use strict';

/**
  This class holds the current access token and other session data. There will always be a
  session regardless of whether a user is currently authenticated or not. That (singleton) instance
  of this class is automatically injected into all models, controller, routes and views so you should
  never instantiate this class directly but always use the auto-injected instance.

  @class Session
  @namespace Ember.SimpleAuth
  @extends Ember.Object
  @constructor
*/
Ember.SimpleAuth.Session = Ember.Object.extend({

  init: function() {
    this._super();
    this.syncProperties();
    this.handleAuthTokenRefresh();
  },

  /**
    Sets up the session from a plain JavaScript object. This does not create a new instance but sets up
    the instance with the data that is passed. Any data assigned here is also persisted in a session cookie (see http://en.wikipedia.org/wiki/HTTP_cookie#Session_cookie) so it survives a page reload.

    @method setup
    @param {Object} data The data to set the session up with
      @param {String} data.access_token The access token that will be included in the `Authorization` header
      @param {String} [data.refresh_token] An optional refresh token that will be used for obtaining fresh tokens
      @param {String} [data.expires_in] An optional expiry for the access_token in seconds; if both expires_in and refresh_token are set,
        Ember.SimpleAuth will automatically refresh access tokens before they expire

    @example
      ```javascript
      this.get('session').setup({
        access_token:  'the secret token!',
        refresh_token: 'a secret refresh token!',
        expires_in:    3600 // 1 minute
      })
      ```
  */
  setup: function(data) {
    data = data || {};
    this.setProperties({
      authToken:       data.access_token,
      refreshToken:    (data.refresh_token || this.get('refreshToken')),
      authTokenExpiry: (data.expires_in > 0 ? data.expires_in * 1000 : this.get('authTokenExpiry')) || 0
    });
  },

  /**
    Destroys the session by setting all properties to undefined (see [Session#setup](#Ember.SimpleAuth.Session_setup)). This also deletes any
    saved data from the session cookie and effectively logs the current user out.

    @method destroy
  */
  destroy: function() {
    this.setProperties({
      authToken:       undefined,
      refreshToken:    undefined,
      authTokenExpiry: undefined
    });
  },

  /**
    Returns whether a user is currently authenticated.

    @method isAuthenticated
    @return {Boolean} true if a user is authenticated, false otherwise
  */
  isAuthenticated: Ember.computed('authToken', function() {
    return !Ember.isEmpty(this.get('authToken'));
  }),

  /**
    @method syncProperties
    @private
  */
  syncProperties: function() {
    this.setProperties({
      authToken:       this.load('authToken'),
      refreshToken:    this.load('refreshToken'),
      authTokenExpiry: this.load('authTokenExpiry')
    });
    if (!Ember.testing) {
      Ember.run.cancel(Ember.SimpleAuth.Session._syncPropertiesTimeout);
      Ember.SimpleAuth.Session._syncPropertiesTimeout = Ember.run.later(this, this.syncProperties, 500);
    }
  },

  /**
    @method load
    @private
  */
  load: function(property) {
    var value = document.cookie.match(new RegExp(property + '=([^;]+)')) || [];
    if (Ember.isEmpty(value)) {
      return undefined;
    } else {
      return decodeURIComponent(value[1] || '');
    }
  },

  /**
    @method store
    @private
  */
  store: function(property) {
    document.cookie = property + '=' + encodeURIComponent(this.get(property) || '');
  },

  /**
    @method authTokenObserver
    @private
  */
  authTokenObserver: Ember.observer(function() {
    this.store('authToken');
  }, 'authToken'),

  /**
    @method refreshTokenObserver
    @private
  */
  refreshTokenObserver: Ember.observer(function() {
    this.store('refreshToken');
    this.handleAuthTokenRefresh();
  }, 'refreshToken'),

  /**
    @method authTokenExpiryObserver
    @private
  */
  authTokenExpiryObserver: Ember.observer(function() {
    this.store('authTokenExpiry');
    this.handleAuthTokenRefresh();
  }, 'authTokenExpiry'),

  /**
    @method handleAuthTokenRefresh
    @private
  */
  handleAuthTokenRefresh: function() {
    if (Ember.SimpleAuth.autoRefreshToken) {
      Ember.run.cancel(Ember.SimpleAuth.Session._refreshTokenTimeout);
      Ember.SimpleAuth.Session._refreshTokenTimeout = undefined;
      var waitTime = this.get('authTokenExpiry') - 5000;
      if (!Ember.isEmpty(this.get('refreshToken')) && waitTime > 0) {
        Ember.SimpleAuth.Session._refreshTokenTimeout = Ember.run.later(this, function() {
          var _this = this;
          Ember.$.ajax(Ember.SimpleAuth.serverTokenEndpoint, {
            type:        'POST',
            data:        'grant_type=refresh_token&refresh_token=' + this.get('refreshToken'),
            contentType: 'application/x-www-form-urlencoded'
          }).then(function(response) {
            _this.setup(response);
            _this.handleAuthTokenRefresh();
          });
        }, waitTime);
      }
    }
  }
});

})();



(function() {
'use strict';

/**
  The mixin for routes that you want to enforce an authenticated user. When
  users hit a route that implements this mixin and have not authenticated
  before, they will be redirected to the route configured as `loginRoute` in
  [Ember.SimpleAuth.setup](#Ember.SimpleAuth_setup).

  Ember.SimpleAuth.AuthenticatedRouteMixin performs the redirect to the login
  route in the `beforeModel` method so that you can assume a user to be
  authenticated in the `model` method so that server requests you make there
  will be authenticated. Also, if you implement your own `beforeModel` method,
  you have to make sure you're calling `this._super(transition)`;

  @class AuthenticatedRouteMixin
  @namespace Ember.SimpleAuth
  @extends Ember.Mixin
  @static
*/
Ember.SimpleAuth.AuthenticatedRouteMixin = Ember.Mixin.create({
  /**
    This method implements the check for an authenticated user. In the case that
    no user is authenticated, it redirects to the route defined as `loginRoute`
    in [Ember.SimpleAuth.setup](#Ember.SimpleAuth_setup). It also intercepts the
    current transition so that it can be retried after the user has
    authenticated (see
    [ApplicationRouteMixin#loginSucceeded](#Ember.SimpleAuth.ApplicationRouteMixin_loginSucceeded)).

    @method beforeModel
    @param {Transition} transition The transition that leat to this route
  */
  beforeModel: function(transition) {
    if (!this.get('session.isAuthenticated')) {
      transition.abort();
      this.triggerLogin(transition);
    }
  },

  /**
    @method triggerLogin
    @private
    @param {Transition} transition The transition that leat to this route
  */
  triggerLogin: function(transition) {
    this.set('session.attemptedTransition', transition);
    if (Ember.canInvoke(transition, 'send')) {
      transition.send('login');
    } else {
      this.send('login');
    }
  }
});

})();



(function() {
'use strict';

/**
  The mixin for the login controller (if you're using the default
  credentials-based login). This controller sends the user's credentials to the
  server and sets up the session (see
  [Session#setup](#Ember.SimpleAuth.Session_setup)) from the reponse.

  Accompanying the login controller your application needs to have a `login`
  template with the fields `indentification` and `password` as well as an
  actionable button or link that triggers the `login` action, e.g.:

  ```handlebars
  <form {{action login on='submit'}}>
    <label for="identification">Login</label>
    {{view Ember.TextField id='identification' valueBinding='identification' placeholder='Enter Login'}}
    <label for="password">Password</label>
    {{view Ember.TextField id='password' type='password' valueBinding='password' placeholder='Enter Password'}}
    <button type="submit">Login</button>
  </form>
  ```

  @class LoginControllerMixin
  @namespace Ember.SimpleAuth
  @extends Ember.Mixin
  @static
*/
Ember.SimpleAuth.LoginControllerMixin = Ember.Mixin.create({
  /**
    This method takes the user's credentials and builds the request options as
    they are passed Ember.$.ajax (see http://api.jquery.com/jQuery.ajax/).

    The default implementation follows RFC 6749. In case you're using a custom
    server API you can override this method to return options as they fit your
    server API, e.g.:

    ```javascript
    App.LoginController  = Ember.Controller.extend(Ember.SimpleAuth.LoginControllerMixin, {
      tokenRequestOptions: function(username, password) {
        var putData = '{ "SESSION": { "USER_NAME": "' + username + '", "PASS": "' + password + '" } }';
        return { type: 'PUT', data: putData, contentType: 'application/json' };
      }
    });
    ```

    @method tokenRequestOptions
    @param {String} identification The user's identification (user name or email address or whatever is used to identify the user)
    @param {String} password The user's password
    @param {String} client_id The (optional) client id (see http://tools.ietf.org/html/rfc6749#section-3.2.1)
    @param {String} client_secret The (optional) client secret (see http://tools.ietf.org/html/rfc6749#section-3.2.1)
    @return {Object} The request options to be passed to Ember.$.ajax (see http://api.jquery.com/jQuery.ajax/ for detailed documentation)
  */
  tokenRequestOptions: function(identification, password, client_id, client_secret) {
    var postData = ['grant_type=password', 'username=' + identification, 'password=' + password];
    if (!Ember.isEmpty(client_id)) {
      postData.push('client_id=' + client_id);
      if (!Ember.isEmpty(client_id)) {
        postData.push('client_secret=' + client_secret);
      }
    }
    postData = postData.join('&');
    return { type: 'POST', data: postData, contentType: 'application/x-www-form-urlencoded' };
  },
  actions: {
    /**
      @method login
      @private
    */
    login: function() {
      var _this = this;
      var data = this.getProperties('identification', 'password', 'client_id', 'client_secret');
      if (!Ember.isEmpty(data.identification) && !Ember.isEmpty(data.password)) {
        this.set('password', undefined);
        var requestOptions = this.tokenRequestOptions(data.identification, data.password, data.client_id, data.client_secret);
        Ember.$.ajax(Ember.SimpleAuth.serverTokenEndpoint, requestOptions).then(function(response) {
          Ember.run(function() {
            _this.get('session').setup(response);
            _this.send('loginSucceeded');
          });
        }, function(xhr, status, error) {
          Ember.run(function() {
            _this.send('loginFailed', xhr, status, error);
          });
        });
      }
    }
  }
});

})();



(function() {
'use strict';

/**
  The mixin for the application controller. This defines the `login` and
  `logout` actions so that you can simply add buttons or links in every template
  like this:

  ```handlebars
  {{#if session.isAuthenticated}}
    <a {{ action 'logout' }}>Logout</a>
  {{else}}
    <a {{ action 'login' }}>Login</a>
  {{/if}}
  ```

  @class ApplicationRouteMixin
  @namespace Ember.SimpleAuth
  @extends Ember.Mixin
  @static
*/
Ember.SimpleAuth.ApplicationRouteMixin = Ember.Mixin.create({
  actions: {
    /**
      The login action by default redirects to the login route (or any other
      route defined as `loginRoute` in
      [Ember.SimpleAuth.setup](#Ember.SimpleAuth_setup)). When integrating with
      an external authentication provider, this action should be overridden so
      that it opens the external provider's UI in a new window, e.g.:

      ```javascript
      App.ApplicationRoute = Ember.Route.extend(Ember.SimpleAuth.ApplicationRouteMixin, {
        actions: {
          login: function() {
            window.open('https://www.facebook.com/dialog/oauth...');
          }
        }
      });
      ```

      @method login
    */
    login: function() {
      this.transitionTo(Ember.SimpleAuth.loginRoute);
    },

    /**
      This action is invoked when a user successfully logs in. By default it
      will retry a potentially intercepted transition
      (see [AuthenticatedRouteMixin#beforeModel](#Ember.SimpleAuth.AuthenticatedRouteMixin_beforeModel))
      or if none was intercepted redirect to the route configured as
      `routeAfterLogin` in [Ember.SimpleAuth.setup](#Ember.SimpleAuth_setup).

      @method loginSucceeded
    */
    loginSucceeded: function() {
      var attemptedTransition = this.get('session.attemptedTransition');
      if (attemptedTransition) {
        attemptedTransition.retry();
        this.set('session.attemptedTransition', undefined);
      } else {
        this.transitionTo(Ember.SimpleAuth.routeAfterLogin);
      }
    },

    /**
      This action is invoked when login fails. This does nothing by default but
      can be overridden and used to display generic error messages etc. If
      you're using an external authentication provider you might also want to
      override it to display the external provider's error message (any
      arguments you pass to
      [Ember.SimpleAuth#externalLoginSucceeded](#Ember.SimpleAuth_externalLoginSucceeded)
      will be forwarded to this action), e.g.:

      ```javascript
      App.ApplicationRoute = Ember.Route.extend(Ember.SimpleAuth.ApplicationRouteMixin, {
        actions: {
          loginFailed: function(error) {
            this.controllerFor('application').set('loginErrorMessage', error.message);
          }
        }
      });
      ```

      @method loginFailed
    */
    loginFailed: function() {
    },

    /**
      The logout action destroys the current session (see
      [Session#destroy](#Ember.SimpleAuth.Session_destroy)) and redirects to the
      route defined as `routeAfterLogout` in
      [Ember.SimpleAuth.setup](#Ember.SimpleAuth_setup).

      @method logout
    */
    logout: function() {
      this.get('session').destroy();
      this.transitionTo(Ember.SimpleAuth.routeAfterLogout);
    }
  }
});

})();



(function() {
/**
@module ember-simple-auth
@requires ember-runtime
*/

})();

