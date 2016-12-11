var Betty = ((window, document, undefined) => {

  const PREFIX = "BETTY"

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

  function throwError(msg) {
    throw new Error(msg)
  }

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
    el.onerror = () => { cb(throwError(`failed to load: ${src}`)) }
    firstScript.parentNode.insertBefore(el, firstScript)
  }

  function loadScriptWithAjax(src, success) {
    var xhr = new XMLHttpRequest()
    xhr.open("get", src)
    xhr.send()
    xhr.addEventListener("error", error)
    xhr.addEventListener("load", ref => {
      var target = ref.target
      target.status >= 400 ? error(target) : success(target.response)
    })
    function error() {
      return throwError(`failed to load: ${src}`)
    }
  }

  // 执行代码片段
  function execCode(code, callback) {
    (new Function("!" + code + "()"))()
    callback && setTimeout(callback, 0)
  }

  function Betty() {
    this.noCache = this.loadRemote = this.stored = this.xDomain = false
    this.uri = this.key = ""
    this.callbacks = []
  }

  Betty.prototype = {
    constructor: Betty,
    init({
      config,
      callback
    }) {

      let {
        uri,
        key,
        noCache,
        xDomain
      } = config

      this.uri = uri
      this.key = key
      noCache !== undefined && ( this.noCache = noCache )
      xDomain !== undefined && ( this.xDomain = xDomain )

      let storeKey = `${PREFIX}:${key}:${uri}`
      let storedCode = Store.getItem(storeKey)

      this.storeKey = storeKey
      noCache || ( this.code = storedCode )

      if (!storedCode) {
        // 如果没有存储脚本，清除之前版本的key
        // 清理操作不阻塞主脚本
        setTimeout(() => {
          this.remove(key)
        }, 0)

        // 如果传递了回调函数，存放到`callbacks`中
        if (callback) {
          this.callbacks.push(callback)
        }
      } else {
        this.stored = true
        callback && this.apply(callback)
      }

      return this
    },
    store(func) {
      let {
        storeKey
      } = this
      let funcString = func.toString()

      this.code = funcString
      this.stored = true
      this.noCache || Store.setItem(storeKey, funcString)
      execCode(funcString)
      return this
    },
    apply(callback) {
      let {
        code,
        uri,
        noCache,
        callbacks,
        loadRemote,
        xDomain
      } = this

      let _this = this

      function cb() {
        callbacks.forEach((item, key) => {
          item()
        })
        if (!_this.stored) {
          throwError(`check the padding of ${uri}`)
        }
      }

      if (code && !noCache) {
        execCode(code, callback)
      } else {
        callbacks.push(callback)
        if (!loadRemote) {
          xDomain ? loadScript(uri, cb) : loadScriptWithAjax(uri, (res) => {
            this.store(`function(){${res}}`)
            cb()
          })
          this.loadRemote = true
        }
      }
      return this
    },
    remove(key) {
      clearStore(`${PREFIX}:${key}`)
      return this
    }
  }

  return ( config, callback ) => (new Betty()).init({
    config,
    callback
  })

})(window, document)