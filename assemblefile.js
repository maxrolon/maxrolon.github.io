var assemble = require('assemble');
var extname = require('gulp-extname');
var app = assemble();

app.data('src/data/data.json');

app.helpers('src/helpers/*.js');

app.partials('src/partials/*.hbs');

app.task('default', function() {
	return app.src('src/pages/index.hbs')
		.pipe(app.renderFile('hbs',app.cache.data.data))
		.pipe(extname())
		.pipe(app.dest('./'));
});

module.exports = app;
