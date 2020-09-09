/* -------------------------------------------------------------------------- */
/**
 *    @fileoverview
 *       privides crossfade transition
 *
 *    @version 2.5.20120221
 *    @requires jquery.js
 *    @requires bajl.js
 *    @requires bajl.fontSizeObserver.js  (optional)
 */
/* -------------------------------------------------------------------------- */
(function($) {



/* -------------------- settings for BAJL.Crossfader -------------------- */
/**
 * default setting for {@link BAJL.Crossfader}
 * @namespace default setting for {@link BAJL.Crossfader}
 * @fieldOf BAJL.settings
 * @property {Boolean} autoSetup.enabled             autosetup is enabled or not.
 * @property {Object}  presets                       for autosetup; pairs of jQuerySelector and {@link BAJL.Crossfader.Setting} object
 * @property {String}  className.enabled             className for base element; indicates the cross fader is applied.
 * @property {String}  className.discarded           className for base element; indicates the cross fader is applied but discarded.
 * @property {String}  buttons.className.disabled    className for the button which is disabled
 * @property {String}  buttons.className.selected    className for the button which is selected
 */
BAJL.settings.Crossfader = {
    'autoSetup' : {
      'enabled'  : true
  }
  , 'presets'   : {
      'div.bajl-crossfader' : {
        'autoStart' : true
      , 'interval'  : 5000
      , 'duration'  : 1000
      , 'group'     : '.bajl-crossfader-group'
      , 'units'     : '.bajl-crossfader-unit'
      , 'prevBtn'   : '.bajl-crossfader-prev-btn a'
      , 'nextBtn'   : '.bajl-crossfader-next-btn a'
      , 'selectBtn' : '.bajl-crossfader-select-btn a'
    }
  }
  , 'className' : {
      'enabled'   : 'bajl-crossfader-enabled'
    , 'discarded' : 'bajl-crossfader-discarded'
  }
  , 'buttons' : {
      'className' : {
        'disabled' : 'bajl-pseudo-disabled'
      , 'selected' : 'bajl-pseudo-selected'
    }
  }
};



/* -------------------- AutoSetup : BAJL.Crossfader -------------------- */

BAJL.WatchFor('BAJL.settings.Crossfader')
  .done(function(setting) {
    if (setting.autoSetup.enabled) {
      $.each(setting.presets, function(expr, setting) {
        showhide(expr, false);
        $(function() {
          $(expr).BAJL_Crossfader(setting);
          showhide(expr, true);
        })
      });
    }
    function showhide(expr, visible) {
      if (!BAJL.ua.isIE || BAJL.ua.documentMode >= 8) {
        var prop  = 'visibility';
        var value = visible ? 'visible' : 'hidden';
        BAJL.StyleSheets().insertRule(expr + '{' + prop + ':' + value + '}');
      }
    }
  });



/* -------------------- jQuery.fn : BAJL_Crossfader -------------------- */
/**
 * BAJL.Crossfader as jQuery plugin
 * @exports $.fn.BAJL_Crossfader as jQuery.fn.BAJL_Crossfader
 * @param {BAJL.Crossfader.Setting} [setting]    setting object for the instance
 * @returns jQuery
 * @type jQuery
 */
$.fn.BAJL_Crossfader = function(setting) {
  return this.each(function() { BAJL.Crossfader.create(this, setting) });
}



/* -------------------- Class : BAJL.Crossfader -------------------- */
/**
 * crossfader behavior controller.
 * @class crossfader behavior controller
 * @extends BAJL.Observable
 */
BAJL.Crossfader = function() {
  /** settings for this instance
      @type BAJL.Crossfader.Setting */
  this.setting      = new BAJL.Crossfader.Setting;
  /** jQuery object indicating base element of this instance.
      @type jQuery
      @private */
  this.$node      = $();
  /** jQuery object indicating container element ot the content-units.
      @type jQuery
      @private */
  this.$group     = $();
  /** jQuery object indicating the content-unit elements which are switched.
      @type jQuery
      @private */
  this.$units     = $();
  /** jQuery object indicating the element nodes which are switched with crossfade.
      @type jQuery
      @private */
  this.$selectBtn = $();
  /** an array of instances of prev buttons.
      @type jQuery
      @private */
  this.$prevBtn   = $();
  /** an array of instances of next buttons.
      @type jQuery
      @private */
  this.$nextBtn   = $();
  /** index number of currently selected content-unit.
      @type Number
      @private */
  this.index      = -1;
  /** an array of the content-units elements reverse-sorted by z-order.
      @type Element[]
      @private */
  this.order      = [];
  /** duration (ms) for crossfade transision.
      @type Number
      @private */
  this.duration   = 1000;
  /** interval (ms) for switching.
      @type Number
      @private */
  this.interval   = 1000 + 3000;
  /** interval timer to control rotation
      @type BAJL.Interval
      @private */
  this.timer      = null;
}

BAJL.Crossfader.prototype = new BAJL.Observable;

/* ---------- class methods/props ---------- */

/**
 * an array of instances of this class.
 * @type BAJL.Crossfader[]
 */
BAJL.Crossfader.instances = [];

/**
 * store an instance created from this class
 * @param {BAJL.Crossfader} instance    an instance object to store
 * @return an instance object stored
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.storeInstance = function(instance) {
  if (!instance || !(instance instanceof BAJL.Crossfader)) {
    throw new TypeError('BAJL.Crossfader.storeInstance: first argument must be an instance of BAJL.Crossfader');
  } else {
    $(instance.$node).data('BAJL.Crossfader.InstanceID', this.instances.push(instance) - 1);
    return instance;
  }
}

/**
 * get an instance created from this class
 * @param {Number|Element|jQuery|String} arg    instance-ID number, or element node which was applied to this class
 * @return BAJL.Crossfader instance
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.getInstance = function(arg) {
  if (typeof arg == 'number') {
    return this.instances[arg];
  } else if (arg && (arg.nodeType == Node.ELEMENT_NODE || typeof arg.jquery == 'string' || typeof arg == 'string')) {
    return this.instances[$(arg).data('BAJL.Crossfader.InstanceID')];
  } else {
    throw new TypeError('BAJL.Crossfader.getInstance: first argument must be an ID number, element node, jQuery object, or jQuery selector text.');
  }
}

/**
 * dipose an instance created from this class
 * @param {BAJL.Crossfader} instance    an instance object to delete
 * @return an instance object stored
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.disposeInstance = function(instance) {
  if (!instance || !(instance instanceof BAJL.Crossfader)) {
    throw new TypeError('BAJL.Crossfader.disposeInstance: first argument must be an instance of BAJL.Crossfader');
  } else if (instance.$node) {
    BAJL.Crossfader.instances.splice(instance.$node.data('BAJL.Crossfader.InstanceID'), 1, undefined);
    instance.dispose(true);
  }
}

/**
 * get new (or existing) instance of this class
 * @param {Element|jQuery|String}   node         a base element node for the instance
 * @param {BAJL.Crossfader.Setting} [setting]    setting object for the instance
 * @return an instance created
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.create = function(node, setting) {
  return this.getInstance(node) || (new this).init(node, setting);
}

/* ---------- instance methods ---------- */

/**
 * initialize
 * @param {Element|jQuery|String}   node         a base element node for the instance
 * @param {BAJL.Crossfader.Setting} [setting]    setting object for the instance
 * @return this instance
 * @type BAJL.Crossfader
 * @private
 */
BAJL.Crossfader.prototype.init = function(node, setting) {
  this.setting    = $.extend(this.setting, setting);
  this.$node      = $(node).eq(0);
  this.$group     = this.$node.find(this.setting.group    );
  this.$units     = this.$node.find(this.setting.units    );
  this.$selectBtn = this.$node.find(this.setting.selectBtn);
  this.$prevBtn   = this.$node.find(this.setting.prevBtn  );
  this.$nextBtn   = this.$node.find(this.setting.nextBtn  );
  this.order      = this.$units.get();
  this.duration   = this.setting.duration;
  this.interval   = this.setting.duration + this.setting.interval;

  var blockCName  = BAJL.settings.Crossfader.className;
  var buttonCName = BAJL.settings.Crossfader.buttons.className;

  switch (this.$units.size()) {
    case 0 :
      break;
    case 1 :
      this.index = 0;
      this.$node.addClass(blockCName.enabled).addClass(blockCName.discarded);
      break;
    default :
      this.$node.addClass(blockCName.enabled)
      
      // hide blocks to prepare fade-in effect.
      this.$units.hide();
      
      // adjust height on changing displaying fontsize of the browser
      if (BAJL.FontSizeObserver) {
        BAJL.Singleton(BAJL.FontSizeObserver).addCallback('onChange', this.flatHeights, this);
      }
      
      // setup prev buttons
      this.$prevBtn.click(BAJL.Delegate(function(e) {
        e.preventDefault();
        e.currentTarget.blur();
        if (!this.$prevBtn.hasClass(buttonCName.disabled)) {
          this.prev();
        }
      }, this));
      
      // setup next buttons
      this.$nextBtn.click(BAJL.Delegate(function(e) {
        e.preventDefault();
        e.currentTarget.blur();
        if (!this.$nextBtn.hasClass(buttonCName.disabled)) {
          this.next();
        }
      }, this));
      
      // setup control buttons
      this.$selectBtn
        .each (function(i) { $(this).data('BAJL.Crossfader.Button', i) })
        .click(BAJL.Delegate(function(e) {
          e.preventDefault();
          this.select($(e.currentTarget).blur().data('BAJL.Crossfader.Button'));
        }, this));
      
      // flatten heights to start rotation. 
      this.flatHeights(0);

      // auto start rotation
      this.setting.autoStart && this.start('immediate');

      break;
  }
  return BAJL.Crossfader.storeInstance(this);
}

/**
 * dispose this instace
 * @param {Boolean} preventRecursion    'true' to prevent recursion
 */
BAJL.Crossfader.prototype.dispose = function(preventRecursion) {
  if (!preventRecursion) {
    BAJL.Crossfader.disposeInstance(this);
  } else {
    this.timer && this.timer.clear();
    $.each(this, BAJL.Delegate(function(prop) {
      delete this[prop];
      if (typeof this[prop] == 'function') this[prop] = new Function;
    }, this));
  }
}

/**
 * start rotation
 * @param {Boolean|String} [immediate]    if true or "immediate", crossfader switches to next content-unit immediately
 * @return this instance
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.prototype.start = function(immediate) {
  if (!this.timer) {
    this.stop().startTimer();
    if (immediate === true || immediate === 'immediate') {
      this.next();
    }
  }
  return this;
}

/**
 * set interval timer which controls image switching periodically.
 * @return this instance
 * @type BAJL.Crossfader
 * @private
 */
BAJL.Crossfader.prototype.startTimer = function() {
  this.timer = new BAJL.Interval(this.next, this.interval, this);
  return this;
}

/**
 * stop rotation
 * @return this instance
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.prototype.stop = function() {
  if (this.timer) {
    this.timer.clear();
    this.timer = null;
  }
  return this;
}

/**
 * switch to specified content-unit
 * @param {Number} [index=0]    index number to select; "-1" means "unselect all".
 * @return this instance
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.prototype.select = function(index) {
  var buttonCName = BAJL.settings.Crossfader.buttons.className;
  var isRunning   = Boolean(this.timer);
  var index       = Math.max(index, -1) || 0;
  var unit        = this.$units.get(index);

  if (index == -1 || index != this.index) {
    this.stop();

    // enable/disable buttons
    this.$selectBtn.removeClass(buttonCName.selected).eq(index).toggleClass(buttonCName.selected, index != -1);
    this.$prevBtn  .toggleClass(buttonCName.disabled, index == 0);
    this.$nextBtn  .toggleClass(buttonCName.disabled, index == this.$units.size() - 1);

    if (index == -1) {
      // fadeout units
      $(this.order[0]).stop().show().fadeTo(this.duration, 0, function() { $(this).hide() });
    } else {
      // reorder units and fade in.
      this.order.unshift(this.order.splice(this.order.indexOf(unit), 1)[0]);
      this.order.reverse().forEach(function(node, i) { $(node).css('z-index', i + 1) });
      this.order.reverse();
      $(this.order[0]).stop(false, true).hide().fadeTo(this.duration, 1);
      if (this.index != -1) {
        $(this.order[1]).stop(false, true).show().fadeTo(this.duration, 0, function() { $(this).hide() });
      }
    }

    this.index = index;

    // postprocess
    if (isRunning) {
      this.startTimer();
    }
    this.doCallback('onSelect', index);
  }
  return this;
}

/**
 * unselect all content-unit
 * @return this instance
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.prototype.unselect = function(index) {
  return this.select(-1);
}

/**
 * switch to previous content-unit
 * @return this instance
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.prototype.prev = function() {
  var index = this.index - 1;
  if (index < 0) {
    index = this.$units.size() - 1;
  }
  this.select(index);
  return this;
}

/**
 * switch to next content-unit
 * @return this instance
 * @type BAJL.Crossfader
 */
BAJL.Crossfader.prototype.next = function() {
  var index = this.index + 1;
  if (!this.$units.get(index)) {
    index = 0;
  }
  this.select(index);
  return this;
}

/**
 * flat all height of pages to max height of the pages.
 * @param {Number} [duration=500]    duration of animation
 * @return this instance
 * @type BAJL.Crossfader
 * @private
 */
BAJL.Crossfader.prototype.flatHeights = function(duration) {
      duration = (duration >= 0) ? duration : 500;
  var $node    = this.$group;
  var current  = $node.height();
  var target   = this.$units
                   .map (function() { return $(this).height() })
                   .sort(function(a, b) { return a < b })[0];
  var callback = BAJL.Delegate(function() {
    this.$node.hide().show();
  }, this);
  $node.height(current).stop().animate({ 'height' : target }, duration, 'swing', callback);

  return this;
}



/* -------------------- Class : BAJL.Crossfader.Setting -------------------- */
/**
 * setting data object for {@link BAJL.Crossfader}
 * @class setting data object for {@link BAJL.Crossfader}
 */
BAJL.Crossfader.Setting = function() {
  /** if true, autostart switching with crossfade effect.
      @type Boolean */
  this.autoStart = true;
  /** interval (ms) for switching.
      @type Number */
  this.interval  = 5000;
  /** duration (ms) for crossfade transision.
      @type Number */
  this.duration  = 1000;
  /** container element ot the content-units elements.
      @type NodeList|Element[]|jQuery|String */
  this.group     = '.bajl-crossfader-group';
  /** content-unit elements which are switched.
      @type NodeList|Element[]|jQuery|String */
  this.units     = '.bajl-crossfader-unit';
  /** "buttons which switches to previous unit.
      @type NodeList|Element[]|jQuery|String */
  this.prevBtn   = '.bajl-crossfader-prev-btn';
  /** "buttons which switches to next unit.
      @type NodeList|Element[]|jQuery|String */
  this.nextBtn   = '.bajl-crossfader-next-btn';
  /** "buttons which switches to specified unit directry.
      @type NodeList|Element[]|jQuery|String */
  this.selectBtn = '.bajl-crossfader-select-btn';
}



/* -------------------- for JSDoc toolkit output -------------------- */
/**
 * callback functions for {@link BAJL.Crossfader}
 * @name BAJL.Crossfader.Callback
 * @namespace callback functions for {@link BAJL.Crossfader}
 */
/**
 * a callback for when changed current displaying content-unit
 * @name BAJL.Crossfader.Callback.onSelect
 * @function
 * @param {Number} index    index number of current displaying content-unit
 */



})(BAJL.jQuery);
