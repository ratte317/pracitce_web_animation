console.log("read main.js");
console.log('hoge');

// import 'url-search-params-polyfill';

/**
 *
 *
 * @author Jerry Bendy <jerry@icewingcc.com>
 * @licence MIT
 *
 */

(function(self) {
  'use strict';

  var nativeURLSearchParams = (function() {
          // #41 Fix issue in RN
          try {
              if (self.URLSearchParams && (new self.URLSearchParams('foo=bar')).get('foo') === 'bar') {
                  return self.URLSearchParams;
              }
          } catch (e) {}
          return null;
      })(),
      isSupportObjectConstructor = nativeURLSearchParams && (new nativeURLSearchParams({a: 1})).toString() === 'a=1',
      // There is a bug in safari 10.1 (and earlier) that incorrectly decodes `%2B` as an empty space and not a plus.
      decodesPlusesCorrectly = nativeURLSearchParams && (new nativeURLSearchParams('s=%2B').get('s') === '+'),
      __URLSearchParams__ = "__URLSearchParams__",
      // Fix bug in Edge which cannot encode ' &' correctly
      encodesAmpersandsCorrectly = nativeURLSearchParams ? (function() {
          var ampersandTest = new nativeURLSearchParams();
          ampersandTest.append('s', ' &');
          return ampersandTest.toString() === 's=+%26';
      })() : true,
      prototype = URLSearchParamsPolyfill.prototype,
      iterable = !!(self.Symbol && self.Symbol.iterator);

  if (nativeURLSearchParams && isSupportObjectConstructor && decodesPlusesCorrectly && encodesAmpersandsCorrectly) {
      return;
  }


  /**
   * Make a URLSearchParams instance
   *
   * @param {object|string|URLSearchParams} search
   * @constructor
   */
  function URLSearchParamsPolyfill(search) {
      search = search || "";

      // support construct object with another URLSearchParams instance
      if (search instanceof URLSearchParams || search instanceof URLSearchParamsPolyfill) {
          search = search.toString();
      }
      this [__URLSearchParams__] = parseToDict(search);
  }


  /**
   * Appends a specified key/value pair as a new search parameter.
   *
   * @param {string} name
   * @param {string} value
   */
  prototype.append = function(name, value) {
      appendTo(this [__URLSearchParams__], name, value);
  };

  /**
   * Deletes the given search parameter, and its associated value,
   * from the list of all search parameters.
   *
   * @param {string} name
   */
  prototype['delete'] = function(name) {
      delete this [__URLSearchParams__] [name];
  };

  /**
   * Returns the first value associated to the given search parameter.
   *
   * @param {string} name
   * @returns {string|null}
   */
  prototype.get = function(name) {
      var dict = this [__URLSearchParams__];
      return this.has(name) ? dict[name][0] : null;
  };

  /**
   * Returns all the values association with a given search parameter.
   *
   * @param {string} name
   * @returns {Array}
   */
  prototype.getAll = function(name) {
      var dict = this [__URLSearchParams__];
      return this.has(name) ? dict [name].slice(0) : [];
  };

  /**
   * Returns a Boolean indicating if such a search parameter exists.
   *
   * @param {string} name
   * @returns {boolean}
   */
  prototype.has = function(name) {
      return hasOwnProperty(this [__URLSearchParams__], name);
  };

  /**
   * Sets the value associated to a given search parameter to
   * the given value. If there were several values, delete the
   * others.
   *
   * @param {string} name
   * @param {string} value
   */
  prototype.set = function set(name, value) {
      this [__URLSearchParams__][name] = ['' + value];
  };

  /**
   * Returns a string containg a query string suitable for use in a URL.
   *
   * @returns {string}
   */
  prototype.toString = function() {
      var dict = this[__URLSearchParams__], query = [], i, key, name, value;
      for (key in dict) {
          name = encode(key);
          for (i = 0, value = dict[key]; i < value.length; i++) {
              query.push(name + '=' + encode(value[i]));
          }
      }
      return query.join('&');
  };

  // There is a bug in Safari 10.1 and `Proxy`ing it is not enough.
  var forSureUsePolyfill = !decodesPlusesCorrectly;
  var useProxy = (!forSureUsePolyfill && nativeURLSearchParams && !isSupportObjectConstructor && self.Proxy);
  /*
   * Apply polifill to global object and append other prototype into it
   */
  Object.defineProperty(self, 'URLSearchParams', {
      value: (useProxy ?
          // Safari 10.0 doesn't support Proxy, so it won't extend URLSearchParams on safari 10.0
          new Proxy(nativeURLSearchParams, {
              construct: function(target, args) {
                  return new target((new URLSearchParamsPolyfill(args[0]).toString()));
              }
          }) :
          URLSearchParamsPolyfill)
  });

  var USPProto = self.URLSearchParams.prototype;

  USPProto.polyfill = true;

  /**
   *
   * @param {function} callback
   * @param {object} thisArg
   */
  USPProto.forEach = USPProto.forEach || function(callback, thisArg) {
      var dict = parseToDict(this.toString());
      Object.getOwnPropertyNames(dict).forEach(function(name) {
          dict[name].forEach(function(value) {
              callback.call(thisArg, value, name, this);
          }, this);
      }, this);
  };

  /**
   * Sort all name-value pairs
   */
  USPProto.sort = USPProto.sort || function() {
      var dict = parseToDict(this.toString()), keys = [], k, i, j;
      for (k in dict) {
          keys.push(k);
      }
      keys.sort();

      for (i = 0; i < keys.length; i++) {
          this['delete'](keys[i]);
      }
      for (i = 0; i < keys.length; i++) {
          var key = keys[i], values = dict[key];
          for (j = 0; j < values.length; j++) {
              this.append(key, values[j]);
          }
      }
  };

  /**
   * Returns an iterator allowing to go through all keys of
   * the key/value pairs contained in this object.
   *
   * @returns {function}
   */
  USPProto.keys = USPProto.keys || function() {
      var items = [];
      this.forEach(function(item, name) {
          items.push(name);
      });
      return makeIterator(items);
  };

  /**
   * Returns an iterator allowing to go through all values of
   * the key/value pairs contained in this object.
   *
   * @returns {function}
   */
  USPProto.values = USPProto.values || function() {
      var items = [];
      this.forEach(function(item) {
          items.push(item);
      });
      return makeIterator(items);
  };

  /**
   * Returns an iterator allowing to go through all key/value
   * pairs contained in this object.
   *
   * @returns {function}
   */
  USPProto.entries = USPProto.entries || function() {
      var items = [];
      this.forEach(function(item, name) {
          items.push([name, item]);
      });
      return makeIterator(items);
  };


  if (iterable) {
      USPProto[self.Symbol.iterator] = USPProto[self.Symbol.iterator] || USPProto.entries;
  }


  function encode(str) {
      var replace = {
          '!': '%21',
          "'": '%27',
          '(': '%28',
          ')': '%29',
          '~': '%7E',
          '%20': '+',
          '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, function(match) {
          return replace[match];
      });
  }

  function decode(str) {
      return str
          .replace(/[ +]/g, '%20')
          .replace(/(%[a-f0-9]{2})+/ig, function(match) {
              return decodeURIComponent(match);
          });
  }

  function makeIterator(arr) {
      var iterator = {
          next: function() {
              var value = arr.shift();
              return {done: value === undefined, value: value};
          }
      };

      if (iterable) {
          iterator[self.Symbol.iterator] = function() {
              return iterator;
          };
      }

      return iterator;
  }

  function parseToDict(search) {
      var dict = {};

      if (typeof search === "object") {
          // if `search` is an array, treat it as a sequence
          if (isArray(search)) {
              for (var i = 0; i < search.length; i++) {
                  var item = search[i];
                  if (isArray(item) && item.length === 2) {
                      appendTo(dict, item[0], item[1]);
                  } else {
                      throw new TypeError("Failed to construct 'URLSearchParams': Sequence initializer must only contain pair elements");
                  }
              }

          } else {
              for (var key in search) {
                  if (search.hasOwnProperty(key)) {
                      appendTo(dict, key, search[key]);
                  }
              }
          }

      } else {
          // remove first '?'
          if (search.indexOf("?") === 0) {
              search = search.slice(1);
          }

          var pairs = search.split("&");
          for (var j = 0; j < pairs.length; j++) {
              var value = pairs [j],
                  index = value.indexOf('=');

              if (-1 < index) {
                  appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));

              } else {
                  if (value) {
                      appendTo(dict, decode(value), '');
                  }
              }
          }
      }

      return dict;
  }

  function appendTo(dict, name, value) {
      var val = typeof value === 'string' ? value : (
          value !== null && value !== undefined && typeof value.toString === 'function' ? value.toString() : JSON.stringify(value)
      );

      // #47 Prevent using `hasOwnProperty` as a property name
      if (hasOwnProperty(dict, name)) {
          dict[name].push(val);
      } else {
          dict[name] = [val];
      }
  }

  function isArray(val) {
      return !!val && '[object Array]' === Object.prototype.toString.call(val);
  }

  function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
  }

})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));



