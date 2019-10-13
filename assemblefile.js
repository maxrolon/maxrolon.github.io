"use strict"
const extname = require('gulp-extname')
const fs = require('fs')
const path = require('path')
const glob = require('glob-fs')()
const assemble = require('assemble')
const app = assemble()

app.data('./src/data/data.json')

let sections = {}
glob.readdirSync('./src/partials/*.hbs').map( file => {
  const abs = path.normalize(`${__dirname}/${file}`)
  sections[/.*\/(.[^.]*)\.hbs/.exec(abs)[1]] = fs.readFileSync(abs, 'utf8')
})

app.helper('section', (string, ctx) => {
  return app.engines['.hbs'].Handlebars.compile( sections[string] )(ctx)
})

app.helper('code', fileName => {
  return '<pre>' + fs.readFileSync(`./src/data/snippets/${fileName}.js`, 'utf8').replace(/(?:\r\n|\r|\n)/g, '<br />') + '</pre>'
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
