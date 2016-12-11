# betty.js

[![npm](https://img.shields.io/npm/v/betty.js.svg?style=flat-square)](https://www.npmjs.com/package/betty.js)
[![npm](https://img.shields.io/npm/dt/betty.js.svg?style=flat-square)](https://www.npmjs.com/package/betty.js)
[![license](https://img.shields.io/github/license/binnng/betty.js.svg?style=flat-square)](https://github.com/binnng/betty.js)
[![GitHub stars](https://img.shields.io/github/stars/binnng/betty.js.svg?style=social&label=Star)](https://github.com/binnng/betty.js)


**betty.js**是一款极轻量的、使用`localStorage`存储Javascript代码的工具。她足够轻量，足够简洁易用，足够具有扩展性，压缩后的`min.betty.js`只有1KB！使得你可以直接以`inline`引入的方式将betty用到你的项目里。

## Installation

``` shell
npm install betty.js
```

## Demo

``` javascript
var betty = Betty({
	uri: "/path/min.allLib.js",
	key: "allLib",
	noCache: false,
	xDomain: false
}, function() {
	// your code...
})
```

``` javascript
var betty = Betty({
	uri: "/path/min.allLib.version.js",
	key: "allLib",
	noCache: false,
	xDomain: false
});

betty.apply(function() {
	// your code...
})

betty.apply(function() {
	// your others code...
})
```

## Cross domain

You need set `betty padding` and `xDomain`:

index.html

``` html
<script>
window.betty = Betty({
	uri: "/path/min.allLib_with_padding.version.js",
	key: "allLib",
	xDomain: true
}, function() {
	console.log(Mobike.site)
})
</script>
```

min.allLib_with_padding.js

``` javascript
betty.store(function() {
	// your code...
})
```

Notice:
* Please set `xDomain` equal `true`
* Please set `betty padding`, just like `betty.store(....)`
* Please set `betty` as global

## Version Control

`betty.js`use `uri`and`key`to control version. You should to change `uri` if you need to update stored code.

`betty.js`store code like **BETTY:{key}:{uri}**

```
BETTY:allLib:/path/min.allLib.version.js
```

所以`key`和`uri`有一个发生变化，都会引起重新请求并存储。

## API

### `Betty`
配置betty

`var betty = Betty({config, callback[option]})`

config:

* `uri`和`key`必须设置
* `noCache`: 设置不缓存，默认为`false`
* `xDomain`: 设置跨域缓存，默认`false`，详见[跨域缓存]

### `betty.store`
添加存储的代码

``` javascript
betty.store(function() {
	...
})
```

### `betty.apply`
执行依赖缓存的代码

```
betty.apply(function() {
	...
})
```

### `betty.remove`
移除缓存的代码

```
betty.remove("allLib")
```


## 关于缓存CSS
目前还不支持，也不建议随意缓存CSS内容，还是建议直接在`head`里引入CSS，主要是基于以下的考虑：

* 动态插入CSS会使页面闪动
* CSS样式顺序管理问题

当然，一些不在首屏展示的CSS可以被缓存，但建议将其转换成JS文件合并到你的`min.allLib.js`中，可以借助这个小工具[addcss](https://github.com/binnng/addcss.js):

``` javascript
addcss("a{color: red,font-size: 12px}")
```

如果你使用FIS，可以这么处理：

``` javascript
addcss(__inline("style.css"))
```