var path = location.pathname;
console.log(path);

$(document).ready(function() {
    $(window).scroll(function() {
    //   if ($(this).scrollTop() > 0) {
    //     $('.header-wrapper').css('opacity', 1);
    //     $('.header-wrapper').css('background-color', "white");
    //   } else {
    //     $('.header-wrapper').css('opacity', 1);
    //   }
    console.log(path);
    console.log($(this).scrollTop());

      if (path == "/" && $(this).scrollTop() < 10){
        $('.header-wrapper').css('background-color', "transparent");
      }else{
        $('.header-wrapper').css('background-color', "white");
      }
    });
  });



var btns = document.querySelectorAll('#btns dd');
// コンテンツになるliを取得
var contents = document.querySelectorAll('#year2020, #year2019, #year2018, #year2017, #year2016, #year2015');
// var contentsBtn = document.querySelectorAll('#year2020btn, #year2019btn, #year2018btn, #year2017btn, #year2016btn, #year2015btn');
// var contentsBtn = document.querySelectorAll('.\\31020, .\\31019, .\\31018, .\\31017, .\\31016, .\\31015');
// var alltimeBtn = document.getElementById("all-time-btn");
console.log(btns);
// 変数を宣言：選択された色

var selected;

//test.html?param1=test&param2=sampleの場合
 
