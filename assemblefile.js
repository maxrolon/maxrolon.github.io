"use strict"
let extname = require('gulp-extname')
let fs = require('fs')
let request = require('http')
let glob = require('glob-fs')()
let assemble = require('assemble')
let app = assemble()

app.data('./src/data/data.json')

let sections = {}
glob.readdirSync('./src/partials/*.hbs').map( path => {
  sections[/.*\/(.[^.]*)\.hbs/.exec(path)[1]] = fs.readFileSync("./"+path, 'utf8')
})

app.helper('section', (string, ctx) => {
  return app.engines['.hbs'].Handlebars.compile( sections[string] )(ctx)
})

app.helper('if_eq', (val1, val2, opts) => {
  if (val1 == val2){
    return opts.fn(this)
  } else {
    return opts.inverse(this)
  }
})

app.helper('if_not', (val1, val2, opts) => {
  if (val1 != val2){
    return opts.fn(this)
  } else {
    return opts.inverse(this)
  }
})

let images = {}
app.helper('image', (src, type, ctx) => {
  if (type == 'img'){
    return `<img src="data:image/jpeg;base64,${ctx['dataURL']}" data-src="${src}" class="image--img">`
  } else {
    return `<div style="background-image:url(data:image/jpeg;base64,${ctx['dataURL']})" data-src="${src}" ></div>`
  }
})

app.page('index.hbs',{content: fs.readFileSync('./src/pages/index.hbs','utf8') })

app.task('default', () => {
  app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(extname())
    .pipe(app.dest('./'))
    .on('error', (e) => {
      console.dir(e)
    })
})

module.exports = app;
