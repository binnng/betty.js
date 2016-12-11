# betty.js

[![npm](https://img.shields.io/npm/v/betty.js.svg?style=flat-square)](https://www.npmjs.com/package/betty.js)
[![npm](https://img.shields.io/npm/dt/betty.js.svg?style=flat-square)](https://www.npmjs.com/package/betty.js)
[![license](https://img.shields.io/github/license/binnng/betty.js.svg?style=flat-square)](https://github.com/binnng/betty.js)
[![GitHub stars](https://img.shields.io/github/stars/binnng/betty.js.svg?style=social&label=Star)](https://github.com/binnng/betty.js)


**betty.js**是一款极轻量的、使用`localStorage`存储Javascript代码的工具。她足够轻量，足够简洁易用，足够具有扩展性，压缩后的`min.betty.js`只有1KB！使得你可以直接以`inline`引入的方式将betty用到你的项目里。

## 安装

``` shell
npm install betty.js
```

拷贝`min.betty.js`的代码，使用`inline`的方式引入项目里：

``` html
<script type="text/javascript">
	var Betty=function....
</script>
```

如果你的项目基于[FIS](http://fis.baidu.com)，可以这么引入：

``` html
<script type="text/javascript" src="/path/min.betty.js?__inline"></script>
```

## 示例

### 方式一：

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
### 方式二：

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

以上两种方式的代码执行一遍之后，`min.allLib.js`的内容就会被betty存储到localStorage里，第二次执行时就不会从网络请求`min.allLib.js`，直接从缓存中读取并执行。

至于为何除了第一种写法，还支持了第二种写法？是因为在前端工程里，可以考虑把定义`betty`的操作放到通用的layout里，把`betty.apply`写进每个页面对应的js文件里。

当然，你可以自由选择自己的喜好。

## 跨域缓存

`betty.js`会默认使用`Ajax`请求待缓存的JS资源，如果跨域则会请求出错。这时候你需要设置`betty padding`和`xDomain`来让跨域请求JS资源被支持：

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

注意：
* 请设置`xDomain`为`true`
* 请在待缓存的JS文件中设置`betty padding`，如以上的`betty.store(....)`
* 请设置`betty`为全局变量

## 版本管理

`betty.js`绝对依赖`uri`和`key`来管理JS版本。如果你的代码需要更新，请更换`uri`的值，新的JS就会被请求，然后代码内容会被重新存储到LocalStorage里，并且会**删掉旧版本的代码**。

`betty.js`会以**BETTY:{key}:{uri}**格式存储JS代码，例如：

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




