var Battery = (() => {

  const Store = (() => {
    const name = "__s"
    const store = window.localStorage
    const virtualStore = {
      setItem: noop,
      getItem: noop,
      removeItem: noop,
      virtual: true
    }

    if (store) {
      try { 
        store.setItem(name, "")
        store.removeItem(name)
        return store
      } catch (e) {
        return virtualStore
      }
    } else {
      return virtualStore
    }
  })()

  const clearStore = (prefix) => {
    if (!Store.virtual) {
      for (let key in Store) {
        if (0 === key.indexOf(prefix)) {
          Store.removeItem(key)
        }
      }
    }
  }

  function noop() {}

  function loadScript(src, cb) {
    var doc = document
    var tag = 'script'
    var firstScript
    var el
    cb = cb || function() {}
    el = doc.createElement(tag)
    firstScript = doc.getElementsByTagName(tag)[0]
    el.async = 1
    el.src = src
    el.onload = function () { cb() }
    el.onerror = function () { cb(new Error('failed to load: ' + src)) }
    firstScript.parentNode.insertBefore(el, firstScript)
  }

  // 执行代码片段
  function execCode(code, callback) {
    (new Function("!" + code + "()"))()
    callback && setTimeout(callback, 0)
  }

  function battery() {
    this.noCache = this.load = false
    this.uri = this.key = ""
    this.callbacks = []
  }

  battery.prototype = {
    constructor: battery,
    init({
      config,
      callback
    }) {

      let {
        uri,
        key,
        noCache
      } = config

      this.uri = uri
      this.key = key
      noCache !== undefined && ( this.noCache = noCache )

      let storeKey = `${key}:${uri}`
      let storeCode = Store.getItem(storeKey)

      this.storeKey = storeKey
      noCache || ( this.code = storeCode )

      if (callback) {
        this.callbacks.push(callback)
      }

      // 如果没有存储脚本，清除之前版本的key
      if (!storeCode) {
        // 清理操作不阻塞主脚本
        setTimeout(function() {
          clearStore(key)
        }, 0)
      } else {
        callback && this.apply(callback)
      }

      return this
    },
    add(func) {
      let {
        storeKey
      } = this
      let funcString = func.toString()

      this.code = funcString
      this.noCache || Store.setItem(storeKey, funcString)
      execCode(funcString)
    },
    apply(callback) {
      let {
        code,
        uri,
        noCache,
        callbacks,
        load
      } = this

      if (code && !noCache) {
        execCode(code, callback)
      } else {
        callbacks.push(callback)
        if (!load) {
          loadScript(uri, () => {
            callbacks.forEach((item) => {
              item()
            })
          })
          this.load = true
        }
      }
    },
    clear(key) {
      clearStore(key)
    }
  }

  return ( config, callback ) => (new battery()).init({
    config,
    callback
  })

})()