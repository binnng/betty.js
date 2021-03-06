fis.set('project.ignore', [
  'node_modules/**'
])

fis.match('*.es6', {
  parser: fis.plugin('babel-5.x', {
    blacklist: ['useStrict'],
    stage: 3
  })
})

fis.media("build")
  .match('*', {
    release: false
  })
  .match('betty.es6', {
    release: true,
    rExt: ".js"
  })

fis.media("min")
  .match('*', {
    release: false
  })
  .match('betty.es6', {
    optimizer: fis.plugin('uglify-js', {
      // 文档：http://lisperator.net/uglifyjs/compress
      compress: {
        // 去除console的代码
        drop_console: true,
        // discard unreachable code
        dead_code: true,
        unused: true,
        // 变量提前
        hoist_vars: true,
        hoist_funs: true,

        evaluate: true,
        booleans: true,
        conditionals: true
      }
    }),
    release: "min.betty.js",
    rExt: ".js"
  })
