"use strict";

var Battery = (function () {

  var Store = (function () {
    var name = "__s";
    var store = window.localStorage;
    var virtualStore = {
      setItem: noop,
      getItem: noop,
      removeItem: noop,
      virtual: true
    };

    if (store) {
      try {
        store.setItem(name, "");
        store.removeItem(name);
        return store;
      } catch (e) {
        return virtualStore;
      }
    } else {
      return virtualStore;
    }
  })();

  var clearStore = function clearStore(prefix) {
    if (!Store.virtual) {
      for (var key in Store) {
        if (0 === key.indexOf(prefix)) {
          Store.removeItem(key);
        }
      }
    }
  };

  function noop() {}

  function loadScript(src, cb) {
    var doc = document;
    var tag = 'script';
    var firstScript;
    var el;
    cb = cb || function () {};
    el = doc.createElement(tag);
    firstScript = doc.getElementsByTagName(tag)[0];
    el.async = 1;
    el.src = src;
    el.onload = function () {
      cb();
    };
    el.onerror = function () {
      cb(new Error('failed to load: ' + src));
    };
    firstScript.parentNode.insertBefore(el, firstScript);
  }

  // 执行代码片段
  function execCode(code, callback) {
    new Function("!" + code + "()")();
    callback && setTimeout(callback, 0);
  }

  function battery() {
    this.noCache = this.load = false;
    this.uri = this.key = "";
    this.callbacks = [];
  }

  battery.prototype = {
    constructor: battery,
    init: function init(_ref) {
      var config = _ref.config;
      var callback = _ref.callback;
      var uri = config.uri;
      var key = config.key;
      var noCache = config.noCache;

      this.uri = uri;
      this.key = key;
      noCache !== undefined && (this.noCache = noCache);

      var storeKey = key + ":" + uri;
      var storeCode = Store.getItem(storeKey);

      this.storeKey = storeKey;
      noCache || (this.code = storeCode);

      if (callback) {
        this.callbacks.push(callback);
      }

      // 如果没有存储脚本，清除之前版本的key
      if (!storeCode) {
        // 清理操作不阻塞主脚本
        setTimeout(function () {
          clearStore(key);
        }, 0);
      } else {
        callback && this.apply(callback);
      }

      return this;
    },
    add: function add(func) {
      var storeKey = this.storeKey;

      var funcString = func.toString();

      this.code = funcString;
      this.noCache || Store.setItem(storeKey, funcString);
      execCode(funcString);
    },
    apply: function apply(callback) {
      var code = this.code;
      var uri = this.uri;
      var noCache = this.noCache;
      var callbacks = this.callbacks;
      var load = this.load;

      if (code && !noCache) {
        execCode(code, callback);
      } else {
        callbacks.push(callback);
        if (!load) {
          loadScript(uri, function () {
            callbacks.forEach(function (item) {
              item();
            });
          });
          this.load = true;
        }
      }
    },
    clear: function clear(key) {
      clearStore(key);
    }
  };

  return function (config, callback) {
    return new battery().init({
      config: config,
      callback: callback
    });
  };
})();