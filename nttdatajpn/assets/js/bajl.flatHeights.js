/* -------------------------------------------------------------------------- */
/** 
 *    @fileoverview
 *       flatten heights of the element nodes.
 *
 *    @version 1.6.20120221
 *    @requires jquery.js
 *    @requires bajl.js
 *    @requires bajl.fontSizeObserver.js (optional)
 */
/* -------------------------------------------------------------------------- */
(function($) {



/* -------------------- Settings for BAJL.FlatHeights -------------------- */
/**
 * settings for {@link BAJL.TogglePanel}
 * @namespace settings for {@link BAJL.TogglePanel}
 * @fieldOf BAJL.settings
 * @property {String}  className.enabled    classname for element nodes which is under control of BAJL.FlatHeights.
 */
BAJL.settings.FlatHeights = {
    'className' : {
      'enabled' : 'bajl-flatheights-target'
  }
}



/* -------------------- jQuery.fn : BAJL_FlatHeights -------------------- */
/**
 * BAJL.FlatHeights as jQuery plugin
 * @exports $.fn.BAJL_FlatHeights as jQuery.fn.BAJL_FlatHeights
 * @param {Number} [unit]    unit number for grouping blocks.
 * @returns jQuery
 * @type jQuery
 */
$.fn.BAJL_FlatHeights = function(unit) {
  var unit   = (unit > 0) ? unit : this.size();
  var blocks = this.get();
  while (blocks.length) {
    new BAJL.FlatHeights(blocks.splice(0, unit));
  }
  return this;
}



/* -------------------- Class : BAJL.FlatHeights -------------------- */

/**
 * provides a behavior to flatten heights of element nodes.
 * @class heights flattener
 * @param {NodeList|Element[]|Element|jQuery|String} blocks    block elements to flatten heights
 * @constructor
 */
BAJL.FlatHeights = function(blocks) {
  /** block elements to flatten heights.
      @type jQuery
      @private
      @constant */
  this.$node  = $(blocks);
  /** current max height (px).
      @type Number
      @private
      */
  this.height = 0;
  
  if (BAJL.env.isDOMReady) {
    this.init();
  }
}

/* ---------- class methods/props ---------- */

/**
 * an array of instances of this class.
 * @field
 * @type BAJL.FlatHeights[]
 */
BAJL.FlatHeights.instances = []

/**
 * store an instance created from this class
 * @param {BAJL.FlatHeights} instance    an instance object to store
 * @return an instance object stored
 * @type BAJL.FlatHeights
 */
BAJL.FlatHeights.storeInstance = function(instance) {
  if (!instance || !(instance instanceof BAJL.FlatHeights)) {
    throw new TypeError('BAJL.FlatHeights.storeInstance: first argument must be an instance of BAJL.FlatHeights');
  } else {
    $(instance.$node).data('BAJL.FlatHeights.InstanceID', this.instances.push(instance) - 1);
  }
}

/**
 * get an instance created from this class
 * @param {Number|Element|jQuery|String} arg    instance-ID number, or element node which was applied to this class
 * @return BAJL.FlatHeights instance
 * @type BAJL.FlatHeights
 */
BAJL.FlatHeights.getInstance = function(arg) {
  if (typeof arg == 'number') {
    return this.instances[arg];
  } else if (arg && (arg.nodeType == Node.ELEMENT_NODE || typeof arg.jquery == 'string' || typeof arg == 'string')) {
    return this.instances[$(arg).data('BAJL.FlatHeights.InstanceID')];
  } else {
    throw new TypeError('BAJL.FlatHeights.getInstance: first argument must be an ID number, element node, jQuery object, or jQuery selector text.');
  }
}

/**
 * flatten heights of all instances.
 */
BAJL.FlatHeights.processAll = function() {
  this.instances.forEach(function(_) { _.process() });
}



/* ---------- instance methods ---------- */

/**
 * initialize.
 * @private
 */
BAJL.FlatHeights.prototype.init = function() {
  this.$node.addClass(BAJL.settings.FlatHeights.className.enabled);
  this.process();
  BAJL.FlatHeights.storeInstance(this);

  if (BAJL.FontSizeObserver) {
    BAJL.Singleton(BAJL.FontSizeObserver).addCallback('onChange', this.process, this);
  }

  // try to flatten with insistence (workaround for Webkit)
  var height = 0;
  var timer  = new BAJL.Interval(function() {
    this.process();
    if (height == this.height) {
      timer.clear();
    } else {
      height = this.height;
    }
  }, 100, this);

  // give-up after 1sec.
  new BAJL.Timeout(timer.clear, 1000, timer);
}

/**
 * process to flatten heights of the nodes.
 * @return this instance
 * @type BAJL.FlatHeights
 */
BAJL.FlatHeights.prototype.process = function() {
  this.setHeight(this.getHeight(true));
  return this;
}

/**
 * get max height value in the nodes.
 * @param {Boolean} recalibrate    if true, recalibrate the heights, this causes blocks unflatten
 * @return max height value (in pixel unit)
 * @type Number
 */
BAJL.FlatHeights.prototype.getHeight = function(recalibrate) {
  if (!recalibrate) {
    return this.height;
  } else {
    return this.$node.css ('height', 'auto')
                     .map (function()     { return this.offsetHeight })
                     .sort(function(a, b) { return b - a             })
                     .get(0) || 0;
  }
}

/**
 * change height of the nodes.
 * @param {Number} height    new height (border-box height) of the balloon, 0 means 'auto'
 * @return this instance
 * @type BAJL.FlatHeights
 */ 
BAJL.FlatHeights.prototype.setHeight = function(height) {
  height = Math.max(height, 0) || 0;
  this.$node.each(function() {
    var $node   = $(this).css('height', (height == 0) ? 'auto' : height + 'px');
    var current = $node.outerHeight();
    var revise  = 2 * height - current;

    if (current != height && revise >= 0) {
      $node.css('height', revise + 'px');
    }
  });
  this.height = height;
  return this;
}



})(BAJL.jQuery);


/* ----- flat heights setting ----- */

$(function() {  
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/2 .nttdatajpn-home-index .nttdatajpn-home-index-header').BAJL_FlatHeights();
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/2 .nttdatajpn-home-index .nttdatajpn-normal').BAJL_FlatHeights();
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/2 .nttdatajpn-home-index .nttdatajpn-link-list-A01').BAJL_FlatHeights();
       
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/3 .nttdatajpn-home-index .nttdatajpn-home-index-header').BAJL_FlatHeights();
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/3 .nttdatajpn-home-index .nttdatajpn-normal').BAJL_FlatHeights();
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/3 .nttdatajpn-home-index .nttdatajpn-link-list-A01').BAJL_FlatHeights();
       
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/4 .nttdatajpn-home-index .nttdatajpn-home-index-header').BAJL_FlatHeights();
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/4 .nttdatajpn-home-index .nttdatajpn-normal').BAJL_FlatHeights();
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/4 .nttdatajpn-home-index .nttdatajpn-link-list-A01').BAJL_FlatHeights();
}); 

/* ----- flat heights setting CCS original ----- */

$(function() {         
       $('div.nttdatajpn-layout-block .nttdatajpn-grid-1\\/3 .nttdataccs-home-index ').BAJL_FlatHeights();
}); 