//window.location.searchをURLSearchParamsに渡す
var urlParams = new URLSearchParams(window.location.search);
 
//param1の値を取得する
console.log(urlParams.get('param'));

window.onload = function(){
    // ページ読み込み時に実行したい処理
    selected = urlParams.get('param');
    selectedbtn = urlParams.get('param') + "btn";
    // console.log(selected);
    console.log(contents.length);

    if(selected=="all-time" || selected==null) {
      console.log("!");
        for (var j = 0; j < contents.length; j++) {
            // 一旦notActiveのクラスを削除
            selectedbtn = contents[j] +"btn";
            contents[j].classList.remove('notActive');
            
            // alltimeBtn.classList.add("Active-btn");
            console.log("!");
            // console.log(alltimeBtn.classList);
  
          }

    }else{
    
    for (var j = 0; j < contents.length; j++) {
      contents[j].classList.remove('notActive');
      // 選択されたボタンの色を除外して
      if (contents[j].classList.contains(selected)) {
        continue;
      }
      // notActiveクラスを付与
      contents[j].classList.add('notActive');
      // contentsBtn[j].classList.add("Active-btn");
    }
   }
  }

for (var i = 0; i < btns.length; i++) {
  // ボタンがクリックされたら
  console.log("clicked");
  btns[i].addEventListener('click', function () {
    // クリックされたボタンのクラスを取得。選択された色が代入される。
    selected = this.className;
    console.log(selected);

    if(selected=="all-time"){
        for (var j = 0; j < contents.length; j++) {
            // 一旦notActiveのクラスを削除
            contents[j].classList.remove('notActive');
            // btns[j+1].classList.remove('Active-btn');
            // alltimeBtn.classList.add("Active-btn");

  
          }

    }else{
    
    for (var j = 0; j < contents.length; j++) {
      // 一旦notActiveのクラスを削除
      contents[j].classList.remove('notActive');
      // btns[j+1].classList.remove('Active-btn');
      // alltimeBtn.classList.remove("Active-btn");
      // 選択されたボタンの色を除外して
      if (contents[j].classList.contains(selected)) {
        // btns[j+1].classList.add('Active-btn');
        continue;
      }
      // notActiveクラスを付与
      contents[j].classList.add('notActive');

    }
   }   
  });
}