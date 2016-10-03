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

let images = {}
app.helper('image', (src, ctx) => {
  return `<img alt="Embedded Image" src="data:image/jpeg;base64,${ctx['dataURL']}" data-src="${src}" />`
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
