var Betry = ((window, document, undefined) => {

  const PREFIX = "BETRY"

  const Store = (() => {
    const test = PREFIX
    const store = window.localStorage
    const virtualStore = {
      setItem: noop,
      getItem: noop,
      removeItem: noop,
      virtual: true
    }

    if (store) {
      try { 
        store.setItem(test, "")
        store.removeItem(test)
        return store
      } catch (e) {
        return virtualStore
      }
    } else {
      return virtualStore
    }
  })()

  function noop() {}

  function clearStore(prefix) {
    if (!Store.virtual) {
      for (let key in Store) {
        if (0 === key.indexOf(prefix)) {
          Store.removeItem(key)
        }
      }
    }
  }

  function loadScript(src, cb) {
    var tag = "script"
    var firstScript
    var el
    cb = cb || noop
    el = document.createElement(tag)
    firstScript = document.getElementsByTagName(tag)[0]
    el.async = 1
    el.src = src
    el.onload = () => { cb() }
    el.onerror = () => { cb(new Error(`failed to load: ${src}`)) }
    firstScript.parentNode.insertBefore(el, firstScript)
  }

  // 执行代码片段
  function execCode(code, callback) {
    (new Function("!" + code + "()"))()
    callback && setTimeout(callback, 0)
  }

  function Betry() {
    this.noCache = this.loadRemote = false
    this.uri = this.key = ""
    this.callbacks = []
  }

  Betry.prototype = {
    constructor: Betry,
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

      let storeKey = `${PREFIX}:${key}:${uri}`
      let storeCode = Store.getItem(storeKey)

      this.storeKey = storeKey
      noCache || ( this.code = storeCode )

      if (!storeCode) {
        // 如果没有存储脚本，清除之前版本的key
        // 清理操作不阻塞主脚本
        setTimeout(function() {
          clearStore(key)
        }, 0)

        // 如果传递了回调函数，存放到`callbacks`中
        if (callback) {
          this.callbacks.push(callback)
        }
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
        loadRemote
      } = this

      if (code && !noCache) {
        execCode(code, callback)
      } else {
        callbacks.push(callback)
        if (!loadRemote) {
          loadScript(uri, () => {
            callbacks.forEach((item, key) => {
              item()
            })
          })
          this.loadRemote = true
        }
      }
    },
    clear(key) {
      clearStore(`${PREFIX}:${key}`)
    }
  }

  return ( config, callback ) => (new Betry()).init({
    config,
    callback
  })

})(window, document)