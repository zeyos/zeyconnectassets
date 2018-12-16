/**
 * @class gx.ui.OC_Container
 * @description Abstract class for container elements
 * @extends gx.ui.Container
 *
 * @author Sebastian Glonner <sebastian.glonner@zeyon.net>
 * @version 1.00
 * @package com
 * @copyright Copyright (c) 2011-2013, Zeyon (www.zeyon.net)
 *
 * @param {string|node} display
 *
 * @option {integer} delay The transition duration. Has to equal the css defined transition duration.
 * @option {boolean} initclosed How to initialize the container. False = open, True = closed.
 * @option {string} effect Which effect to use for open and close.
 */
gx.ui.OC_Container = new Class({
    Extends: gx.ui.Container,
    options: {
        'delay'     : 200,
        'initclosed': false,
        'effect'    : 'Fading'
    },

    _theme: {
        root: 'gxUiOCContainer'
    },

    _effect: null,
    _state: false, // false = closed, true = open

    initialize: function(display, options) {
        this.parent(display, options);

        this._ui.root.addClass(this._theme.root);

        if ( gx.ui.OC_Container.Effects[this.options.effect] == null )
            throw new Error('Invalid effect!');

        this._effect = new gx.ui.OC_Container.Effects[this.options.effect](this._ui.root, this.options);

        this._state = !this.options.initclosed;
    },

    hide: function(ready, force) {
        this.close(ready, force);
    },
    close: function(ready, force) {
        if ( this._state === false && force !== true )
            return;

        this._effect._last = false;
        this._effect.hide(ready, force);
        this._state = false;
    },
    open: function(ready, force) {
        this.show(ready, force);
    },
    show: function(ready, force) {
        if ( this._state === true && force !== true )
            return;

        this._effect._last = true;
        this._effect.show(ready, force);
        this._state = true;
    }
});

gx.ui.OC_Container.Effects = {};

gx.ui.OC_Container.Effects.Base = new Class({
    Extends: gx.core.Settings,

    _theme: {
        root: ''
    },

    _ui: {},

    _last: null,

    initialize: function(root, options) {
        this._ui.root = root;
        this.parent(options);

        this._ui.root.addClass(this._theme.root);

        this.init();

        if ( this.options.initclosed ) {
            this.initHidden();
        } else {
            this.initOpen();

        }
    },

    init: function() {

    },

    initHidden: function() {
        this._ui.root
            .removeClass('active')
            .addClass('dnone')
            .removeClass('dblock');

    },

    initOpen: function() {
        this._ui.root
            .removeClass('dnone')
            .addClass('dblock')
            .addClass('active');
    },

    show: function(ready) {
        if ( ready )
            ready();
    },

    hide: function(ready) {
        if ( ready )
            ready();
    }
});

gx.ui.OC_Container.Effects.Fading = new Class({
    Extends: gx.ui.OC_Container.Effects.Base,

    options: {
        'delay' : 500
    },

    _theme: {
        root: 'fading'
    },

    hide: function(ready) {
        this._ui.root
            .removeClass('active');

        (function() {
            // there might was a show call in between
            if ( this._last !== false )
                return;

            this._ui.root
                .addClass('dnone')
                .removeClass('dblock');

            if ( ready )
                ready();
        }).delay(this.options.delay, this);
    },

    show: function(ready) {
        this._ui.root
            .removeClass('dnone')
            .addClass('dblock');

        (function() {
            // there might was a close call in between
            if ( this._last !== true )
                return;

            this._ui.root.addClass('active');

            if ( ready )
                ready();
        }).delay(5, this);
    }
});

gx.ui.OC_Container.Effects.Sliding = new Class({
    Extends: gx.ui.OC_Container.Effects.Base,

    options: {
        'min_height': false,
        'max_height': false,
        'height'    : false,
        'transition': 'elastic:in:out',
        'overflow'  : 'hidden'
    },

    _theme: {
        root: 'sliding'
    },

    mheight: null,
    fxopen: null,
    fxclose: null,

    initialize: function(root, options) {
        this.parent(root, options);
    },

    init: function() {
        this.fxopen = new Fx.Morph(this._ui.root, {
            delay: this.options.delay,
            transition: this.options.transition
        });
        this.fxclose = new Fx.Morph(this._ui.root, {
            delay: this.options.delay,
            transition: this.options.transition
        });

        if ( this.options.max_height )
            this._ui.root.setStyle('max-height', this.options.max_height);

        this._ui.root.setStyle('overflow', this.options.overflow);
    },

    initHidden: function() {
        this.hide();

    },

    initOpen: function() {
        this.show();
    },

    hide: function(ready) {
        var cheight = this._ui.root.getCoordinates().height;
        this._ui.root.setStyles({
            'height': cheight,
            'min-height': 0
        });

        this.fxclose.start({'height': [cheight, 0]}).chain(function() {
            this._ui.root
                .setStyle('visibility', 'hidden')
                .addClass('dnone')
                .removeClass('dblock');

            if ( ready )
                ready();
        }.bind(this));
    },
    show: function(ready) {
        var cheight = null;
        var position = this._ui.root.getStyle('position');
        this._ui.root
            .removeClass('dnone')
            .addClass('dblock')
            .setStyle('min-height', 0);

        if ( this.options.height ) {
            cheight = this.options.height;

        } else {
            // determine height automatically by display: block visibility hidden
            this._ui.root.setStyles({
                'position': 'absolute',
                'height': 'auto'
            });

            cheight = this._ui.root.getCoordinates().height;

        }

        this._ui.root.setStyles({
            'position': position,
            'height': 0,
            'visibility': 'visible'
        });

        if ( this.options.min_height && cheight < this.options.min_height )
            cheight = this.options.min_height;

        if ( this.options.max_height && cheight > this.options.max_height )
            cheight = this.options.max_height;

        this.fxopen.start({'height': [0, cheight]}).chain(function() {
            if ( this.options.min_height )
                this._ui.root.setStyle('min-height', this.options.min_height);

            this._ui.root.setStyle('height', this.options.height ? this.options.height : 'auto');

            if ( ready )
                ready();
        }.bind(this));
    }
});